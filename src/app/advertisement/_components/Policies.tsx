import Link from "next/link";

export default function Policies({ site }: { site: string }) {
  return (
    <>
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3">
        <div className="text-indigo-700 font-semibold mb-1">Innehålls- och länkriktlinjer</div>
        <ul className="list-disc list-inside text-gray-700 text-sm space-y-1 pl-1">
          <li>Språk: <span className="font-semibold">svenska</span>, upp till 1 000 ord per artikel.</li>
          <li>Upp till <span className="font-semibold">3 do-follow-länkar</span> per artikel.</li>
          <li>
            Alla artiklar <span className="font-semibold">publiceras permanent</span> på {site}.
          </li>
          <li>
            Ingen &quot;sponsrad&quot;-tagg i artikeltexten.
            <br />
            <span className="text-gray-400">
              En liten sponsorindikation visas på omslagsbilden enligt svensk lag (påverkar inte länkar).
            </span>
          </li>
        </ul>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
        <div className="text-amber-800 font-semibold mb-1">Vi accepterar inte innehåll som rör:</div>
        <ul className="list-disc list-inside text-sm text-gray-700 pl-1">
          <li>Vuxeninnehåll</li>
          <li>CBD- eller cannabisrelaterade produkter</li>
        </ul>
        <span className="block text-xs text-gray-400 mt-1">Dessa begränsningar hjälper till att upprätthålla plattformens kvalitet.</span>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
        <div className="text-green-800 font-semibold mb-0.5">Betalningsvillkor</div>
        <div className="text-sm text-gray-700">
          Betala via <strong>banköverföring</strong> eller <strong>PayPal</strong>.<br />
          Betalning ska ske <span className="font-semibold">inom 5 arbetsdagar</span> från publiceringsdatum.
        </div>
      </div>

      <div className="mt-2 text-gray-500 text-xs">
        För mängdrabatter eller ytterligare frågor,
        <br />
        <Link href="mailto:publisheradsquestions@gmail.com" className="font-medium text-indigo-700 underline hover:text-indigo-900 transition">
          kontakta oss direkt
        </Link>
        .<br />
        Vi ser fram emot att hjälpa dig att uppnå fantastiska SEO-resultat på{" "}
        <span className="font-semibold text-indigo-700">{site}</span>!
      </div>
    </>
  );
}
