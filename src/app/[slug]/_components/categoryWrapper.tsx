import CategorySections from "@/app/components/categories/CategoryFeed";

export default function CatsPage() {
  return (
    <div className="bg-[var(--firstBG)]">
      <div className="mx-auto w-full lg:w-[90%] xl:w-[70%] px-4 py-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Main content */}
          <section className="min-w-0">
            <CategorySections />
          </section>
        </div>
      </div>
    </div>
  );
}
