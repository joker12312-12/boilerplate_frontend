// app/components/TradingViewWidget.tsx
"use client";

import React, { useEffect, useRef, memo, useCallback } from "react";

type HeightConfig = {
  base?: number; // < 640px
  sm?: number;   // >= 640px
  md?: number;   // >= 768px
  lg?: number;   // >= 1024px
};

type Props = {
  title?: string;
  theme?: "light" | "dark";
  transparent?: boolean;
  locale?: string;
  country?: string;
  importance?: string; // "-1,0,1"
  heights?: HeightConfig;
  className?: string;
};

function TradingViewWidget({
  title = "Kommande händelser",
  theme = "light",
  transparent = false,
  locale = "sv_SE",
  country = "se",
  importance = "-1,0,1",
  heights = { base: 380, sm: 420, md: 500, lg: 550 },
  className = "",
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bucketRef = useRef<string>("base");

  // Memoized height resolver so it can be used in effect deps safely
  const getHeightForBucket = useCallback(
    (b: string) => {
      switch (b) {
        case "lg":
          return heights.lg ?? heights.md ?? heights.sm ?? heights.base ?? 550;
        case "md":
          return heights.md ?? heights.sm ?? heights.base ?? 500;
        case "sm":
          return heights.sm ?? heights.base ?? 420;
        default:
          return heights.base ?? 380;
      }
    },
    [heights.base, heights.sm, heights.md, heights.lg]
  );

  // Memoized widget builder; safe for useEffect deps
  const buildWidget = useCallback(
    (height: number) => {
      const container = containerRef.current;
      if (!container) return;

      // Reset container so we don't double-inject on rebuilds
      container.innerHTML = `
        <div class="tradingview-widget-container__widget" style="width:100%;"></div>
        <div class="tradingview-widget-copyright">
          <a href="https://se.tradingview.com/economic-calendar/" rel="noopener noreferrer nofollow" target="_blank">
            <span class="blue-text">Track all markets on TradingView</span>
          </a>
        </div>
      `;

      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = JSON.stringify({
        colorTheme: theme,
        isTransparent: transparent,
        locale,
        countryFilter: country,
        importanceFilter: importance,
        width: "100%",
        height,
      });
      container.appendChild(script); 

    },
    [theme, transparent, locale, country, importance]
  );

  useEffect(() => { 
    // Helpers scoped to the effect so they aren't deps
    const getBucket = () => {
      const w = window.innerWidth;
      if (w >= 1024) return "lg";
      if (w >= 768) return "md";
      if (w >= 640) return "sm";
      return "base";
    };

    // Capture the container node for cleanup (fixes the ref-in-cleanup warning)
    const containerNode = containerRef.current;

    // initial mount
    const initialBucket = getBucket();
    bucketRef.current = initialBucket;
    buildWidget(getHeightForBucket(initialBucket));

    // handle responsive rebuilds (debounced)
    let raf = 0;
    let timeout: number | null = null;

    const onResize = () => {
      if (timeout) window.clearTimeout(timeout);
      timeout = window.setTimeout(() => {
        raf = window.requestAnimationFrame(() => {
          const b = getBucket();
          if (b !== bucketRef.current) {
            bucketRef.current = b;
            buildWidget(getHeightForBucket(b));
          }
        });
      }, 120);
    };

    window.addEventListener("resize", onResize);

    return () => {
      if (timeout) window.clearTimeout(timeout);
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);

      // Use the captured node, not containerRef.current
      if (containerNode) containerNode.innerHTML = "";
    };
  }, [buildWidget, getHeightForBucket]);

  return (
    <div className={className}>
      <h4 className="text-base font-semibold mb-2">{title}</h4>
      {/* Let width be fluid via CSS; widget config uses width: "100%" */}
      <div
        className="tradingview-widget-container w-full"
        ref={containerRef}
        // Avoid layout shift before the script loads
        style={{
          minHeight:
            getHeightForBucket(
              typeof window === "undefined" ? "base" : bucketRef.current
            ),
        }}
      />
    </div>
  );
}

export default memo(TradingViewWidget);
