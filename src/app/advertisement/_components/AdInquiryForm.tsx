"use client";

import { useFormStatus } from "react-dom";

import { submitInquiry, type ActionState } from "../../../lib/actions/actions";
import User from "@/app/components/icons/user";
import Email from "@/app/components/icons/email";
import Doc from "@/app/components/icons/doc";
import { useActionState } from "react";

const initialState: ActionState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full flex justify-center items-center gap-2 bg-indigo-600 text-white py-3 rounded-xl text-lg font-semibold transition ${
        pending ? "opacity-50 cursor-not-allowed" : "hover:bg-indigo-700 cursor-pointer"
      }`}
    >
      {pending && (
        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      )}
      {pending ? "Skickar..." : "Skicka förfrågan"}
    </button>
  );
}

export default function AdInquiryForm() {
  const [state, formAction] = useActionState(submitInquiry, initialState);

  return (
    <section className="space-y-5">
      {state.status === "success" && (
        <div className="bg-green-50 text-green-700 px-4 py-3 rounded-md border border-green-200 shadow-sm flex flex-col items-center justify-center gap-2">
          <span className="text-2xl">✅</span>
          <span className="text-base font-semibold">Din förfrågan har skickats!</span>
          <span className="text-sm text-green-800">Håll utkik i din e‑post, vi hör av oss inom 1–2 dagar.</span>
        </div>
      )}
      {state.status === "error" && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-md border border-red-200 shadow-sm flex items-center justify-center gap-2">
          <span className="text-2xl">❌</span>
          <span>{state.message ?? "Något gick fel. Försök igen."}</span>
        </div>
      )}

      <form action={formAction} className="space-y-5" noValidate>
        {/* Name */}
        <div className="relative">
          <label htmlFor="name" className="block font-medium text-gray-700 mb-1">Ditt namn</label>
          <div className="flex items-center">
            <span className="mr-2 text-gray-400 flex items-center">
              <User width={20} color="#a3a3a3" />
            </span>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="John Doe"
              aria-invalid={!!state.errors?.name}
              aria-describedby={state.errors?.name ? "name-error" : undefined}
              className="w-full px-4 py-2 rounded-md border border-gray-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
            />
          </div>
          {state.errors?.name && (
            <span id="name-error" className="text-red-600 text-sm block mt-1">{state.errors.name}</span>
          )}
        </div>

        {/* Email */}
        <div className="relative">
          <label htmlFor="email" className="block font-medium text-gray-700 mb-1">E-postadress</label>
          <div className="flex items-center">
            <span className="mr-2 text-gray-400 flex items-center">
              <Email width={20} color="#a3a3a3" />
            </span>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="ads@request.com"
              aria-invalid={!!state.errors?.email}
              aria-describedby={state.errors?.email ? "email-error" : undefined}
              className="w-full px-4 py-2 rounded-md border border-gray-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
            />
          </div>
          {state.errors?.email && (
            <span id="email-error" className="text-red-600 text-sm block mt-1">{state.errors.email}</span>
          )}
        </div>

        {/* Meddelande */}
        <div className="relative">
          <label htmlFor="message" className="block font-medium text-gray-700 mb-1">
            Berätta om din kampanj eller förfrågan. Inkludera alla länkar här.
          </label>
          <div className="flex items-start">
            <span className="mr-2 text-gray-400 pt-2 flex items-center">
              <Doc width={20} color="#a3a3a3" />
            </span>
            <textarea
              id="message"
              name="message"
              rows={4}
              aria-invalid={!!state.errors?.message}
              aria-describedby={state.errors?.message ? "message-error" : undefined}
              className="w-full px-4 py-2 rounded-md border border-gray-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
            />
          </div>
          {state.errors?.message && (
            <span id="message-error" className="text-red-600 text-sm block mt-1">{state.errors.message}</span>
          )}
        </div>

        <SubmitButton />
      </form>
    </section>
  );
}
