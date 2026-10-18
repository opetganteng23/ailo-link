import { NextResponse } from "next/server";
import { getLink, incrementClicks } from "@/lib/db";

export async function GET(
  request: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  const link = await getLink(slug);
  if (!link) {
    return new Response("Link tidak ditemukan", { status: 404 });
  }
  await incrementClicks(slug);
  // 302 so browsers don't cache the redirect and every click is counted.
  return NextResponse.redirect(link.url, 302);
}
