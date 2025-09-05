// app/robots.ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_HOST_URL!;

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/wp-content/', '/wp-includes/'],
        disallow: [
          '/admin/',
          '/wp-admin/',
          '/wp-login.php',
          '/xmlrpc.php',
          '/cgi-bin/',
          '/login/',
          '/register/',
          '/profile/',
          '/user/',
          '/account/',
          '/dashboard/',
          '/author/',
          '/search/',
          '/*?q=',
        ],
      },
    ],
    sitemap: [`${base}/sitemap-index.xml`],
  };
}
