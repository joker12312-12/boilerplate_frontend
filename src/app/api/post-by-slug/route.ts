// /api/post-by-slug/route.ts
import { getPostBySlug } from "@/lib/graph_queries/getPost";
import { NextRequest, NextResponse } from "next/server";

type Post = NonNullable<Awaited<ReturnType<typeof getPostBySlug>>>;

const SLUG_REGEX = /^[a-z0-9]+(?:[a-z0-9-\/]*[a-z0-9])?$/i;

function safeDecodeURIComponent(v: string) {
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });
    }

    const body = (await req.json().catch(() => null)) as { nextSlug?: unknown } | null;
    const raw = typeof body?.nextSlug === "string" ? body.nextSlug.trim() : "";
    const slug = safeDecodeURIComponent(raw);

    const invalid =
      !slug ||
      slug.length > 100 ||
      slug.includes("..") ||
      slug.includes("//") ||
      !SLUG_REGEX.test(slug);

    if (invalid) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }

    const post = await getPostBySlug(slug);
    // Normalized shape: always { data: Post | null }
    return NextResponse.json<{ data: Post | null }>({ data: post ?? null }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
