"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitInquiry, type ActionState } from "@/lib/actions/actions";

const initialState: ActionState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full bg-blue-600 text-white py-3 rounded-xl text-lg font-semibold transition ${
        pending ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
      }`}
    >
      {pending ? "Skickar..." : "Skicka förfrågan"}
    </button>
  );
}

export default function ContactForm() {
  const [state, formAction] =
    useActionState<ActionState, FormData>(submitInquiry, initialState);

  return (
    <>
      {state.status === "success" && (
        <div className="bg-green-100 text-green-800 px-4 py-3 rounded-md border border-green-300 shadow-sm">
          ✅ Din förfrågan har skickats!
        </div>
      )}
      {state.status === "error" && (
        <div className="bg-red-100 text-red-800 px-4 py-3 rounded-md border border-red-300 shadow-sm">
          ❌ {state.message ?? "Något gick fel. Försök igen."}
        </div>
      )}

      <form action={formAction} className="space-y-6 mt-8 bg-white p-6 rounded-2xl shadow-lg border" noValidate>
        <input type="hidden" name="source" value="link" />

        <div>
          <label htmlFor="name" className="block font-medium text-gray-700 mb-1">
            Ditt namn
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            aria-invalid={Boolean(state.errors?.name)}
            aria-describedby={state.errors?.name ? "name-error" : undefined}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          {state.errors?.name && (
            <span id="name-error" className="text-red-600 text-sm block mt-1">
              {state.errors.name}
            </span>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block font-medium text-gray-700 mb-1">
            E-postadress
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="email@Google.se"
            required
            aria-invalid={Boolean(state.errors?.email)}
            aria-describedby={state.errors?.email ? "email-error" : undefined}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          {state.errors?.email && (
            <span id="email-error" className="text-red-600 text-sm block mt-1">
              {state.errors.email}
            </span>
          )}
        </div>

        <div>
          <label htmlFor="link" className="block font-medium text-gray-700 mb-1">
            Länk-URL
          </label>
          <input
            type="url"
            id="link"
            name="link"
            required
            aria-invalid={Boolean(state.errors?.link)}
            aria-describedby={state.errors?.link ? "link-error" : undefined}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          {state.errors?.link && (
            <span id="link-error" className="text-red-600 text-sm block mt-1">
              {state.errors.link}
            </span>
          )}
        </div>

        <div>
          <label htmlFor="message" className="block font-medium text-gray-700 mb-1">
            Vad vill du köpa?
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            aria-invalid={Boolean(state.errors?.message)}
            aria-describedby={state.errors?.message ? "message-error" : undefined}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          {state.errors?.message && (
            <span id="message-error" className="text-red-600 text-sm block mt-1">
              {state.errors.message}
            </span>
          )}
        </div>

        <SubmitButton />
      </form>
    </>
  );
}
