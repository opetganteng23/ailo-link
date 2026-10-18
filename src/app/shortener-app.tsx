"use client";

import { useState, useSyncExternalStore } from "react";
import { makeQrWithLogo } from "@/lib/qr";
import Emblem3D from "./emblem-3d";

const subscribe = () => () => {};
const getHost = () => window.location.host;
const getServerHost = () => "";

type Mode = "link" | "qr";
type Result = { shortUrl: string; qr: string };

const TABS: { id: Mode; label: string; icon: React.ReactNode }[] = [
  {
    id: "link",
    label: "Link",
    icon: (
      <>
        <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
        <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
      </>
    ),
  },
  {
    id: "qr",
    label: "QR Code",
    icon: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <path d="M14 14h3v3h-3zM20 14v0M17 20h4M20 17v3" />
      </>
    ),
  },
];

export default function ShortenerApp() {
  const host = useSyncExternalStore(subscribe, getHost, getServerHost);
  const [mode, setMode] = useState<Mode>("link");
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
      // Always build both outputs so the tabs can be switched after creating.
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

  const inputClass =
    "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-ailo-teal focus:bg-white focus:ring-4 focus:ring-ailo-teal/15";
  const softButton =
    "rounded-full border border-ailo-teal/30 bg-white px-5 py-2 text-sm font-semibold text-ailo-teal transition hover:bg-ailo-teal hover:text-white";

  return (
    <div className="flex w-full flex-col items-center">
      <Emblem3D />

      <h1 className="mt-2 text-center text-5xl font-extrabold tracking-tight sm:text-6xl">
        <span className="title-3d text-ailo-teal">ailo</span>
        <span className="title-3d-orange text-ailo-orange">.ai.id</span>
      </h1>
      <p className="mt-4 text-center text-slate-600">
        Persingkat link panjang, bagikan sebagai link atau QR code.
      </p>

      <div className="mt-8 w-full rounded-3xl border border-white bg-white/85 p-5 shadow-[0_20px_60px_-15px_rgba(0,90,112,0.35)] backdrop-blur sm:p-7">
        <div
          role="tablist"
          aria-label="Jenis hasil"
          className="grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1"
        >
          {TABS.map((t) => {
            const active = mode === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={active}
                type="button"
                onClick={() => setMode(t.id)}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition ${
                  active
                    ? "bg-ailo-teal text-white shadow-md"
                    : "text-slate-500 hover:text-ailo-teal"
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  {t.icon}
                </svg>
                {t.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-4">
          <input
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Tempel link panjangmu di sini..."
            className={inputClass}
          />
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-sm font-medium text-slate-500">
              {host || "ailo.ai.id"}/
            </span>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="alias kustom (opsional)"
              aria-label="Alias kustom (opsional)"
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-linear-to-b from-[#ff8a3d] to-ailo-orange py-3.5 text-base font-bold text-white shadow-[0_8px_0_#b9540f,0_14px_24px_rgba(244,116,33,0.35)] transition active:translate-y-1 active:shadow-[0_4px_0_#b9540f] disabled:opacity-60"
          >
            {loading
              ? "Memproses..."
              : mode === "link"
                ? "Persingkat Link"
                : "Buat QR Code"}
          </button>
          {error && (
            <p className="text-center text-sm font-medium text-red-600">{error}</p>
          )}
        </form>

        {result && mode === "link" && (
          <div key="link" className="rise-in mt-6 rounded-2xl bg-sky-50 p-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Link pendekmu
            </p>
            <a
              href={result.shortUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 block break-all text-2xl font-bold text-ailo-teal hover:underline"
            >
              {result.shortUrl}
            </a>
            <button onClick={copy} className={`${softButton} mt-4`}>
              {copied ? "Tersalin!" : "Salin link"}
            </button>
          </div>
        )}

        {result && mode === "qr" && (
          <div
            key="qr"
            className="rise-in mt-6 flex flex-col items-center rounded-2xl bg-sky-50 p-5"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={result.qr}
              alt={`QR code untuk ${result.shortUrl}`}
              className="h-56 w-56 rounded-2xl bg-white p-2 shadow-lg"
            />
            <a
              href={result.shortUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 break-all text-center text-lg font-bold text-ailo-teal hover:underline"
            >
              {result.shortUrl}
            </a>
            <div className="mt-4 flex gap-3">
              <button onClick={copy} className={softButton}>
                {copied ? "Tersalin!" : "Salin link"}
              </button>
              <a href={result.qr} download="qrcode-ailo.png" className={softButton}>
                Unduh QR
              </a>
            </div>
          </div>
        )}
      </div>

      <p className="mt-8 text-center text-xs text-slate-500">
        AILO · Telkom University&apos;s Center of Excellence
      </p>
    </div>
  );
}
