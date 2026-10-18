"use client";

import { useState, useSyncExternalStore } from "react";
import { makeQrWithLogo } from "@/lib/qr";

const subscribe = () => () => {};
const getHost = () => window.location.host;
const getServerHost = () => "";

type Result = { shortUrl: string; qr: string };

export default function ShortenerApp() {
  const host = useSyncExternalStore(subscribe, getHost, getServerHost);
  const [url, setUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, slug }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Terjadi kesalahan");
        return;
      }
      const shortUrl = `${window.location.origin}/${data.link.slug}`;
      const qr = await makeQrWithLogo(shortUrl);
      setResult({ shortUrl, qr });
      setUrl("");
      setSlug("");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    if (!result) return;
    await navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex w-full max-w-md flex-col items-center">
      <h1 className="flex items-center gap-3 text-4xl font-bold tracking-tight">
        <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <path d="M15 3h6v6M10 14 21 3" />
        </svg>
        Ailo.ai.id
      </h1>

      <form onSubmit={onSubmit} className="mt-10 w-full">
        <input
          type="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Tempel link panjangmu di sini..."
          className="w-full rounded-full border-2 border-white bg-transparent px-5 py-2.5 text-sm placeholder:text-white/70 outline-none focus:bg-white/10"
        />

        <div className="mt-6 flex items-baseline gap-1 text-lg">
          <span className="shrink-0">{host}/</span>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="alias"
            aria-label="Alias (opsional)"
            className="min-w-0 flex-1 border-b-2 border-white/60 bg-transparent text-2xl placeholder:text-white/50 outline-none focus:border-white"
          />
        </div>

        <div className="mt-8 flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-black/30 px-10 py-2 text-sm font-medium hover:bg-black/40 disabled:opacity-60"
          >
            {loading ? "..." : "link"}
          </button>
        </div>
      </form>

      {error && <p className="mt-6 text-sm font-medium text-red-100">{error}</p>}

      {result && (
        <div className="mt-8 flex w-full flex-col items-center gap-4 rounded-2xl bg-white/15 p-5">
          <a
            href={result.shortUrl}
            target="_blank"
            rel="noreferrer"
            className="break-all text-xl font-semibold underline"
          >
            {result.shortUrl}
          </a>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={result.qr} alt="QR code" className="h-40 w-40 rounded-lg bg-white" />
          <div className="flex gap-3 text-sm">
            <button onClick={copy} className="rounded-full bg-black/30 px-5 py-2 hover:bg-black/40">
              {copied ? "Tersalin" : "Salin"}
            </button>
            <a
              href={result.qr}
              download="qrcode.png"
              className="rounded-full bg-black/30 px-5 py-2 hover:bg-black/40"
            >
              Unduh QR
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
