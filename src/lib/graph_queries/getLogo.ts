import "server-only";

import favicon from "../../../public/favicon_logo.png";

export async function getLogo() {
  return {
    sourceUrl: favicon.src, 
    altText: "Custom site favicon",  
    title: { rendered: "Site Logo" },
    meta: {},
  };
}
