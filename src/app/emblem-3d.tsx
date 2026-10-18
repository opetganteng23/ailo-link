"use client";

import { useEffect, useRef } from "react";

const LAYERS = 22;
const GAP = 2.2; // px between slices -> ~48px total depth
const SIZE = 176;

const slices = Array.from({ length: LAYERS }, (_, i) => i);

/**
 * AILO emblem as a stack of thin slices along the Z axis. The PNG's own
 * transparency cuts every slice to the logo shape, so rotating the stack reads
 * as a solid 3D object. Sways on its own and tilts toward the pointer.
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

  return (
    <div
      aria-hidden
      className="relative mx-auto"
      style={{ width: SIZE, height: SIZE + 28, perspective: 900 }}
    >
      <div
        className="emblem-bob"
        style={{ width: SIZE, height: SIZE, transformStyle: "preserve-3d" }}
      >
        <div
          ref={tiltRef}
          style={{
            width: SIZE,
            height: SIZE,
            transformStyle: "preserve-3d",
            transition: "transform 0.2s ease-out",
          }}
        >
          <div
            className="emblem-sway relative"
            style={{ width: SIZE, height: SIZE }}
          >
            {slices.map((i) => (
              <div
                key={i}
                className="absolute inset-0"
                style={{
                  backgroundImage: "url(/ailo-emblem.png)",
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  transform: `translateZ(${(i - (LAYERS - 1) / 2) * GAP}px)`,
                  // back slices darker, front slice full color: fake lighting
                  filter: `brightness(${0.5 + (0.5 * i) / (LAYERS - 1)})`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
      <div
        className="emblem-shadow absolute bottom-0 left-1/2 h-4 w-32 -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(0,70,95,0.45), transparent)",
        }}
      />
    </div>
  );
}
