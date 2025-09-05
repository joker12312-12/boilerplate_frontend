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
          'google.com, pub-4868110039996635, DIRECT, f08c47fec0942fa0'
        ],
      },
    ],
    sitemap: [`${base}/sitemap-index.xml`],
  };
}
