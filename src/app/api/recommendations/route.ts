import { getRecommendation } from "@/lib/graph_queries/getPost";
import { NextResponse } from "next/server";
import type { Post } from "@/lib/types";

export async function GET(): Promise<NextResponse<Post[] | { error: string }>> {
  try {
    const posts = await getRecommendation();

    return NextResponse.json<Post[]>(Array.isArray(posts) ? posts : [], {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export function POST() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
