'use client';

import { memo, useEffect, useRef } from 'react';

const SRC =
  'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';

const CONFIG = {
  symbols: [
    { proName: 'FOREXCOM:SPXUSD', title: 'S&P 500 Index' },
    { proName: 'FOREXCOM:NSXUSD', title: 'US 100 Cash CFD' },
    { proName: 'FX_IDC:EURUSD', title: 'EUR to USD' },
    { proName: 'BITSTAMP:BTCUSD', title: 'Bitcoin' },
    { proName: 'BITSTAMP:ETHUSD', title: 'Ethereum' },
    { proName: 'OMXSTO:OMXS30', title: 'OMX S30' },
    { proName: 'NASDAQ:TSLA', title: 'Tesla' },
  ],
  colorTheme: 'light',
  locale: 'en',
  largeChartUrl: '',
  isTransparent: false,
  showSymbolLogo: true,
  displayMode: 'adaptive',
} as const;

function TradingViewTickerTapeImpl() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.replaceChildren();

    const script = document.createElement('script');
    script.src = SRC;
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify(CONFIG);
    container.appendChild(script);

    return () => container.replaceChildren();
  }, []);

  return (
    <div
      className="tradingview-widget-container"
      style={{ backgroundColor: '#fff', overflow: 'hidden' }}
    >
      <div className="tradingview-widget-container__widget" ref={containerRef} />
      <div className="tradingview-widget-copyright">
        {/* Accessible copyright/attribution link */}
        <a
          href="https://www.tradingview.com/"
          target="_blank"
          rel="noopener noreferrer nofollow"
          aria-label="Quotes by TradingView. Open TradingView website in a new tab."
          className="tv-attrib-link"
        >
          <span className="visually-hidden">
            Quotes by TradingView — visit TradingView
          </span>
        </a>
      </div>

      {/* Optional inline CSS if you’re not using a global utility like Tailwind’s sr-only */}
      <style jsx>{`
        .visually-hidden {
          position: absolute !important;
          width: 1px !important;
          height: 1px !important;
          padding: 0 !important;
          margin: -1px !important;
          overflow: hidden !important;
          clip: rect(0 0 0 0) !important;
          white-space: nowrap !important;
          border: 0 !important;
        }
        .tv-attrib-link:focus {
          outline: 2px solid;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}

const TradingViewTickerTape = memo(TradingViewTickerTapeImpl);
export default TradingViewTickerTape;