import type { PostWithTOC } from "@/lib/types";
import { ArticleContent } from "./ArticleContent";
import InfiniteScrollClient from "./Infinity-scroll/InfinitePost";
import { update_viewed_post } from "@/lib/graph_queries/update_viewed_post";
import RecommendationList from "./Single-page-footer/RecommendationList";
import { getAllPosts } from "@/lib/graph_queries/getPost";

export async function SinglePost({ initialPost }: { initialPost: PostWithTOC }) {

  const posts = await getAllPosts(); 
  const postUrl = `${
    process.env.NEXT_PUBLIC_HOST_URL || process.env.NEXT_PUBLIC_HOST_URL
  }/${initialPost.slug}`;
  const postExcerpt = initialPost.excerpt!.replace(/<[^>]+>/g, "").trim();

  // 👉 Pull category names
  const categoryNames =
    (initialPost.categories?.nodes ?? [])
      .map((n) => n?.name)
      .filter((v): v is string => Boolean(v)) || [];

  // 👉 Pull tag names
  const tagNames =
    (initialPost.tags?.nodes ?? [])
      .map((n) => n?.name)
      .filter((v): v is string => Boolean(v)) || [];


  update_viewed_post(String(initialPost.databaseId));

return (
  <div className="space-y-16 mx-auto py-12 mb-10 ">
    <div
      className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"
      data-index={0}
    >
      <div className="col-span-1 lg:col-span-2 flex flex-col gap-8 w-full">
        <ArticleContent
          post={initialPost}
          postUrl={postUrl}
          postExcerpt={postExcerpt}
          index={0}
          categoryNames={categoryNames}
          tagNames={tagNames}
        />
        <RecommendationList currentSlug={initialPost.slug} posts={posts} />
      </div>
    </div>

    {/* The client-only infinite scroll lives here */}
    <InfiniteScrollClient initialPost={initialPost} posts={posts}/>
  </div>
);
}