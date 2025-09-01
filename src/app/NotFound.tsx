'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NotFound() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen flex-col items-center justify-center px-4">
      <p className="text-center font-medium text-xl">
        Den begärda sidan <code className="bg-gray-200 px-1 py-0.5 rounded">{pathname}</code> finns inte.
      </p>
      <p className="mt-4 text-center font-medium text-xl">
        Ge inte upp, du kan hitta fler inlägg här:
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-2xl bg-blue-600 px-6 py-3 text-white font-semibold transition hover:bg-blue-700"
      >
        Gå till startsidan
      </Link>
    </div>
  );
}
