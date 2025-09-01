export async function register() {
  const orig = globalThis.fetch;
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const start = Date.now();
    try {
      return await orig(input, init);
    } finally {
      const url = typeof input === "string" ? input : (input as URL).toString();
      const ms = Date.now() - start;
      console.log(`[fetch] ${url} ${ms}ms cache=${init?.cache ?? "default"}`);
    }
  };
}
