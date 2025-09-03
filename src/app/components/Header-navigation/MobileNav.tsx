'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { MenuIcon } from 'lucide-react';
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerOverlay,
  DrawerClose,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';

interface LinkItem { title: string; href: string }
type Category = { id: string; name: string; slug: string };

interface MobileNavProps {
  links: LinkItem[];
  onNewsletterClick: () => void;
  categories: Category[];
}

export default function MobileNav({ links, onNewsletterClick, categories }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  const linkItems = useMemo(
    () =>
      links.map(({ title, href }) => (
        <li key={href}>
          <Button
            asChild
            variant="ghost"
            // CHANGED: shrink button height
            className="h-auto min-h-0 w-full text-left py-2 text-black font-normal"
            onClick={() => setOpen(false)}
          >
            <Link href={href} prefetch={false}>{title}</Link>
          </Button>
        </li>
      )),
    [links]
  );

  const categoryItems = useMemo(
    () =>
      categories.map((cat) => (
        <Button
          asChild
          key={cat.id}
          variant="ghost"
          // CHANGED: shrink button height
          className="h-auto min-h-0 w-full text-left py-2 px-2 text-black font-normal hover:bg-transparent hover:underline rounded-none"
          onClick={() => setOpen(false)}
        >
          <Link href={`/category/${cat.slug}`} prefetch={false}>{cat.name}</Link>
        </Button>
      )),
    [categories]
  );

  return (
    // (Optional) remove pl-2 if you want the hamburger snug to the edge
    <div className="flex items-center pl-2">
      <Drawer direction="right" open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          {/* (Optional) smaller tap target: p-1 */}
          <Button variant="ghost" className="p-2">
            <MenuIcon className="h-6 w-6 text-black" />
          </Button>
        </DrawerTrigger>

        <DrawerOverlay className="fixed inset-0 bg-black/30 z-40" />

        <DrawerContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="
            fixed top-0 right-0 h-screen w-full
            sm:w-[90vw] md:w-[70vw] lg:w-[50vw]
            bg-white z-50 shadow-lg flex flex-col
            data-[vaul-drawer-direction=right]:inset-y-0
            data-[vaul-drawer-direction=right]:right-0
            data-[vaul-drawer-direction=right]:border-l
            transition-transform duration-150 ease-out
          "
          style={{ willChange: 'transform' }}
        >
          <DrawerTitle className="sr-only">Mobilnavigering</DrawerTitle>

          {/* Drawer Header */}
          {/* CHANGED: p-4 -> p-3, removed mt-6 on the close button */}
          <div className="flex items-center justify-between border-b p-3">
            <DrawerClose asChild>
              <Button
                variant="ghost"
                onClick={() => setOpen(false)}
                className="text-black text-lg font-normal"
              >
                X
              </Button>
            </DrawerClose>
          </div>

          {/* Navigation Links */}
          {/* CHANGED: p-4 -> p-3; space-y-2 -> space-y-1 */}
          <div className="flex-1 overflow-y-auto p-3" style={{ contain: 'content' }}>
            <ul className="space-y-1">
              {open && (
                <>
                  {linkItems}

                  {/* Categories */}
                  {categories.length > 0 && (
                    <li>
                      {/* CHANGED: my-1 -> my-0.5 */}
                      <div className="border-b my-0.5" />
                      <div className="flex flex-col gap-0.5">{categoryItems}</div>
                    </li>
                  )}

                  {/* Advertisement */}
                  {/* CHANGED: mt-2 -> mt-1 and h-auto */}
                  <li>
                    <Button
                      asChild
                      variant="ghost"
                      className="h-auto min-h-0 w-full text-left py-2 mt-1 text-black font-normal"
                      onClick={() => setOpen(false)}
                    >
                      <Link href="/advertisement" prefetch={false}>
                        ANNONSERA
                      </Link>
                    </Button>
                  </li>

                  {/* Newsletter */}
                  {/* CHANGED: mt-2 -> mt-1 and h-auto */}
                  <li>
                    <Button
                      onClick={() => {
                        onNewsletterClick();
                        setOpen(false);
                      }}
                      variant="ghost"
                      className="h-auto min-h-0 w-full text-left py-2 mt-1 text-black font-normal"
                    >
NYHETSBREV
                    </Button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}