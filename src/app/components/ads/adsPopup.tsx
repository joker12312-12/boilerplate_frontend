'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export type AdPopupVariant =
  | 'current'
  | 'red'
  | 'lightBlue'
  | 'emerald'
  | 'orange'
  | 'purple'
  | 'amber'
  | 'rose'
  | 'highContrast'
  | 'outline';

type Theme = {
  text: string;
  cta: string;
  badge: string;
  border: string;
  bg: string;
  style: React.CSSProperties;
};

interface AdPopupProps {
  logo?: { sourceUrl?: string; altText?: string } | null;
  variant?: AdPopupVariant;
  sessionKey?: string;
  onClose?: () => void;
}

/** --- Randomization pool in one place --- */
const VARIANT_POOL: AdPopupVariant[] = [
  'current',
  'red',
  'lightBlue',
  'emerald',
  'orange',
  'purple',
  'amber',
  'rose',
  'highContrast',
  'outline',
];

/** Central place to define theme tokens for each variant */
function getTheme(variant: AdPopupVariant): Theme {
  const base: Theme = {
    text: 'text-gray-900',
    cta: 'bg-black text-white hover:bg-gray-800',
    badge: 'bg-black text-white',
    border: 'border-gray-300',
    bg: 'bg-[#97d5c9]',
    style: {},
  };

  switch (variant) {
    case 'red':
      return {
        ...base,
        text: 'text-white',
        cta: 'bg-white text-black hover:bg-gray-100',
        badge: 'bg-white text-black',
        border: 'border-red-600',
        bg: 'bg-red-500',
      };
    case 'lightBlue':
      return {
        ...base,
        text: 'text-gray-900',
        cta: 'bg-black text-white hover:bg-gray-800',
        badge: 'bg-black text-white',
        border: 'border-sky-300',
        bg: 'bg-sky-200',
      };
    case 'emerald':
      return {
        ...base,
        text: 'text-emerald-950',
        cta: 'bg-emerald-700 text-white hover:bg-emerald-800',
        badge: 'bg-emerald-700 text-white',
        border: 'border-emerald-400',
        bg: 'bg-emerald-200',
      };
    case 'orange':
      return {
        ...base,
        text: 'text-orange-950',
        cta: 'bg-orange-600 text-white hover:bg-orange-700',
        badge: 'bg-orange-600 text-white',
        border: 'border-orange-400',
        bg: 'bg-orange-200',
      };
    case 'purple':
      return {
        ...base,
        text: 'text-white',
        cta: 'bg-white text-purple-900 hover:bg-purple-100',
        badge: 'bg-white text-purple-900',
        border: 'border-purple-400',
        bg: 'bg-purple-600',
      };
    case 'amber':
      return {
        ...base,
        text: 'text-amber-950',
        cta: 'bg-amber-600 text-white hover:bg-amber-700',
        badge: 'bg-amber-600 text-white',
        border: 'border-amber-400',
        bg: 'bg-amber-200',
      };
    case 'rose':
      return {
        ...base,
        text: 'text-rose-950',
        cta: 'bg-rose-600 text-white hover:bg-rose-700',
        badge: 'bg-rose-600 text-white',
        border: 'border-rose-400',
        bg: 'bg-rose-200',
      };
    case 'highContrast':
      return {
        ...base,
        text: 'text-black',
        cta: 'bg-black text-white hover:bg-gray-800',
        badge: 'bg-black text-white',
        border: 'border-black',
        bg: 'bg-yellow-300',
      };
    case 'outline':
      return {
        ...base,
        text: 'text-gray-900',
        cta: 'bg-transparent text-gray-900 border border-gray-900 hover:bg-gray-100',
        badge: 'bg-transparent text-gray-900 border border-gray-900',
        border: 'border-gray-900',
        bg: 'bg-white',
      };
    case 'current':
    default:
      return {
        ...base,
        border: 'border-[#7fbfb3]',
        bg: 'bg-[#97d5c9]',
      };
  }
}

export default function AdPopup({
  logo, 
  variant,
  sessionKey = 'adPopupClosed',
  onClose,
}: AdPopupProps) {
  const [visible, setVisible] = useState(false);
  const [randomVariant, setRandomVariant] = useState<AdPopupVariant>('current');

  // Pick a random variant on first load (unless an explicit variant is provided)
  useEffect(() => {
    if (!variant) {
      setRandomVariant(VARIANT_POOL[Math.floor(Math.random() * VARIANT_POOL.length)]);
    } else {
      setRandomVariant(variant);
    }
  }, [variant]);

  const theme = useMemo(() => getTheme(randomVariant), [randomVariant]);

  useEffect(() => {
    try {
      const closed = sessionStorage.getItem(sessionKey) === 'true';
      if (closed) {
        setVisible(false);
      } else {
        setVisible(true);
        sessionStorage.setItem(sessionKey, 'true');
      }
    } catch {
      setVisible(true);
    }
  }, [sessionKey]);

  useEffect(() => {
    const clear = () => sessionStorage.removeItem(sessionKey);
    window.addEventListener('beforeunload', clear);
    return () => window.removeEventListener('beforeunload', clear);
  }, [sessionKey]);

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  if (!visible) return null;

  return (
    <div
      className={[
        'fixed left-2 right-4 bottom-4 z-[1000]',
        theme.bg,
        theme.border,
        'border shadow-xl p-3 sm:p-4 animate-fadeIn max-w-[90vw] sm:max-w-5xl sm:ml-4 sm:mr-auto mx-auto rounded-lg overflow-hidden',
      ].join(' ')}
      style={theme.style}
    >
      <Button
        onClick={handleClose}
        variant="outline"
        aria-label="Stäng"
        className="absolute top-2 right-2 sm:top-3 sm:right-3 h-8 w-8 p-0 text-xs font-semibold uppercase tracking-wide hover:underline cursor-pointer z-20"
      >
        ✕
      </Button>

      <div className="flex flex-row lg:flex-row items-stretch gap-3 sm:gap-4 mt-3 w-full">
        <div
          className="
            relative shrink-0 overflow-hidden rounded-md
            w-1/4 h-auto
            sm:w-1/4 sm:h-32
            md:w-1/4 md:h-40
            lg:basis-1/3 lg:h-auto
            flex items-center justify-center bg-white
          "
        >
          <span className={`absolute top-2 left-2 ${theme.badge} text-[10px] px-1 sm:px-2 py-1 uppercase tracking-wide z-10`}>
            ANNONS
          </span>

          {logo?.sourceUrl ? (
            <Image
              src={logo.sourceUrl}
              alt={logo.altText || 'Logo'}
              fill
              className="object-contain object-center bg-white"
              sizes="
                (min-width:1024px) 33vw,
                (min-width:768px) 25vw,
                (min-width:640px) 25vw,
                25vw
              "
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
              <span className="font-bold text-gray-900 text-xs sm:text-sm">
                {process.env.NEXT_PUBLIC_HOSTNAME}
              </span>
            </div>
          )}
        </div>

        <div className={`flex-1 min-w-0 flex flex-col justify-between text-center sm:text-left ${theme.text}`}>
          <div>
            <span className="_block text-[11px] sm:text-[10px] tracking-wide uppercase opacity-90 mb-1">
              Sparkonto
            </span>

            <h3
              className="text-sm sm:text-base md:text-2xl font-extrabold leading-snug mb-1 line-clamp-2"
              style={{ margin: 0 }}
            >
              Sparkontot som toppar jämförelsen – lås in upp till 2,9 % i sparränta
            </h3>

            <p className="text-xs sm:text-sm md:text-base opacity-90 line-clamp-3">
              Få upp till 2,9 % i sparränta – tryggt med insättningsgaranti.
              Sparräntorna fortsätter att falla, men här hittar du kontot som ger
              högst ränta idag…
            </p>
          </div>

          <div className="mt-2 sm:mt-3 flex justify-center sm:justify-end">
            <Link href="/advertisement" passHref>
              <Button className={`w-full sm:w-auto px-6 py-2 text-sm sm:text-xs md:text-base font-semibold uppercase rounded-none ${theme.cta}`}>
                Läs mer
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}