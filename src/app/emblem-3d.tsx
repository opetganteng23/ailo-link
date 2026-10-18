"use client";

import { useEffect, useRef } from "react";

const LAYERS = 22;
// Slice spacing as a fraction of the emblem size (~48px depth at 176px).
const GAP = 0.0125;

const slices = Array.from({ length: LAYERS }, (_, i) => i);

/**
 * AILO emblem as a stack of thin slices along the Z axis. The PNG's own
 * transparency cuts every slice to the logo shape, so rotating the stack reads
 * as a solid 3D object. Sways on its own and tilts toward the pointer.
 *
 * Size follows the viewport height (--emblem) so the whole page fits on short
 * screens without scrolling.
 */
export default function Emblem3D() {
  const tiltRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = tiltRef.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const dx = e.clientX / window.innerWidth - 0.5;
      const dy = e.clientY / window.innerHeight - 0.5;
      el.style.transform = `rotateY(${dx * 24}deg) rotateX(${-dy * 18}deg)`;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const box = { width: "var(--emblem)", height: "var(--emblem)" };

  return (
    <div
      aria-hidden
      className="relative mx-auto [--emblem:clamp(72px,16vh,176px)]"
      style={{
        width: "var(--emblem)",
        height: "calc(var(--emblem) + 24px)",
        perspective: 900,
      }}
    >
      <div className="emblem-bob" style={{ ...box, transformStyle: "preserve-3d" }}>
        <div
          ref={tiltRef}
          style={{
            ...box,
            transformStyle: "preserve-3d",
            transition: "transform 0.2s ease-out",
          }}
        >
          <div className="emblem-sway relative" style={box}>
            {slices.map((i) => (
              <div
                key={i}
                className="absolute inset-0"
                style={{
                  backgroundImage: "url(/ailo-emblem.png)",
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  transform: `translateZ(calc(var(--emblem) * ${(
                    (i - (LAYERS - 1) / 2) *
                    GAP
                  ).toFixed(4)}))`,
                  // back slices darker, front slice full color: fake lighting
                  filter: `brightness(${0.5 + (0.5 * i) / (LAYERS - 1)})`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
      <div
        className="emblem-shadow absolute bottom-0 left-1/2 h-3 w-3/4 -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(0,70,95,0.45), transparent)",
        }}
      />
    </div>
  );
}
