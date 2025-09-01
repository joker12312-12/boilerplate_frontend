"use client";

import Link from "next/link";
import { useCategorySections } from "./herlper.useCategoryFeed"; 
import CategoryDesktopGrid from "./CategoryDesktopGrid";
import CategoryMobileCarousel from "./CategoryMobileCarousel";
import { Button } from "@/components/ui/button";

export default function CategorySections() {
  const {
    categories,
    selectedCategorySlug,
    selectedCategoryPosts,
    loading,
    postsLoading,
    hasNextPage,
    handleCategoryClick,
  } = useCategorySections();

  const selectedCategory =
    categories.find((c) => c.slug === selectedCategorySlug) ?? null;

  return (
    <div className="w-full px-2 mx-auto py-6">
      {loading ? (
        <p className="text-center">Loading categories...</p>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* LEFT: Categories & Posts */}
          <section className="w-full flex flex-col gap-6">
            {/* Title */}
            {selectedCategory && (
              <h2 className="text-xl font-semibold text-start capitalize">
                {selectedCategory.name}
              </h2>
            )}

            {/* Categories row */}
            {categories.length > 0 && (
              <nav aria-label="Categories">
                <div
                  className="
                    flex items-start gap-2 pb-2
                    overflow-x-auto md:overflow-visible
                    md:flex-wrap md:justify-start
                    [scrollbar-width:none] [-ms-overflow-style:none]
                    [&::-webkit-scrollbar]:hidden
                    min-w-0
                  "
                  role="listbox"
                >
                  {categories.map((cat) => {
                    const isActive = selectedCategorySlug === cat.slug;
                    return (
                      <Button
                        key={cat.id}
                        onClick={() => handleCategoryClick(cat.slug)}
                        title={cat.name}
                        // NOTE:
                        // - Mobile: allow wrapping & breaking (no overflow)
                        // - md+: single-line with ellipsis (clean row)
                        // - max-w caps each chip so it never exceeds viewport
                        className={[
                          "px-3 py-2 text-sm leading-tight font-medium transition",
                          "whitespace-normal break-words md:whitespace-nowrap md:truncate",
                          "max-w-[80vw] md:max-w-[16rem] overflow-hidden",
                          "rounded-sm border",
                          isActive
                            ? "bg-black text-white border-black shadow-sm"
                            : "bg-white text-gray-800 border-gray-200 hover:bg-gray-100",
                        ].join(" ")}
                        // use a neutral variant so custom classes aren't fighting "destructive"
                        variant="ghost"
                        aria-current={isActive ? "true" : undefined}
                        role="option"
                        aria-selected={isActive}
                      >
                        {cat.name}
                      </Button>
                    );
                  })}
                </div>
              </nav>
            )}

            {/* Posts */}
            {postsLoading && selectedCategoryPosts.length === 0 ? (
              <p className="text-center">Loading posts...</p>
            ) : selectedCategoryPosts.length === 0 ? (
              <p className="text-sm text-gray-500 text-start">
                Inga inlägg i denna kategori.
              </p>
            ) : (
              <>
                {/* MOBILE */}
                <CategoryMobileCarousel posts={selectedCategoryPosts} />
              
                {/* DESKTOP */}
                <CategoryDesktopGrid posts={selectedCategoryPosts} />

               {/* CTA */}
              {hasNextPage && selectedCategory && (
                <div className="mt-6 flex justify-center">
                  <Link
                    href={`/category/${selectedCategory.slug}`}
                    prefetch
                    aria-label={`Read more from ${selectedCategory.name}`}
                    className="cursor-pointer hover:underline border shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 px-6 py-2 text-sm font-medium rounded-sm break-words max-w-[90vw] text-center"
                  >
                    Vill du läsa mer från{" "}
                    <span className="capitalize">{selectedCategory.name}</span>
                  </Link>
                </div>
              )}
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
