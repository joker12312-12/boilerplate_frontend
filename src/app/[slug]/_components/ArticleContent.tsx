import Image from "next/image";
import { Breadcrumb, BreadcrumbItem } from "@/components/ui/breadcrumb";
import Link from "next/link";
import type { AuthorNode, Post, ITOCItem } from "@/lib/types";
import ShareButtonsClient from "../wrapper/ShareButtons.wrapper";
import { PostTOC } from "../wrapper/TOCWrapper";
import { Sidebar } from "@/app/components/Main-page/SideBar";
import { Separator } from "@/components/ui/separator";

function AuthorInfo({ author }: { author?: { node: AuthorNode } }) {
  if (!author) return null;

  if (author.node.avatar?.url) {
    return (
      <Image
        src={author.node.avatar.url}
        alt={author.node.name || "Author"}
        width={28}
        height={28}
        className="rounded-full object-cover border border-gray-200"
      />
    );
  }
  return (
    <span
      className="inline-flex items-center justify-center rounded-sm bg-gray-300 text-gray-600 font-semibold border border-gray-200"
      style={{ width: 28, height: 28, fontSize: "1rem", userSelect: "none" }}
      aria-label="Author initial"
    >
      {author.node.name ? author.node.name[0].toUpperCase() : "A"}
    </span>
  );
}

export function ArticleContent({
  post,
  postUrl,
  postExcerpt,
  aboveImageRef,
  index,
  categoryNames,
  tagNames,
}: {
  post: Post & { updatedHtml: string; toc: ITOCItem[] };
  postUrl: string;
  postExcerpt: string;
  aboveImageRef?: React.Ref<HTMLDivElement>;
  index: number;
  categoryNames?: string[];
  tagNames?: string[];
}) {
  const intrinsicW = post.featuredImage?.node.mediaDetails?.width || 1200;
  const intrinsicH = post.featuredImage?.node.mediaDetails?.height || 800;

  return (
    <article className="w-full mx-auto mb-10 px-2 md:px-8 lg:w-[90%] xl:w-[70%] 2xl:w-[60%]">
      {/* Title */}
      <div ref={aboveImageRef ?? undefined} className="mb-2">
        {index === 0 ? (
          <h1 className="text-3xl md:text-4xl font-bold text-center lg:text-start mb-1 mt-[0]">
            {post.title}
          </h1>
        ) : (
          <h2 className="text-3xl md:text-4xl font-bold text-center lg:text-start mb-1">
            {post.title}
          </h2>
        )}
      </div>

      {/* Categories */}
      {categoryNames?.length ? (
        <div className="space-y-2 mb-4">
          <h4 className="text-xs uppercase tracking-wide text-gray-500">
            Kategori
          </h4>
          <div className="flex flex-wrap gap-2">
            {categoryNames.map((name, i) => (
              <Link
                key={`${name}-${i}`}
                href={`/category/${encodeURIComponent(name.toLowerCase())}`}
                className="inline-flex items-center rounded-sm border bg-background/80 px-3 py-1 text-xs font-medium hover:underline hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input"
              >
                {name}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <Separator />

      {/* Breadcrumbs + Share */}
      <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-2 text-sm text-muted-foreground pt-2">
        <Breadcrumb>
          <BreadcrumbItem>
            <Link href="/" className="text-gray-700 underline lg:px-0" prefetch={false}>
              {process.env.NEXT_PUBLIC_HOSTNAME || "Hem"}
            </Link>
            <span className="mx-1">/</span>
          </BreadcrumbItem>
          <BreadcrumbItem>{post.title}</BreadcrumbItem>
        </Breadcrumb>
        <div className="shrink-0">
          <ShareButtonsClient
            postUrl={postUrl}
            postTitle={post.title}
            postExcerpt={postExcerpt}
          />
        </div>
      </div>

      {/* Main content + sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 xl:items-start mt-4">
        {/* MAIN COLUMN */}
        <section className="xl:col-span-3 max-w-full w-full space-y-4">
          {/* Featured Image */}
          {post.featuredImage?.node.sourceUrl && (
          <div className="relative mb-4 -mx-2 sm:mx-0">
            <Image
              src={post.featuredImage.node.sourceUrl}
              alt={post.featuredImage.node.altText || ""}
              width={intrinsicW}
              height={intrinsicH}
              className="w-full h-auto object-cover rounded-none sm:rounded-md"
              sizes="(max-width: 1024px) 100vw, 75vw"
              quality={100}
              priority={index === 0}
              fetchPriority={index === 0 ? "high" : "auto"}
              loading={index === 0 ? "eager" : "lazy"}
              placeholder={index === 0 ? "empty" : "blur"}
              blurDataURL={
                (index === 0
                  ? undefined
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  : (post as any)?.featuredImage?.node?.blurDataURL) ||
                "./full_logo_with_slogan.png"
              }
            />
          </div>
          )}

          {/* Author block */}
          <div className="flex items-start gap-3 mt-3 mb-2">
            <AuthorInfo author={post.author} />
            <div
              className={`
                min-w-0
                w-full
                sm:max-w-full
                md:max-w-[75%]
                lg:max-w-[70%]
                overflow-hidden
              `}
            >
              <div className="text-sm">
                By{" "}
                <Link
                prefetch={false}
                  href={`/author/${post.author?.node.name || "admin"}`}
                  className="text-gray-700 underline"
                >
                  <strong>{post.author?.node.name || "Admin"}</strong>
                </Link>
              </div>
              <div
                className="prose prose-sm prose-neutral dark:prose-invert mt-1 max-w-full"
                dangerouslySetInnerHTML={{
                  __html:
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ((post.author as any)?.node?.description as string) || "",
                }}
              />
            </div>
          </div>

          {/* Published date */}
          <div className="text-sm text-muted-foreground my-2 text-gray-950 px-10">
            Publicerad:{" "}
            <time dateTime={post.date}>
              {new Date(post.date).toISOString().slice(0, 10)}
            </time>
          </div>

          {/* Article body */}
          <div
            className="
              prose prose-neutral dark:prose-invert
              break-words
              [&_pre]:break-all
              [&_pre]:whitespace-pre-wrap
              [&_pre]:overflow-x-auto
              [&_code]:break-all
              prose-sm
            "
            dangerouslySetInnerHTML={{ __html: post.updatedHtml }}
          />

          {/* Tags */}
          {tagNames?.length ? (
            <div className="space-y-2">
              <h4 className="text-xs uppercase tracking-wide text-gray-500">
                Taggar
              </h4>
              <span className="flex flex-wrap gap-2">
                {tagNames.map((name, i) => (
                  <Link
                    prefetch={false}
                    key={`${name}-${i}`}
                    href={`/tag/${encodeURIComponent(name.toLowerCase())}`}
                    className="inline-flex items-center rounded-sm border bg-background/80 px-5 py-1 text-sm font-medium hover:underline hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input"
                  >
                    #{name}
                  </Link>
                ))}
              </span>
            </div>
          ) : null}
        </section>

        {/* RIGHT-RAIL SIDEBAR */}
        <aside className="hidden xl:block xl:col-span-1 self-start space-y-4 bg-[var(--secBG)] px-0 sm:px-2">
          <PostTOC toc={post.toc} />
          <Sidebar />
        </aside>
      </div>
    </article>
  );
}
