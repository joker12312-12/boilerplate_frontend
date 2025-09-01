"use client";

import dynamic from "next/dynamic";

const ShareButtons = dynamic(() =>
  import("../_components/ShareButtons").then((mod) => mod.ShareButtons)
);

export default function ShareButtonsClient(props: { postUrl: string; postTitle: string; postExcerpt: string }) {
  return <ShareButtons {...props} />;
}
