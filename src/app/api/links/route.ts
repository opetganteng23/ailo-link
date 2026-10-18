import {
  allowRequest,
  createLink,
  isReservedSlug,
  SLUG_PATTERN,
} from "@/lib/db";

const LIMIT_PER_HOUR = 10;

export async function POST(request: Request) {
  // Behind Vercel/most proxies the first x-forwarded-for entry is the client.
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (!(await allowRequest(`create:${ip}`, LIMIT_PER_HOUR, 60 * 60 * 1000))) {
    return Response.json(
      { error: "Too many requests, please try again later" },
      { status: 429 },
    );
  }

  let body: { url?: unknown; slug?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const rawUrl = typeof body.url === "string" ? body.url.trim() : "";
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return Response.json({ error: "Invalid URL" }, { status: 400 });
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return Response.json(
      { error: "Only http/https URLs are allowed" },
      { status: 400 },
    );
  }

  let slug: string | undefined;
  if (typeof body.slug === "string" && body.slug.trim() !== "") {
    slug = body.slug.trim();
    if (!SLUG_PATTERN.test(slug)) {
      return Response.json(
        { error: "Alias must be 3-32 characters: letters, numbers, - or _" },
        { status: 400 },
      );
    }
    if (isReservedSlug(slug)) {
      return Response.json({ error: "This alias is not available" }, { status: 409 });
    }
  }

  const link = await createLink(parsed.toString(), slug);
  if (!link) {
    return Response.json({ error: "This alias is already taken" }, { status: 409 });
  }
  return Response.json({ link }, { status: 201 });
}
