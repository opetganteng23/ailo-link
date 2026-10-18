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
    setLoading(true);
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, slug }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
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
    "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-ailo-teal focus:bg-white focus:ring-4 focus:ring-ailo-teal/15";
  const softButton =
    "rounded-full border border-ailo-teal/30 bg-white px-4 py-1.5 text-sm font-semibold text-ailo-teal transition hover:bg-ailo-teal hover:text-white";

  const copyButton = (
    <button type="button" onClick={copy} className={softButton}>
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
  const anotherButton = (
    <button
      type="button"
      onClick={() => setResult(null)}
      className="px-3 py-1.5 text-sm font-semibold text-slate-500 hover:text-ailo-teal"
    >
      Shorten another
    </button>
  );

  return (
    <div className="flex w-full flex-col items-center short-landscape:flex-row short-landscape:gap-8">
      <div className="flex flex-col items-center short-landscape:w-5/12">
      <Emblem3D />

      <h1 className="mt-1 text-center text-[clamp(2.25rem,7vh,3.75rem)] font-extrabold leading-tight tracking-tight">
        <span className="title-3d text-ailo-teal">ailo</span>
        <span className="title-3d-orange text-ailo-orange">.ai</span>
        <span className="title-3d-dark text-neutral-900">.id</span>
      </h1>
      <h2 className="mt-2 text-center text-[clamp(1rem,2.6vh,1.5rem)] font-bold text-ailo-teal-dark">
        Shorten Links. Amplify Impact.
      </h2>
      <p className="mt-2 max-w-2xl text-balance text-center text-sm leading-relaxed text-slate-600 short-portrait:hidden">
        Create short links and QR Codes with AI Labs. Share your ideas, track
        engagement, and turn every click into a meaningful connection.
      </p>
      </div>

      <div className="flex w-full flex-col items-center short-landscape:w-7/12">
      <div className="mt-5 w-full max-w-xl short-landscape:mt-0 rounded-3xl border border-white bg-white/85 p-4 shadow-[0_20px_60px_-15px_rgba(0,90,112,0.35)] backdrop-blur sm:p-5">
        <div
          role="tablist"
          aria-label="Output type"
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
                className={`flex items-center justify-center gap-2 rounded-xl py-2 text-sm font-semibold transition ${
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

        {!result && (
          <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3">
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste your long link here..."
              className={inputClass}
            />
            <div className="flex items-center gap-2">
              <span className="shrink-0 text-sm font-medium text-slate-500">
                {host || "ailo.ai.id"}/
              </span>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="alias (optional)"
                aria-label="Custom alias (optional)"
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-linear-to-b from-[#ff8a3d] to-ailo-orange py-3 text-base font-bold text-white shadow-[0_6px_0_#b9540f,0_12px_22px_rgba(244,116,33,0.35)] transition active:translate-y-1 active:shadow-[0_2px_0_#b9540f] disabled:opacity-60"
            >
              {loading
                ? "Working..."
                : mode === "link"
                  ? "Shorten Link"
                  : "Create QR Code"}
            </button>
            {error && (
              <p className="text-center text-sm font-medium text-red-600">{error}</p>
            )}
          </form>
        )}

        {result && mode === "link" && (
          <div key="link" className="rise-in mt-4 rounded-2xl bg-sky-50 p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Your short link
            </p>
            <a
              href={result.shortUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 block break-all text-2xl font-bold text-ailo-teal hover:underline"
            >
              {result.shortUrl}
            </a>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              {copyButton}
              {anotherButton}
            </div>
          </div>
        )}

        {result && mode === "qr" && (
          <div
            key="qr"
            className="rise-in mt-4 flex items-center gap-3 rounded-2xl bg-sky-50 p-3 sm:gap-4 sm:p-4"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={result.qr}
              alt={`QR code for ${result.shortUrl}`}
              className="h-24 w-24 shrink-0 rounded-2xl bg-white p-1 shadow-lg max-[360px]:h-20 max-[360px]:w-20 sm:h-36 sm:w-36 sm:p-1.5 short-landscape:h-20 short-landscape:w-20 short-landscape:p-1"
            />
            <div className="min-w-0 flex-1 text-left">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Your short link
              </p>
              <a
                href={result.shortUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1 block break-all text-base font-bold text-ailo-teal hover:underline sm:text-lg"
              >
                {result.shortUrl}
              </a>
              <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:mt-3 sm:gap-2">
                {copyButton}
                <a href={result.qr} download="qrcode-ailo.png" className={softButton}>
                  Download QR
                </a>
                {anotherButton}
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-slate-500 short-landscape:hidden short-portrait:hidden">
        AILO · Telkom University&apos;s Center of Excellence
      </p>
      </div>
    </div>
  );
}
