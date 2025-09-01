"use client";

import { useMemo, useEffect, useRef, useCallback, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Post } from "@/lib/types";

interface Props { currentSlug: string, posts: Post[] }

export default function RecommendationListMarquee({ currentSlug, posts }: Props) {
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);

  const [speed, setSpeed] = useState(30); 

  useEffect(() => {
    const check = () => {
      if (window.innerWidth < 640) setSpeed(15);
      else if (window.innerWidth < 1024) setSpeed(20);
      else setSpeed(30);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);


  const items = useMemo(
    () => posts.filter(p => p.slug !== currentSlug).slice(0, 20),
    [posts, currentSlug]
  );

  // Keyframes and base class (no shorthand here)
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes marqueeLeft  { 0% { transform: translateX(0)    } 100% { transform: translateX(-50%) } }
      @keyframes marqueeRight { 0% { transform: translateX(-50%) } 100% { transform: translateX(0)    } }

      .marquee-anim { will-change: transform; }

      @media (prefers-reduced-motion: reduce) {
        .marquee-anim {
          animation-name: none !important;
          transform: translateX(0) !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  // Pause/resume via longhand only (safe)
  const pause = useCallback((yes: boolean) => {
    const state = yes ? "paused" : "running";
    if (row1Ref.current) row1Ref.current.style.animationPlayState = state;
    if (row2Ref.current) row2Ref.current.style.animationPlayState = state;
  }, []);

  const row = [...items, ...items]; // duplicate for seamless marquee

  return (
    <div
      className="w-full lg:w-[70%] mx-auto px-2"
      onMouseEnter={() => pause(true)}
      onMouseLeave={() => pause(false)}
      onTouchStart={() => pause(true)}
      onTouchEnd={() => pause(false)}
    >
      <div className="pt-6 pb-4 text-sm uppercase tracking-wide text-gray-600 font-semibold">
        Rekommenderat för dig
      </div>

      <div className="space-y-4">
        {/* Row 1 */}
        <div className="relative overflow-hidden">
          <div
            ref={row1Ref}
            className="marquee-anim flex w-[200%] gap-10 py-4"
            style={{
              // ✅ Only longhands; no 'animation' shorthand
              animationName: "marqueeLeft",
              animationDuration: `${speed}s`,
              animationTimingFunction: "linear",
              animationIterationCount: "infinite",
              animationPlayState: "running",
            }}
          >
            {row.map((p, i) => (
              <Link
                key={`${p.slug}-1-${i}`}
                href={`/${p.slug}`}
                prefetch={false}
                className="inline-flex items-center gap-4 whitespace-nowrap hover:underline"
              >
                <span
                  className="relative block h-24 w-40 overflow-hidden rounded-md shadow-md flex-shrink-0"
                  aria-hidden="true"
                >
                  <Image
                    src={p.featuredImage?.node.sourceUrl || "./full_logo_with_slogan.png"}
                    alt=""               // decorative; title follows
                    fill
                    className="object-cover"
                    sizes="160px"
                    priority={false}
                  />
                </span>
                <span className="font-semibold text-xl truncate max-w-[40ch]">
                  {p.title}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Row 2 */}
        <div className="relative overflow-hidden">
          <div
            ref={row2Ref}
            className="marquee-anim flex w-[200%] gap-10 py-4"
            style={{
              animationName: "marqueeRight",
              animationDuration: `${speed}s`,
              animationTimingFunction: "linear",
              animationIterationCount: "infinite",
              animationPlayState: "running",
            }}
          >
            {row.map((p, i) => (
              <Link
                prefetch={false}
                key={`${p.slug}-2-${i}`}
                href={`/${p.slug}`}
                className="inline-flex items-center gap-4 whitespace-nowrap hover:underline"
              >
                <span
                  className="relative block h-24 w-40 overflow-hidden rounded-md shadow-md flex-shrink-0"
                  aria-hidden="true"
                >
                  <Image
                    src={p.featuredImage?.node.sourceUrl || "./full_logo_with_slogan.png"}
                    alt=""             
                    fill
                    className="object-cover"
                    sizes="160px"
                  />
                </span>
                <span className="font-semibold text-xl truncate max-w-[40ch]">
                  {p.title}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}