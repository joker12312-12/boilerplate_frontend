// app/layout.tsx (or wherever this file lives)
import type { ReactNode } from "react";
import type { Metadata } from "next";
import dynamic from "next/dynamic";

import "@/styles/globals.css";

import { AppProvider } from "@/store/AppContext";
import { getLogo } from "@/lib/graph_queries/getLogo";

import HeaderServer from "./components/Main-page/HeaderServer";

const Footer = dynamic(() => import("./components/Main-page/Footer"), {
  loading: () => <div className="w-full h-24 bg-gray-100" />,
});

export async function generateMetadata(): Promise<Metadata> {
  // If getLogo fails or returns nothing, fall back to the public asset
  const logo = await getLogo().catch(() => null);

  return {
    title: process.env.NEXT_PUBLIC_HOSTNAME ?? "Default Title",
    description:
      "Dina dagliga nyheter inom finans, aktier och börsen",
    keywords: ["ekonominyheter", "börsen", "aktier", "ekonomi", "finans"],
    icons: {
      icon: (typeof logo === "string" && logo) || "./full_logo_with_slogan.png",
    },
  };
}

interface RootLayoutProps {
  children: ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const [favicon] = await Promise.all([
    getLogo().catch(() => null),
  ]);

  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          href={
            (typeof favicon === "string" && favicon) ||
            "./full_logo_with_slogan.png"
          }
          type="image/png"
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <AppProvider logo={favicon} >
          <HeaderServer />
          <main className="flex-1">{children}</main>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}