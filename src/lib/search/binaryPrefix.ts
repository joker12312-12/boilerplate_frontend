// src/lib/search/binaryPrefix.ts

export type IndexedDoc<T> = { key: string; item: T };

/** Normalize for case/diacritics-insensitive prefix matching */
export function normalize(s: string): string {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

/** Build a sorted index by normalized key (e.g., title) */
export function buildIndex<T>(docs: T[], getKey: (t: T) => string): IndexedDoc<T>[] {
  return docs
    .map((item) => ({ key: normalize(getKey(item)), item }))
    .sort((a, b) => a.key.localeCompare(b.key));
}

/** Lower bound: first i where arr[i].key >= target */
function lowerBound<T>(arr: IndexedDoc<T>[], target: string): number {
  let lo = 0,
    hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (arr[mid].key < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/** Basic prefix range (no extra sort) */
export function prefixRange<T>(
  index: IndexedDoc<T>[],
  prefixRaw: string,
  limit = 10
): T[] {
  if (!prefixRaw) return [];
  const prefix = normalize(prefixRaw);

  const lo = lowerBound(index, prefix);
  const hi = lowerBound(index, prefix + '\uFFFF');

  const result: T[] = [];
  for (let i = lo; i < hi && result.length < limit; i++) {
    result.push(index[i].item);
  }
  return result;
}

/**
 * Prefix range sorted by date DESC within the matched bucket.
 * `getDate` should return an ISO date string (or parseable by Date).
 */
export function prefixRangeSorted<T>(
  index: IndexedDoc<T>[],
  prefixRaw: string,
  limit: number,
  getDate: (t: T) => string | undefined | null
): T[] {
  if (!prefixRaw) return [];
  const prefix = normalize(prefixRaw);

  const lo = lowerBound(index, prefix);
  const hi = lowerBound(index, prefix + '\uFFFF');
  if (lo >= hi) return [];

  const bucket = index.slice(lo, hi).map((x) => x.item);

  bucket.sort((a, b) => {
    const at = Date.parse(getDate(a) || '') || 0;
    const bt = Date.parse(getDate(b) || '') || 0;
    return bt - at; // newest first
  });

  return bucket.slice(0, limit);
}
