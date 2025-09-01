'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';

type Category = { id: string | number; name: string; slug: string };

interface DesktopNavProps {
  links?: { title: string; href: string }[];
  onNewsletterClick: () => void;
  categories: Category[];
}

export default function DesktopNav({ onNewsletterClick, categories }: DesktopNavProps) {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-3">
      {/* Categories — end-aligned parent already handled by Header */}
      <NavigationMenu>
        <NavigationMenuList className="flex items-center gap-2">
          {categories?.length > 0 && (
            <NavigationMenuItem>
              <div
                className="
                  flex items-center gap-1
                  overflow-x-auto lg:overflow-hidden
                  flex-nowrap
                  whitespace-nowrap
                  scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent
                  -mx-2 px-2 lg:mx-0 lg:px-0
                  w-full
                  max-w-[92vw] md:max-w-[80vw] lg:max-w-[60vw] xl:max-w-[72vw]
                "
                aria-label="Kategorier"
                role="navigation"
              >
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  asChild
                  variant="ghost"
                  className="
                    px-3 md:px-3.5 lg:px-4
                    py-1.5 md:py-2
                    text-sm md:text-[0.95rem] lg:text-base
                    font-normal min-w-0 shrink-0
                    text-black hover:bg-transparent hover:underline
                  "
                >
                  <Link href={`/category/${cat.slug}`} className="truncate" prefetch={false}>
                    {cat.name}
                  </Link>
                </Button>
              ))}
            </div>
            </NavigationMenuItem>
          )}
        </NavigationMenuList>
      </NavigationMenu>

      {/* Right-side actions */}
      <div className="flex items-center gap-2">
        <Button
          asChild
          variant="ghost"
          className={`text-base font-normal min-w-0 text-black p-0${
            pathname === '/advertisement' ? 'ring-2 ring-gray-300' : ''
          }`}
        >
          <Link href="/advertisement" prefetch={false}>Annonsera</Link>
        </Button>

        <Button
          onClick={onNewsletterClick}
          variant="ghost"
          className="text-base font-normal min-w-0 text-black"
        >
          Nyhetsbrev
        </Button>
      </div>
    </div>
  );
}