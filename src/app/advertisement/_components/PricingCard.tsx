import Dollar from "@/app/components/icons/dollar";
import Sparkles from "@/app/components/icons/sparks";

export default async function PricingCard({ site }: { site: string }) {
  return (
    <>
      <div className="flex items-center gap-2 mb-3 text-indigo-700 font-semibold">
        <Dollar width={22} color="#6366f1" className="mr-2" />
        <span className="text-lg">{site} Artikelpris</span>
      </div>

      <ul className="space-y-2 text-gray-700 text-base ml-1">
        <li className="flex items-center gap-2">
          <Sparkles width={16} color="#6366f1" className="mt-0.5" />
          <span>
            <strong>€350</strong> per artikel{" "}
            <span className="text-gray-500">(Allmänt innehåll)</span>
            <br />
            <span className="text-xs text-gray-400">
              Finans, företag, börsen och annat…
            </span>
          </span>
        </li>
        <li className="flex items-center gap-2">
          <Sparkles width={16} color="#f59e42" className="mt-0.5" />
          <span>
            <strong>€550</strong> per artikel{" "}
            <span className="text-gray-500">(Krypto, Forex, lån &amp; Finans)</span>
            <br />
            <span className="text-xs text-gray-400">
              Högkonkurrensämnen som kryptovalutor, forex eller lånetjänster.
            </span>
          </span>
        </li>
        <li className="flex items-center gap-2">
          <Sparkles width={16} color="#fb7185" className="mt-0.5" />
          <span>
            <strong>€700</strong> per artikel{" "}
            <span className="text-gray-500">(Casino, Betting &amp; Gambling)</span>
            <br />
            <span className="text-xs text-gray-400">
              För ämnen som rör casino, betting och spel.
            </span>
          </span>
        </li>
      </ul>

      <div className="mt-4 text-sm text-gray-600">
        <strong>Rabatter:</strong> Paketbeställningar på{" "}
        <span className="font-semibold">3+ artiklar</span> får reducerat pris.
        <br />
        <span className="text-gray-400">
          Kontakta oss för att diskutera alternativ anpassade efter dina behov.
        </span>
      </div>

      <div className="mt-5 text-indigo-700 font-bold">Extra skrivtjänst</div>
      <div className="text-sm text-gray-600 mb-1">
        <strong>€200</strong> per artikel (valfritt tillägg: högkvalitativ, SEO-optimerad text skriven av vårt team)
      </div>
    </>
  );
}
