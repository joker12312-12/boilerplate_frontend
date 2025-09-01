// src/lib/signedFetch.ts
import "server-only"; 

import crypto from "node:crypto";

type SignOptions = {
  keyId?: string;           // optional logical key name
  secret: string;           // HMAC secret
  method: string;
  url: string;              // absolute URL
  body?: string;            // raw string; if JSON, call JSON.stringify first
  timestamp?: number;       // ms since epoch (defaults: Date.now())
  nonce?: string;           // random string (defaults: crypto.randomUUID())
};

function canonicalize(opts: SignOptions) {
  const u = new URL(opts.url);
  // Use method, path+search, timestamp, nonce, body
  const method = opts.method.toUpperCase();
  const path = u.pathname + (u.search || "");
  const ts = String(opts.timestamp ?? Date.now());
  const nonce = opts.nonce ?? crypto.randomUUID();
  const body = opts.body ?? "";
  const msg = [method, path, ts, nonce, body].join("\n");
  return { method, path, ts, nonce, body, msg };
}

export function sign(opts: SignOptions) {
  const { ts, nonce, msg } = canonicalize(opts);
  const h = crypto.createHmac("sha256", opts.secret).update(msg).digest("base64");
  return {
    signature: h,
    timestamp: ts,
    nonce,
    keyId: opts.keyId ?? "default",
  };
}

/**
 * Signed fetch to WordPress (server-only).
 * - You pass JSON or any string body; this function signs and sets headers.
 */
export async function signedFetch(
  url: string,
  init: RequestInit & { json?: unknown } = {},
  cfg: { secret?: string; keyId?: string } = {}
): Promise<Response> {
  const secret = cfg.secret ?? process.env.HMAC_SHARED_SECRET!;
  if (!secret) throw new Error("Missing HMAC_SHARED_SECRET");

  // Prepare body string once
  let bodyStr: string | undefined = undefined;
  const headers = new Headers(init.headers ?? {});
  const method = (init.method ?? "GET").toUpperCase();

  if (init.json !== undefined) {
    bodyStr = JSON.stringify(init.json);
    headers.set("Content-Type", "application/json");
  } else if (init.body !== undefined) {
    if (typeof init.body === "string") bodyStr = init.body;
    else if (init.body instanceof Uint8Array) bodyStr = Buffer.from(init.body).toString("utf8");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    else if (init.body instanceof Blob) bodyStr = await (init.body as any).text();
    else throw new Error("signedFetch: unsupported body type");
  }

  const { signature, timestamp, nonce, keyId } = sign({
    secret,
    method,
    url,
    body: bodyStr ?? "",
    keyId: cfg.keyId,
  });

  headers.set("X-Signature", signature);
  headers.set("X-Timestamp", timestamp);
  headers.set("X-Nonce", nonce);
  headers.set("X-Key-Id", keyId);

  return fetch(url, {
    ...init,
    method,
    headers,
    body: bodyStr ?? init.body,
  });
}

/**
 * Verify incoming signed request (e.g., in /api/revalidate).
 * Returns { ok, reason } and you pass the parsed body forward if ok.
 *
 * maxSkewSec: allowable clock skew (default 300s)
 * seenNonce: function to check/store nonce to prevent replay (provide Redis/memory)
 */
export async function verifyIncomingSignature(req: Request, opts: {
  secret?: string;
  maxSkewSec?: number;
  seenNonce?: (nonce: string, ttlSec: number) => Promise<boolean>; // return true if nonce is NEW and stored
}) {
  const secret = opts.secret ?? process.env.HMAC_SHARED_SECRET!;
  if (!secret) return { ok: false, reason: "Missing secret" };

  const u = new URL(req.url);
  const method = req.method.toUpperCase();
  const ts = req.headers.get("X-Timestamp");
  const nonce = req.headers.get("X-Nonce");
  const sig = req.headers.get("X-Signature");

  if (!ts || !nonce || !sig) return { ok: false, reason: "Missing signature headers" };

  const now = Date.now();
  const skew = Math.abs(now - Number(ts));
  const maxSkew = (opts.maxSkewSec ?? 300) * 1000;
  if (!Number.isFinite(Number(ts)) || skew > maxSkew) {
    return { ok: false, reason: "Stale or invalid timestamp" };
  }

  // IMPORTANT: read raw body text (only once)
  const bodyText = await req.text();

  const path = u.pathname + (u.search || "");
  const msg = [method, path, ts, nonce, bodyText].join("\n");
  const expected = crypto.createHmac("sha256", secret).update(msg).digest("base64");

  // timing-safe compare
  const okSig =
    expected.length === sig.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));

  if (!okSig) return { ok: false, reason: "Bad signature" };

  // replay protection
  if (opts.seenNonce) {
    const stored = await opts.seenNonce(nonce, Math.ceil((maxSkew - skew) / 1000));
    if (!stored) return { ok: false, reason: "Replay detected" };
  }

  // parse JSON if applicable (your route can re-parse as needed)
  let json: unknown = undefined;
  try {
    json = bodyText ? JSON.parse(bodyText) : undefined;
  } catch {
    // fine; not all endpoints need JSON
  }

  return { ok: true, bodyText, json };
}