// app/components/FooterNavItem.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { renderNewsletter } from './newsletter/renderNewsletter';

export default function FooterNavItem({
  title,
  href,
}: {
  title: string;
  href?: string;
}) {
  const pathname = usePathname();
  const isActive = href && pathname === href;
  const baseBtnClasses =
    'text-base w-full justify-start px-0 break-normal whitespace-normal hyphens-auto text-pretty';

    
  if (title.toLowerCase() === "nyhetsbrev") {
    return renderNewsletter(baseBtnClasses, title);
  }


  if (!href) {
    return (
      <Button variant="link" className={baseBtnClasses}>
        {title}
      </Button>
    );
  }

  if (href.startsWith('#')) {
    return (
      <Button
        type="button"
        variant="link"
        className={`${baseBtnClasses} ${isActive ? 'text-yellow-500' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          const el = document.getElementById(href.replace('#', ''));
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        {title}
      </Button>
    );
  }

  return (
    <Button
      asChild
      variant="link"
      className={`${baseBtnClasses} ${isActive ? 'text-yellow-500' : ''}`}
    >
      <Link prefetch={false} href={href}>{title}</Link >
    </Button>
  );
}
