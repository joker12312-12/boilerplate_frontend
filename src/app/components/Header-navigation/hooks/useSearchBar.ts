'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useId,
  useLayoutEffect,
} from 'react';
import { useRouter } from 'next/navigation';
import { Post } from '@/lib/types';
import { buildIndex, prefixRangeSorted } from '@/lib/search/binaryPrefix';

export type SearchResult = {
  id: string | number;
  title: string;
  href: string;
};

type SearchFn = (q: string, opts?: { signal?: AbortSignal }) => Promise<SearchResult[]>;

export interface UseSearchBarOptions {
  value: string;
  onChange: (value: string) => void;
  posts?: Post[];
  searchFn?: SearchFn;
  debounceMs?: number;
  maxResults?: number;
  minChars?: number;
}

export function useSearchBar({
  value,
  onChange,
  posts,
  searchFn,
  debounceMs = 220,
  maxResults = 10,
  minChars = 1,
}: UseSearchBarOptions) {
  const router = useRouter();

  // UI state
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(-1);
  const [debounced, setDebounced] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // refs
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const reqSeqRef = useRef(0);

  // stable per-instance prefix for option IDs
  const reactId = useId();
  const getOptionId = useCallback((idx: number) => `${reactId}-opt-${idx}`, [reactId]);

  // debounce the controlled value
  useEffect(() => {
    const t = setTimeout(() => setDebounced((value || '').trim()), debounceMs);
    return () => clearTimeout(t);
  }, [value, debounceMs]);

  // Build a binary-search index from posts (by title, lowercased for case-insensitive prefix)
  const prefixIndex = useMemo(() => {
    if (!Array.isArray(posts) || posts.length === 0) return null;
    return buildIndex(posts, (p) => (p?.title || '').toLocaleLowerCase());
  }, [posts]);

  // Local results via binary prefix search + date-desc within the prefix bucket
  const localResults: SearchResult[] = useMemo(() => {
    if (!debounced || !prefixIndex) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = prefixRangeSorted(prefixIndex, debounced.toLocaleLowerCase(), maxResults, (p: any) => p?.date);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return items.map((p: any) => ({
      id: p?.databaseId ?? p?.id ?? `slug:${p?.slug ?? ''}`,
      title: p?.title || 'Untitled',
      href: `/${p?.slug ?? ''}`,
    }));
  }, [debounced, prefixIndex, maxResults]);

  // results (remote if provided, else local)
  const [results, setResults] = useState<SearchResult[]>([]);

  // shallow equality to avoid useless setState
  const setResultsIfChanged = useCallback((next: SearchResult[]) => {
    setResults((prev) => {
      if (
        prev.length === next.length &&
        prev.every(
          (p, i) => p.id === next[i].id && p.href === next[i].href && p.title === next[i].title
        )
      ) {
        return prev;
      }
      return next;
    });
  }, []);

  // Tiny LRU-ish cache for remote results to reduce thrash on backspacing
  const cacheRef = useRef<Map<string, SearchResult[]>>(new Map());
  const MAX_CACHE = 100;
  const cacheSet = (k: string, v: SearchResult[]) => {
    const m = cacheRef.current;
    if (m.size >= MAX_CACHE) {
      const firstKey = m.keys().next().value;
      if (firstKey !== undefined) m.delete(firstKey);
    }
    m.set(k, v);
  };

  useEffect(() => {
    let alive = true;

    if (!debounced || debounced.length < minChars) {
      setResultsIfChanged([]);
      setHi(-1);
      setLoading(false);
      setError(null);
      return;
    }

    // Ingen fjärrsökning: använd lokala binära prefixresultat
    if (!searchFn) {
      setError(null);
      setLoading(false);
      setResultsIfChanged(localResults);
      return;
    }

    // Cache check first
    const cached = cacheRef.current.get(debounced);
    if (cached) {
      setError(null);
      setLoading(false);
      setResultsIfChanged(cached.length > 0 ? cached.slice(0, maxResults) : localResults);
      return;
    }

    // Remote search with abort + stale protection
    const seq = ++reqSeqRef.current;
    const ac = new AbortController();

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const remote = (await searchFn(debounced, { signal: ac.signal })) || [];
        if (!alive || seq !== reqSeqRef.current) return;
        cacheSet(debounced, remote);
        const sliced = Array.isArray(remote) ? remote.slice(0, maxResults) : [];
        // Prefer remote results if present; otherwise fall back to local prefix results
        setResultsIfChanged(sliced.length > 0 ? sliced : localResults);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        if (!alive || ac.signal.aborted) return;
        cacheSet(debounced, []); // negative caching avoids repeated failing calls
        setResultsIfChanged(localResults);
        setError(e?.message || 'Sökning misslyckades');
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
      ac.abort();
    };
  }, [debounced, minChars, searchFn, localResults, maxResults, setResultsIfChanged]);

  // default highlight when opening / results change
  useEffect(() => {
    if (open && results.length > 0 && hi < 0) setHi(0);
    if (!open) setHi(-1);
  }, [open, results.length, hi]);

  // keep highlighted item visible (layout to avoid jump)
  useLayoutEffect(() => {
    if (!open || hi < 0) return;
    const el = document.getElementById(getOptionId(hi));
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [open, hi, getOptionId]);

  // nav helpers
  const go = useCallback((href: string) => {
    setOpen(false);
    router.push(href);
  }, [router]);

  const submitSearch = useCallback(() => {
    const q = (value || '').trim();
    setOpen(false);
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
    else inputRef.current?.focus();
  }, [router, value]);

  // handlers
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setOpen(true);
  }, [onChange]);

  const handleInputFocus = useCallback(() => setOpen(true), []);

  const handleFormSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    submitSearch();
  }, [submitSearch]);

  const handleIconClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    submitSearch();
  }, [submitSearch]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // If nothing to navigate, Enter should still submit the search page
    if (!open || results.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        submitSearch();
      } else if (e.key === 'Tab') {
        setOpen(false);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHi(i => (i < 0 ? 0 : (i + 1) % results.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHi(i => (i < 0 ? results.length - 1 : (i - 1 + results.length) % results.length));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setHi(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setHi(results.length - 1);
    } else if (e.key === 'PageDown') {
      e.preventDefault();
      setHi(i => Math.min(results.length - 1, (i < 0 ? 0 : i) + 5));
    } else if (e.key === 'PageUp') {
      e.preventDefault();
      setHi(i => Math.max(0, (i < 0 ? 0 : i) - 5));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (hi >= 0) go(results[hi].href);
      else submitSearch();
    } else if (e.key === 'Escape') {
      setOpen(false);
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  }, [open, results, hi, go, submitSearch]);

  // mouse: track hovered item (don’t reset on leave)
  const handleResultMouseEnter = useCallback((e: React.MouseEvent<HTMLLIElement>) => {
    const idx = Number((e.currentTarget as HTMLLIElement).dataset.index);
    if (!Number.isNaN(idx)) setHi(idx);
  }, []);
  const handleResultMouseDown = useCallback((e: React.MouseEvent<HTMLLIElement>) => {
    e.preventDefault(); // prevent input blur before navigation
    const href = (e.currentTarget as HTMLLIElement).dataset.href;
    if (href) go(href);
  }, [go]);

  const handleOpenFullResults = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    submitSearch();
  }, [submitSearch]);

  // outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const emptyState =
    !debounced || debounced.length < minChars
      ? `Skriv minst ${minChars} tecken${minChars > 1 ? 'er' : ''}…`
      : (posts && posts.length === 0 && !searchFn)
      ? 'Indexerar inlägg…'
      : results.length === 0 && !loading
      ? 'Inga resultat hittades.'
      : null;

  const close = useCallback(() => {
    setOpen(false);
    setHi(-1);
  }, []);

  return {
    // state
    open,
    hi,
    results,
    loading,
    error,
    debounced,
    emptyState,

    // refs
    containerRef,
    inputRef,

    // handlers
    handleInputChange,
    handleInputFocus,
    handleFormSubmit,
    handleIconClick,
    handleKeyDown,
    handleResultMouseEnter,
    handleResultMouseDown,
    handleOpenFullResults,

    // controls
    close,

    // a11y
    getOptionId,
  };
}
