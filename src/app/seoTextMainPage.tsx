
export default function FinanstidningSeoText() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12 w-[100%] lg:w-[90%] xl:w-[70%]">
      <h4 className="mb-6 text-9xl font-bold tracking-tight text-black">
        Finanstidning – Din främsta källa för ekonominyheter, finans och börsanalyser
      </h4>

      <div className="space-y-5 leading-relaxed text-gray-900 ">
        <p>
          Finanstidning är en specialiserad nyhetssajt med fullt fokus på ekonomi, finansnyheter och näringslivsrapportering.
          Vårt mål är att bli Sveriges mest tillförlitliga och omfattande källa för ekonomiska nyheter, börsnoteringar, aktiemarknaden,
          ränteläge, inflation, konjunktur, valutakurser och andra centrala delar inom makroekonomi och mikroekonomi.
        </p>

        <p>
          Vi erbjuder daglig bevakning av finansiella marknader, inklusive Sveriges ekonomi, Europas ekonomi och världsekonomin,
          samt rapporterar om BNP, statsskulder, räntebesked från centralbanker, och investeringsstrategier. Finanstidning följer
          även utvecklingen på Stockholmsbörsen, indexrörelser, börsintroduktioner (IPO) och ger dig aktuella aktieanalyser,
          marknadskommentarer och ekonomiska prognoser.
        </p>

        <p>
          För dig som är intresserad av privatekonomi, sparande, pension, bolån, fonder, kapitalförvaltning, eller skattefrågor, erbjuder vi tydliga guider och nyheter som hjälper dig att fatta välgrundade ekonomiska beslut.
          Vi riktar oss till såväl privatinvesterare som professionella aktörer, ekonomistudenter, företagsledare och analytiker.
        </p>

        <p>
          Finanstidning bevakar också trender inom finansiell teknologi (fintech), hållbara investeringar (ESG), grön ekonomi, och digital ekonomi,
          samt analyserar hur globala händelser påverkar svenska företag, import/export, och internationell handel.
        </p>

        <p>
          Vår redaktion arbetar med hög journalistisk integritet och ett tydligt uppdrag: att göra ekonomisk information tillgänglig, aktuell och begriplig för alla.
          Genom att kombinera finansiell analys, ekonomisk nyhetsrapportering och djupgående insikter, skapar Finanstidning en helhetsbild av den komplexa ekonomiska världen.
        </p>

        <p className="font-medium text-gray-900 ">
          Finanstidning – för dig som vill förstå, påverka och navigera i ekonomins landskap. Håll dig uppdaterad med det senaste inom ekonomi, finans, börsen, pengar, och affärsnyheter – allt på ett och samma ställe.
        </p>
      </div>
    </section>
  );
}

/**
 * Optional: JSON-LD structured data helper for SEO.
 * Place this once per page (typically in the main page component) and pass your canonical URL and logo.
 */
export function FinanstidningSeoJsonLd({
  url,
  logoUrl,
}: {
  url: string; // e.g., "https://finanstidning.se"
  logoUrl?: string; // e.g., "https://finanstidning.se/logo.png"
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    name: "Finanstidning",
    url,
    logo: logoUrl ? { "@type": "ImageObject", url: logoUrl } : undefined,
    sameAs: [] as string[],
    description:
      "Finanstidning – Din främsta källa för ekonominyheter, finans och börsanalyser. Daglig bevakning av Sveriges ekonomi, världsekonomin, börsen och privatekonomi.",
    areaServed: {
      "@type": "Country",
      name: "Sweden",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
