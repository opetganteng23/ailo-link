import ShortenerApp from "./shortener-app";

type CloudProps = {
  top: string;
  width: number;
  duration: number;
  delay: number;
  opacity: number;
};

function Cloud({ top, width, duration, delay, opacity }: CloudProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 80"
      width={width}
      className="cloud"
      style={{
        top,
        opacity,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
      }}
    >
      <g fill="#ffffff">
        <circle cx="50" cy="48" r="28" />
        <circle cx="92" cy="34" r="34" />
        <circle cx="137" cy="46" r="28" />
        <circle cx="167" cy="53" r="20" />
        <rect x="38" y="48" width="140" height="25" rx="12" />
      </g>
    </svg>
  );
}

export default function Home() {
  return (
    <main
      className="relative min-h-screen overflow-hidden px-4 py-10"
      style={{
        background:
          "radial-gradient(60rem 30rem at 15% 0%, rgba(0,128,157,0.10), transparent 60%), radial-gradient(50rem 28rem at 90% 10%, rgba(244,116,33,0.10), transparent 60%), linear-gradient(180deg, #d6eaf8 0%, #eef6fc 40%, #ffffff 100%)",
      }}
    >
      <div className="pointer-events-none absolute inset-0">
        <Cloud top="6%" width={260} duration={90} delay={-20} opacity={0.95} />
        <Cloud top="22%" width={170} duration={70} delay={-55} opacity={0.8} />
        <Cloud top="48%" width={300} duration={110} delay={-70} opacity={0.9} />
        <Cloud top="68%" width={200} duration={80} delay={-10} opacity={0.75} />
        <Cloud top="84%" width={340} duration={120} delay={-95} opacity={0.95} />
      </div>
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl flex-col items-center justify-center">
        <ShortenerApp />
      </div>
    </main>
  );
}
