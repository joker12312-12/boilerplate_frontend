const host = process.env.NEXT_PUBLIC_HOSTNAME || 'Hem';


// Footer links
export const links = [
    { title: 'Kontakt', href: '/contact' },
    { title: host ? `Om ${host}` : 'Om', href: '/about' },
    { title: 'Integritetspolicy', href: '/privacy' },
    { title: 'Sociala medier', href: '#footer' },
    { title: 'Arkiv', href: '/archive' },
];




// Header links
export const DEFAULT_LINKS = [
  { title: 'Contact', href: '/contact' },
  {
    title: host ? `About ${host}` : 'About',
    href: '/about',
  },
  { title: 'Privacy policy', href: '/privacy' },
  { title: 'Social Media', href: '#footer' },
  { title: 'Archive', href: '/archive' },
];