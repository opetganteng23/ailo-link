import {
  allowRequest,
  createLink,
  RESERVED_SLUGS,
  SLUG_PATTERN,
} from "@/lib/db";

const LIMIT_PER_HOUR = 10;

export async function POST(request: Request) {
  // Behind Vercel/most proxies the first x-forwarded-for entry is the client.
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (!(await allowRequest(`create:${ip}`, LIMIT_PER_HOUR, 60 * 60 * 1000))) {
    return Response.json(
      { error: "Terlalu banyak permintaan, coba lagi nanti" },
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
    return Response.json({ error: "URL tidak valid" }, { status: 400 });
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return Response.json(
      { error: "Hanya URL http/https yang diperbolehkan" },
      { status: 400 },
    );
  }

  let slug: string | undefined;
  if (typeof body.slug === "string" && body.slug.trim() !== "") {
    slug = body.slug.trim();
    if (!SLUG_PATTERN.test(slug)) {
      return Response.json(
        { error: "Alias harus 3-32 karakter: huruf, angka, - atau _" },
        { status: 400 },
      );
    }
    if (RESERVED_SLUGS.has(slug)) {
      return Response.json({ error: "Alias tidak tersedia" }, { status: 409 });
    }
  }

  const link = await createLink(parsed.toString(), slug);
  if (!link) {
    return Response.json({ error: "Alias sudah dipakai" }, { status: 409 });
  }
  return Response.json({ link }, { status: 201 });
}
