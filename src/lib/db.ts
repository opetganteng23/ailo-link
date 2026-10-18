import { MongoClient, type Collection } from "mongodb";
import { customAlphabet } from "nanoid";

// Reuse one client across hot reloads in dev. Connect lazily so `next build`
// works without MONGODB_URI being set.
const globalForMongo = globalThis as unknown as {
  _mongoClient?: Promise<MongoClient>;
};

function getClient(): Promise<MongoClient> {
  if (!globalForMongo._mongoClient) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI belum diset (lihat .env.example)");
    }
    globalForMongo._mongoClient = new MongoClient(uri).connect();
  }
  return globalForMongo._mongoClient;
}

// The slug is stored as _id, so MongoDB enforces uniqueness for us.
type LinkDoc = { _id: string; url: string; clicks: number; createdAt: Date };

export type Link = {
  slug: string;
  url: string;
  clicks: number;
  createdAt: string;
};

async function links(): Promise<Collection<LinkDoc>> {
  const client = await getClient();
  return client.db(process.env.MONGODB_DB ?? "shorturl").collection("links");
}

function toLink(d: LinkDoc): Link {
  return {
    slug: d._id,
    url: d.url,
    clicks: d.clicks,
    createdAt: d.createdAt.toISOString(),
  };
}

const generateSlug = customAlphabet(
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  6,
);

export const RESERVED_SLUGS = new Set(["api", "_next", "favicon.ico"]);
export const SLUG_PATTERN = /^[A-Za-z0-9_-]{3,32}$/;

const DUPLICATE_KEY = 11000;

type RateDoc = { _id: string; count: number; expireAt: Date };

let rateIndexReady: Promise<unknown> | undefined;

/**
 * Fixed-window rate limit backed by MongoDB. Returns true if the call is
 * allowed. Each (key, window) pair is one document that a TTL index cleans up.
 */
export async function allowRequest(
  key: string,
  limit: number,
  windowMs: number,
): Promise<boolean> {
  const client = await getClient();
  const col = client
    .db(process.env.MONGODB_DB ?? "shorturl")
    .collection<RateDoc>("rate_limits");
  rateIndexReady ??= col.createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 });
  await rateIndexReady;

  const now = Date.now();
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const doc = await col.findOneAndUpdate(
    { _id: `${key}:${windowStart}` },
    {
      $inc: { count: 1 },
      $setOnInsert: { expireAt: new Date(windowStart + windowMs) },
    },
    { upsert: true, returnDocument: "after" },
  );
  return (doc?.count ?? 1) <= limit;
}

export async function getLink(slug: string): Promise<Link | null> {
  const doc = await (await links()).findOne({ _id: slug });
  return doc ? toLink(doc) : null;
}

export async function incrementClicks(slug: string) {
  await (await links()).updateOne({ _id: slug }, { $inc: { clicks: 1 } });
}

/** Returns the created link, or null if a custom slug is already taken. */
export async function createLink(
  url: string,
  customSlug?: string,
): Promise<Link | null> {
  const col = await links();

  async function tryInsert(slug: string): Promise<Link | null> {
    const doc: LinkDoc = { _id: slug, url, clicks: 0, createdAt: new Date() };
    try {
      await col.insertOne(doc);
      return toLink(doc);
    } catch (e) {
      if ((e as { code?: number }).code === DUPLICATE_KEY) return null;
      throw e;
    }
  }

  if (customSlug) return tryInsert(customSlug);

  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = generateSlug();
    if (RESERVED_SLUGS.has(slug)) continue;
    const link = await tryInsert(slug);
    if (link) return link;
  }
  throw new Error("Failed to generate a unique slug");
}
