import type { Metadata } from 'next';
import { getSeo, buildMetadataFromSeo } from '@/lib/seo/seo';

export async function generateMetadata(): Promise<Metadata> {
  const payload = await getSeo('/work/');

  if (!payload?.nodeByUri) {
    return {
      title: `Work | ${process.env.NEXT_PUBLIC_HOSTNAME}`,
      description: "Utforska karriärmöjligheter och arbeta med vårt team.",
      robots: { index: true, follow: true },
    };
  }

  const meta = buildMetadataFromSeo(payload, {
    metadataBase: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: process.env.NEXT_PUBLIC_SITENAME,
  });

  // fallback description if empty
  if (!meta.description) {
    meta.description = "Utforska karriärmöjligheter och arbeta med vårt team.";
  }

  return meta;
}




const page = () => {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-lg w-full text-center">
        <h1 className="text-3xl font-bold text-blue-800 mb-4">
          Jobbansökningar
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Tack för ditt intresse att ansluta till vårt team!
          <br />
          <span className="block mt-2 font-semibold text-red-500">
            Vi anställer inte för tillfället.
          </span>
        </p>
        <div className="flex flex-col items-center gap-2 mb-6">
          <span className="text-4xl mb-2">🚫</span>
          <p className="text-gray-500">
            Inga lediga tjänster just nu. Men gå inte långt!
          </p>
          <p className="text-gray-500">
            Håll ett öga på den här sidan för framtida möjligheter. Vi uppdaterar denna
            sida varje vecka
          </p>
        </div>
      </div>
    </main>
  );
};

export default page;
