import { buildMetadataFromSeo, getSeo } from '@/lib/seo/seo';
import type { Metadata } from 'next';


export async function generateMetadata(): Promise<Metadata> {
  const payload = await getSeo('/about/');

  if (!payload?.nodeByUri) {
    return {
      title: `About | ${process.env.NEXT_PUBLIC_HOSTNAME}`,
      description: "Lär dig mer om oss.",
      robots: { index: true, follow: true },
    };
  }

  const meta = buildMetadataFromSeo(payload, {
    metadataBase: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: process.env.NEXT_PUBLIC_SITENAME,
  });

  // fallback description if empty
  if (!meta.description) {
    meta.description = "Lär dig mer om oss, vårt uppdrag och vad vi gör.";
  }

  return meta;
}

const AboutPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">Om oss</h1>

      <section className="space-y-6 text-lg leading-relaxed text-gray-800">
        <p>
          Välkommen till <strong>{process.env.NEXT_PUBLIC_HOSTNAME}</strong>, en
          digital destination för aktuell, faktabaserad och insiktsfull rapportering. Vårt
          team drivs av en gemensam passion för att leverera nyheter
          och analyser av hög kvalitet som håller vår publik informerad, engagerad och steget före.
        </p>

        <p>
          Vi tror på journalistikens kraft att forma förståelse och
          skapa klarhet i en snabbt föränderlig värld. På{' '}
          <strong>{process.env.NEXT_PUBLIC_HOSTNAME}</strong> prioriterar vi
          noggrannhet, integritet och relevans i allt vi publicerar—oavsett
          om det är nyheter, fördjupande reportage eller featureartiklar.
        </p>

        <p>
          Vårt uppdrag är enkelt: att vara en pålitlig och heltäckande källa
          till de senaste nyheterna och utvecklingarna. Vi utforskar viktiga frågor med djup
          och sammanhang för att hjälpa våra läsare navigera i dagens snabbrörliga
          informationslandskap.
        </p>

        <p>
          Vårt redaktionella team består av erfarna reportrar, forskare
          och redaktörer som bidrar med en bred uppsättning kompetenser och perspektiv till
          vår bevakning. Vi följer noggrant globala händelser, trender och berättelser,
          så att det som är viktigast når dig utan brus eller partiskhet.
        </p>

        <p>
          Genom tydligt och engagerande berättande vill vi göra komplexa ämnen
          tillgängliga för alla—från nyfikna läsare till erfarna yrkespersoner.
          Vi är engagerade i att tillhandahålla innehåll som informerar beslut, väcker
          samtal och bygger medvetenhet i en sammankopplad värld.
        </p>

        <p>
          På <strong>{process.env.NEXT_PUBLIC_HOSTNAME}</strong> ser vi
          kunskap som makt—och vi finns här för att stödja våra läsare med
          den information de behöver för att hålla sig informerade och trygga i sin
          förståelse av världen omkring dem.
        </p>
      </section>
    </div>
  );
};

export default AboutPage;
