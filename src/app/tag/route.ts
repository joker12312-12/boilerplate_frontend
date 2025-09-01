import { getTagBySlug } from "@/lib/graph_queries/getTag";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  const after = searchParams.get("after") || undefined;

  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  try {
    const tag = await getTagBySlug(slug, after);
    return NextResponse.json({
      posts: tag.posts.nodes,
      pageInfo: tag.posts.pageInfo,
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}
