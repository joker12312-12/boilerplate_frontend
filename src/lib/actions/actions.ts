"use server";

import validator from "validator";
import { PurchaseFormSchema, type PurchaseFormData } from "../helper_functions/purchaseForm";

// Accept optional `link` + `source`
type ExtendedData = PurchaseFormData & { link?: string | null; source?: string | null };

export type ActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Partial<Record<"name" | "email" | "message" | "link" | "source", string>>;
};

const sanitize = (str: string, maxLen = 1000) =>
  (str || "").replace(/[<>]/g, "").trim().slice(0, maxLen);

const getString = (fd: FormData, key: string): string => {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
};

const getOptionalString = (fd: FormData, key: string): string | null => {
  const v = fd.get(key);
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export async function submitInquiry(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw: ExtendedData = {
    name: getString(formData, "name"),
    email: getString(formData, "email"),
    message: getString(formData, "message"),
    link: getOptionalString(formData, "link"),      // optional
    source: getOptionalString(formData, "source"),  // "ad" | "link" (optional)
  };

  // Validate core fields with Zod
  const parsed = PurchaseFormSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: ActionState["errors"] = {};
    for (const err of parsed.error.errors) {
      const field = err.path[0] as keyof PurchaseFormData; // "name" | "email" | "message"
      if (!errors[field]) errors[field] = err.message;
    }
    return { status: "error", message: "Please fix the errors.", errors };
  }

  // Extra hardening / sanitize
  const safeName = sanitize(parsed.data.name, 100);
  const safeEmail = sanitize(parsed.data.email, 100);
  const safeMessage = sanitize(raw.message ?? "", 1000);
  const safeLink = raw.link ? sanitize(raw.link, 2048) : null;

  if (!safeName || !safeEmail || !safeMessage) {
    return { status: "error", message: "Missing required fields." };
  }
  if (!validator.isEmail(safeEmail)) {
    return {
      status: "error",
      message: "Invalid email.",
      errors: { email: "Invalid email address" },
    };
  }
  if (safeLink && !validator.isURL(safeLink, { require_protocol: true })) {
    return {
      status: "error",
      message: "Invalid link URL.",
      errors: { link: "Please enter a valid URL (including https://)" },
    };
  }

  // Recipient from env
  const recipientEmail =
    (process.env.FORM_RECEIVER_EMAILS || "")
      .split(",")
      .map((e) => e.trim())
      .find((e) => validator.isEmail(e)) ?? null;

  if (!recipientEmail) {
    console.error("[submitInquiry] No valid recipient email in FORM_RECEIVER_EMAILS");
    return { status: "error", message: "Email is not configured." };
  }

  // Compose email
  const site = process.env.NEXT_PUBLIC_HOSTNAME || "Website";
  const kind = raw.source ?? (safeLink ? "link" : "ad");
  const subject =
    kind === "link" ? `New Link Purchase request from ${site}` : `New Ad Inquiry from ${site}`;
  const transaction_name = kind === "link" ? "Link Purchase" : "Ad Inquiry";

  const plainText =
    `New ${kind === "link" ? "link purchase" : "ad inquiry"} from ${safeName} (${safeEmail})\n\n` +
    (safeLink ? `Link: ${safeLink}\n\n` : "") +
    `Message: ${safeMessage}`;

  const htmlText =
    `<p><strong>New ${kind === "link" ? "link purchase" : "ad inquiry"} from ${safeName} (${safeEmail})</strong></p>` +
    (safeLink ? `<p><strong>Link:</strong> ${safeLink}</p>` : "") +
    `<p><strong>Message:</strong></p><p>${safeMessage}</p>`;

  const payload = {
    transaction_type: "email",
    transaction_name,
    subject,
    from: {
      name: site,
      email: process.env.RULE_FROM_EMAIL || "noreply@rule.se",
    },
    to: { email: recipientEmail },
    content: {
      plain: Buffer.from(plainText, "utf8").toString("base64"),
      html: Buffer.from(htmlText, "utf8").toString("base64"),
    },
  };

  try {
    const res = await fetch("https://app.rule.io/api/v2/transactionals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RULE_API_KEY}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    let json: unknown;
    try {
      json = await res.json();
    } catch (e) {
      console.error("[submitInquiry] Failed to parse Rule.io response:", e);
      return { status: "error", message: "Invalid response from email provider." };
    }

    if (!res.ok) {
      console.error("[Rule.io Error]", JSON.stringify(json, null, 2));
      return { status: "error", message: "Failed to send email. Please try again later." };
    }

    return { status: "success", message: "Your request has been submitted!" };
  } catch (err) {
    console.error("[submitInquiry] Unexpected error:", err);
    return { status: "error", message: "Internal Server Error. Please try again." };
  }
}
