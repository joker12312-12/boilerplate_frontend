'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Search from '../icons/search';
import { useSearchBar, SearchResult } from './hooks/useSearchBar';
import { Post } from '@/lib/types';

/** Escape for safe regex */
function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Highlight only the PREFIX (case-insensitive) */
function highlightPrefix(text: string, query: string): React.ReactNode {
  if (!text || !query) return text;
  const re = new RegExp(`^(${escapeRegExp(query)})`, 'i');
  const m = text.match(re);
  if (!m) return text;
  const start = m.index ?? 0;
  const end = start + m[0].length;
  return (
    <>
      {start > 0 && <span>{text.slice(0, start)}</span>}
      <mark className="bg-yellow-200/70 rounded px-0.5">{text.slice(start, end)}</mark>
      {end < text.length && <span>{text.slice(end)}</span>}
    </>
  );
}

interface SearchBarInlineProps {
  value: string;
  onChange: (value: string) => void;
  posts?: Post[];
  searchFn?: (q: string) => Promise<SearchResult[]>;
  className?: string;
}

export default function SearchBarInline({
  value,
  onChange,
  posts,
  searchFn,
  className,
}: SearchBarInlineProps) {
  const {
    open,
    hi,
    results,
    loading,
    error,
    emptyState,
    debounced,
    containerRef,
    inputRef,
    handleInputChange,
    handleInputFocus,
    handleFormSubmit,
    handleIconClick,
    handleKeyDown,
    handleResultMouseEnter,
    handleResultMouseDown,
    handleOpenFullResults,
    getOptionId,
    close, // new
  } = useSearchBar({ value, onChange, posts, searchFn });

  const listboxUid = React.useId();
  const listboxId = `${listboxUid}-listbox`;

  const handleClear = () => {
    onChange('');
    close(); // also closes popover & clears highlight
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={className ?? 'w-full max-w-xl'}>
      <form onSubmit={handleFormSubmit} className="relative w-full">
        <Input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls={open ? listboxId : undefined}
          aria-activedescendant={open && hi >= 0 ? getOptionId(hi) : undefined}
          inputMode="search"
          enterKeyHint="search"
          value={value || ''}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder="Sök…"
          aria-label="Sök"
          className="pr-20"
        />

        {/* Clear button — simple "X" */}
        {value && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Rensa sökning"
            onClick={handleClear}
            className="absolute right-10 top-1/2 -translate-y-1/2 rounded-md hover:bg-muted/70"
          >
            X
          </Button>
        )}

        {/* Search icon button */}
        <Button
          type="submit"
          size="icon"
          variant="ghost"
          aria-label="Sök"
          onClick={handleIconClick}
          className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md bg-muted/70 hover:bg-muted/85"
        >
          <Search className="h-5 w-5" aria-hidden="true" />
        </Button>

        {/* Dropdown (same width as input) */}
        {open && (
          <div
            id={listboxId}
            role="listbox"
            aria-label="Sökförslag"
            className="absolute inset-x-0 top-full mt-2 z-[60] rounded-xl border bg-background shadow-lg overflow-hidden"
          >
            {loading ? (
              <div className="px-3 py-3 text-sm text-muted-foreground">Söker…</div>
            ) : emptyState ? (
              <div className="px-3 py-3 text-sm text-muted-foreground">{emptyState}</div>
            ) : (
              <ul className="max-h-80 overflow-auto py-2">
                {results.map((r, idx) => {
                  const active = hi === idx;
                  return (
                    <li
                      key={r.id}
                      id={getOptionId(idx)}
                      role="option"
                      aria-selected={active}
                      data-index={idx}
                      data-href={r.href}
                      onMouseEnter={handleResultMouseEnter}
                      onMouseDown={handleResultMouseDown}
                      className={`group relative w-full cursor-pointer text-left px-3 py-3 text-sm transition-all duration-150 ${
                        active ? 'bg-primary/5' : 'hover:bg-primary/15'
                      }`}
                    >
                      {/* Left active accent bar */}
                      <span
                        className={`absolute left-0 top-0 h-full w-1 rounded-r-sm transition-opacity ${
                          active
                            ? 'opacity-100 bg-primary'
                            : 'opacity-0 group-hover:opacity-60 bg-primary/80'
                        }`}
                        aria-hidden="true"
                      />
                      <div className="font-medium line-clamp-1">
                        {highlightPrefix(r.title, debounced)}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            {error && !loading && results.length === 0 && (
              <div className="px-3 py-2 text-xs text-red-600/80">Sökfel: {error}</div>
            )}
            <div className="border-t px-3 py-2 flex items-center justify-between text-xs text-muted-foreground">
              <button className="underline hover:cursor-pointer" onMouseDown={handleOpenFullResults}>
                Öppna alla resultat
              </button>
              <span>Esc • ↑/↓ • Home/End • PgUp/PgDn</span>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
