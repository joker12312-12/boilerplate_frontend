"use client";

import React, {
  useEffect,
  useRef,
  memo,
  useCallback,
  useState,
  useId,
} from "react";

type HeightConfig = {
  base?: number;
  sm?: number;
  md?: number;
  lg?: number;
};

type Props = {
  title?: string;
  heights?: HeightConfig;
  className?: string;
};

const TV_SRC =
  "https://s3.tradingview.com/external-embedding/embed-widget-screener.js";
const TV_HOST = "https://s3.tradingview.com";

function TradingViewScreener({
  title = "Crypto idag",
  heights = { base: 320, sm: 380, md: 480, lg: 560 },
  className = "",
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bucketRef = useRef<"base" | "sm" | "md" | "lg">("base");

  const [open, setOpen] = useState(false);
  const [defaultColumn, setDefaultColumn] = useState<
    "overview" | "performance" | "oscillators" | "moving_averages"
  >("performance");
  const [displayCurrency, setDisplayCurrency] = useState<string>("USD");
  const [locale, setLocale] = useState<string>("sv_SE");
  const menuId = useId();

  useEffect(() => {
    const head = document.head;

    const ensure = (el: HTMLLinkElement) => {
      const links = Array.from(head.getElementsByTagName("link"));
      const exists = links.some(
        (link) => link.rel === el.rel && link.href === el.href
      );
      if (!exists) head.appendChild(el);
    };

    const preconnect = document.createElement("link");
    preconnect.rel = "preconnect";
    preconnect.href = TV_HOST;
    preconnect.crossOrigin = "anonymous";
    ensure(preconnect);

    const dnsPrefetch = document.createElement("link");
    dnsPrefetch.rel = "dns-prefetch";
    dnsPrefetch.href = TV_HOST;
    ensure(dnsPrefetch);

    const preload = document.createElement("link");
    preload.rel = "preload";
    preload.as = "script";
    preload.href = TV_SRC;
    preload.crossOrigin = "anonymous";
    ensure(preload);
  }, []);

  const getHeightForBucket = useCallback(
    (b: "base" | "sm" | "md" | "lg") => {
      switch (b) {
        case "lg":
          return heights.lg ?? heights.md ?? heights.sm ?? heights.base ?? 560;
        case "md":
          return heights.md ?? heights.sm ?? heights.base ?? 480;
        case "sm":
          return heights.sm ?? heights.base ?? 380;
        default:
          return heights.base ?? 320;
      }
    },
    [heights.base, heights.sm, heights.md, heights.lg]
  );

  const buildWidget = useCallback(
    (heightPx: number) => {
      const container = containerRef.current;
      if (!container) return;

      container.innerHTML = `
        <div class="tradingview-widget-container__widget" style="width:100%; height:${heightPx}px;"></div>
      `;

      const script = document.createElement("script");
      script.src = TV_SRC;
      script.type = "text/javascript";
      script.async = true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (script as any).fetchPriority = "high";
      script.crossOrigin = "anonymous";
      script.referrerPolicy = "no-referrer";
      script.innerHTML = JSON.stringify({
        defaultColumn,
        screener_type: "crypto_mkt",
        displayCurrency,
        colorTheme: "light",
        isTransparent: false,
        locale,
        width: "100%",
        height: "50%",
      });
      container.appendChild(script);
    },
    [defaultColumn, displayCurrency, locale]
  );

  useEffect(() => {
    const getBucket = (): "base" | "sm" | "md" | "lg" => {
      const w = window.innerWidth;
      if (w >= 1024) return "lg";
      if (w >= 768) return "md";
      if (w >= 640) return "sm";
      return "base";
    };

    const containerNode = containerRef.current;
    const initialBucket = getBucket();
    bucketRef.current = initialBucket;
    buildWidget(getHeightForBucket(initialBucket));

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
      if (containerNode) containerNode.innerHTML = "";
    };
  }, [buildWidget, getHeightForBucket]);

  return (
    <div className={`flex justify-center bg-[var(--secBG)] ${className}`}>
      <div className="w-full px-1 sm:px-2 lg:w-[90%] xl:w-[70%]">
        <div className="flex items-center justify-between gap-2 mb-2">
          <h4 className="text-sm sm:text-base font-semibold text-center w-full md:w-auto md:text-left">
            {title}
          </h4>

          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded-md border px-2.5 py-1.5 text-sm hover:bg-gray-50"
            aria-controls={menuId}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Växla alternativ</span>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
              <rect x="3" y="6" width="18" height="2" rx="1"></rect>
              <rect x="3" y="11" width="18" height="2" rx="1"></rect>
              <rect x="3" y="16" width="18" height="2" rx="1"></rect>
            </svg>
          </button>
        </div>

        <div
          id={menuId}
          className={`${open ? "block" : "hidden"} md:block mb-3 rounded-md border p-2 bg-white`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <label className="flex flex-col text-xs">
              <span className="mb-1 font-medium">Column</span>
              <select
                value={defaultColumn}
                onChange={(e) =>
                  setDefaultColumn(
                    e.target.value as
                      | "overview"
                      | "performance"
                      | "oscillators"
                      | "moving_averages"
                  )
                }
                className="rounded-md border px-2 py-1 text-sm"
              >
                <option value="overview">Overview</option>
                <option value="performance">Performance</option>
                <option value="oscillators">Oscillators</option>
                <option value="moving_averages">Moving Averages</option>
              </select>
            </label>

            <label className="flex flex-col text-xs">
              <span className="mb-1 font-medium">Currency</span>
              <select
                value={displayCurrency}
                onChange={(e) => setDisplayCurrency(e.target.value)}
                className="rounded-md border px-2 py-1 text-sm"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="SEK">SEK</option>
                <option value="GBP">GBP</option>
                <option value="JPY">JPY</option>
              </select>
            </label>

            <label className="flex flex-col text-xs">
              <span className="mb-1 font-medium">Locale</span>
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
                className="rounded-md border px-2 py-1 text-sm"
              >
                <option value="sv_SE">sv_SE</option>
                <option value="en">en</option>
                <option value="en_US">en_US</option>
                <option value="de_DE">de_DE</option>
              </select>
            </label>
          </div>
          <p className="mt-2 text-[11px] text-gray-500">
            Preconnect + preload added for faster script fetch.
          </p>
        </div>

        <div
          ref={containerRef}
          className="tradingview-widget-container w-full"
          style={{
            minHeight:
              getHeightForBucket(
                typeof window === "undefined" ? "base" : bucketRef.current
              ),
          }}
        />
      </div>
    </div>
  );
}

export default memo(TradingViewScreener);
