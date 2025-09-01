import type { Metadata } from "next";
import ContactForm from "./_component/ContactForm";

const SITE = process.env.NEXT_PUBLIC_HOSTNAME ?? "Our Site";

import { getSeo, buildMetadataFromSeo } from '@/lib/seo/seo';


export async function generateMetadata(): Promise<Metadata> {
  const payload = await getSeo('/contact/');

  if (!payload?.nodeByUri) {
    return {
      title: `Contact | ${process.env.NEXT_PUBLIC_HOSTNAME}`,
      description: "Kontakta vårt team för förfrågningar, support eller samarbeten.",
      robots: { index: true, follow: true },
    };
  }

  const meta = buildMetadataFromSeo(payload, {
    metadataBase: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: process.env.NEXT_PUBLIC_SITENAME,
  });

  // fallback description if empty
  if (!meta.description) {
    meta.description = "Kontakta vårt team för förfrågningar, support eller samarbeten.";
  }

  return meta;
}



export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">Köp en länk</h1>

      <section className="space-y-6 text-lg leading-relaxed text-gray-800">
        <p>
          Är du intresserad av att publicera en länk på <strong>{SITE}</strong>? Vi erbjuder gärna
          länkplaceringar för företag, byråer och privatpersoner som vill öka sin synlighet via vår plattform.
        </p>
        <p>
          <strong>Pris:</strong> Varje länkplacering kostar <span className="font-semibold">$250 USD</span>.
          Detta inkluderar permanent placering, relevant kategorisering och redaktionell formatering.
        </p>
        <p>
          Observera: Länkar relaterade till <strong>casino- eller spelinnehåll</strong> har ett högre pris
          på grund av branschens känslighet och redaktionell hantering. Dessa kostar <span className="font-semibold">$500 USD</span> per länk.
        </p>
        <p>
          Efter köpet kommer vårt team att granska din förfrågan och schemalägga din länk för publicering.
          Vi förbehåller oss rätten att avvisa inlämningar som inte uppfyller våra kvalitets- eller efterlevnadsstandarder.
        </p>
        <p>
          Använd formuläret nedan så guidar vi dig genom faktura, innehållskrav och tidslinjer.
        </p>

        <ContactForm />
      </section>
    </div>
  );
}
