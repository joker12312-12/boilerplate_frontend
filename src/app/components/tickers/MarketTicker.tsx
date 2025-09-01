"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

type TickerItem = {
  symbol: string;
  label?: string;
  price: number;
  changePct: number; // e.g. +1.52
};

function Pill({ item }: { item: TickerItem }) {
  const positive = item.changePct >= 0;
  const arrow = positive ? "▲" : "▼";
  const pct = Math.abs(item.changePct).toFixed(2) + "%";

  return (
    <div
      className="flex items-center gap-2 rounded-full bg-zinc-900 text-zinc-100 px-3 py-1.5 shadow-sm border border-zinc-800 min-w-[12rem]"
      role="group"
      aria-label={`${item.label || item.symbol} ${item.price} ${positive ? "up" : "down"} ${pct}`}
    >
      <span className="font-semibold tracking-tight whitespace-nowrap">
        {item.label || item.symbol}
      </span>
      <span className="text-zinc-300 tabular-nums">
        {new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(item.price)}
      </span>
      <span
        className={`flex items-center tabular-nums text-xs rounded-md px-1.5 py-0.5 ${
          positive ? "text-emerald-300" : "text-red-300"
        }`}
      >
        {arrow}
        <span className="ml-1">{pct}</span>
      </span>
    </div>
  );
}

export default function TickerPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <MarketTicker
        symbols={[
          "SP:SPX","NASDAQ:NDX","DJ:DJI","CBOE:VIX",
          "TVC:US10Y","NYMEX:CL1!","COMEX:GC1!","TVC:DXY",
          "FOREXCOM:EURUSD","BINANCE:BTCUSDT","BINANCE:ETHUSDT",
          "NASDAQ:AAPL","NASDAQ:MSFT","NASDAQ:NVDA","NYSE:TSLA",
          "NYSE:BRK.B","NYSE:JPM","XETR:DAX","TVC:NIKKEI","TVC:FTSE","INDEX:CSI300",
        ]}
      />
    </main>
  );
}

export function MarketTicker({
  symbols,
  refreshMs = 15000,
  autoplayMs = 2400,
  className = "",
}: {
  symbols: string[];
  refreshMs?: number;
  autoplayMs?: number;
  className?: string;
}) {
  const [items, setItems] = useState<TickerItem[]>([]);
  const [api, setApi] = useState<CarouselApi | null>(null);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch quotes from our server route (which talks to TradingView/proxy)
  const fetchQuotes = async () => {
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbols }),
        cache: "no-store",
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as TickerItem[];
      setItems(data);
    } catch (e) {
      console.error("quotes error", e);
      // Ingen hård krasch; behåll det vi hade tidigare
    }
  };

  useEffect(() => {
    fetchQuotes();
    const id = setInterval(fetchQuotes, refreshMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(symbols), refreshMs]);

  // Autoplay + pause on hover + keyboard arrows
  useEffect(() => {
    if (!api) return;

    const start = () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
      autoplayRef.current = setInterval(() => api.scrollNext(), autoplayMs);
    };
    const stop = () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    };

    start();

    const node = api.containerNode();
    const onEnter = () => stop();
    const onLeave = () => start();
    node.addEventListener("mouseenter", onEnter);
    node.addEventListener("mouseleave", onLeave);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") { e.preventDefault(); api.scrollNext(); }
      if (e.key === "ArrowLeft")  { e.preventDefault(); api.scrollPrev(); }
    };
    node.setAttribute("tabindex", "0");
    node.addEventListener("keydown", onKey);

    return () => {
      stop();
      node.removeEventListener("mouseenter", onEnter);
      node.removeEventListener("mouseleave", onLeave);
      node.removeEventListener("keydown", onKey);
    };
  }, [api, autoplayMs]);

  const displayItems = useMemo(() => items.length ? items : seedFallback, [items]);

  // --- Prevent overlap with right-side buttons: pad the content on the right ---
  // Button cluster is ~72px wide; we give content a matching padding.
  const BUTTONS_WIDTH_PX = 72;

  return (
    <div className={`w-full bg-zinc-950 text-zinc-100 border-y border-zinc-900 ${className}`}>
      <div className="mx-auto max-w-screen-2xl px-2 sm:px-4">
        <div className="relative py-2">
          <Carousel opts={{ align: "start", loop: true }} className="w-full" setApi={setApi}>
            <CarouselContent className="-ml-2 pr-[72px]">
              {displayItems.map((it, i) => (
                <CarouselItem key={`${it.symbol}-${i}`} className="basis-auto pl-2">
                  <Pill item={it} />
                </CarouselItem>
              ))}
              {/* Spacer to ensure last pill never hides under the buttons */}
              <div style={{ width: BUTTONS_WIDTH_PX }} aria-hidden />
            </CarouselContent>

            {/* Controls (absolute) */}
            <div
              className="hidden sm:flex gap-1 absolute right-2 top-1/2 -translate-y-1/2 z-10"
              style={{ width: BUTTONS_WIDTH_PX }}
              aria-hidden="true"
            >
              <button
                className="rounded-full p-2 hover:bg-zinc-800 border border-zinc-800"
                onClick={() => api?.scrollPrev()}
                aria-label="Skrolla åt vänster"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                className="rounded-full p-2 hover:bg-zinc-800 border border-zinc-800"
                onClick={() => api?.scrollNext()}
                aria-label="Skrolla åt höger"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Subtle right edge gradient */}
            <div className="pointer-events-none absolute inset-y-0 right-[72px] w-8 bg-gradient-to-l from-zinc-950 to-transparent" />
          </Carousel>
        </div>
      </div>
    </div>
  );
}

// Fallback shown before first response returns (optional)
const seedFallback: TickerItem[] = [
  { symbol: "SP:SPX", label: "S&P 500", price: 6466.91, changePct: 1.52 },
  { symbol: "NASDAQ:NDX", label: "Nasdaq 100", price: 21496.54, changePct: 1.88 },
  { symbol: "DJ:DJI", label: "Dow", price: 40111.23, changePct: 0.73 },
  { symbol: "CBOE:VIX", label: "VIX", price: 12.45, changePct: -3.12 },
  { symbol: "TVC:US10Y", label: "US 10 Yr", price: 4.25, changePct: 0.60 },
  { symbol: "NYMEX:CL1!", label: "Crude Oil", price: 83.66, changePct: 0.22 },
  { symbol: "COMEX:GC1!", label: "Gold", price: 2321.5, changePct: -0.18 },
  { symbol: "TVC:DXY", label: "Dollar Index", price: 104.33, changePct: 0.11 },
  { symbol: "FOREXCOM:EURUSD", label: "EUR/USD", price: 1.084, changePct: 0.08 },
  { symbol: "BINANCE:BTCUSDT", label: "Bitcoin", price: 64123, changePct: -0.92 },
  { symbol: "BINANCE:ETHUSDT", label: "Ethereum", price: 3231.7, changePct: 0.65 },
  { symbol: "NASDAQ:AAPL", label: "Apple", price: 228.43, changePct: 1.12 },
];
