import News from "@/app/components/icons/news";

export default function NewsletterHighlight({ site }: { site: string }) {
  return (
    <div className="relative mt-4">
      <div className="absolute -top-3 -left-3">
        <span className="bg-yellow-400 text-yellow-900 font-bold text-xs px-3 py-1 rounded-full shadow ring-2 ring-yellow-200 border border-yellow-300 animate-pulse">
          Best Seller
        </span>
      </div>
      <div className="bg-gradient-to-br from-yellow-50 via-indigo-50 to-white border-2 border-yellow-400 shadow-lg rounded-xl px-5 py-4 flex flex-col sm:flex-row items-center gap-4 text-indigo-900 ring-2 ring-yellow-200">
        <News width={28} color="#fbbf24" className="flex-shrink-0" />
        <div className="flex-1 flex flex-col">
          <span className="text-lg font-bold text-yellow-700">Newsletter Placement</span>
          <span className="text-sm text-indigo-900 font-semibold mb-1">
            Get featured in our exclusive newsletter to{" "}
            <span className="text-yellow-700 font-extrabold">20,000+</span> engaged subscribers!
          </span>
          <span className="text-base">
            <span className="font-semibold text-indigo-700">Want to be in our newsletter?</span>
            <br />
            <span className="font-bold text-yellow-700">
              Contact us for a special offer on {site}!
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
