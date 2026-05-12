# @halalterminal/sdk — TypeScript / JavaScript SDK

Official TypeScript/JavaScript client for the [Halal Terminal API](https://halalterminal.com) — Shariah stock screening across 5 audited methodologies, real-time market data, ETF look-through, zakat & purification calculators.

Zero dependencies. Runs on Node 18+, modern browsers, Cloudflare Workers, and any runtime that exposes a `fetch` global.

## Install

```bash
npm install @halalterminal/sdk
# or
pnpm add @halalterminal/sdk
# or
yarn add @halalterminal/sdk
```

## Quickstart

```ts
import { HalalTerminal } from "@halalterminal/sdk";

const ht = new HalalTerminal({ apiKey: process.env.HALAL_TERMINAL_API_KEY });

const aapl = await ht.screen("AAPL");
console.log(aapl.is_compliant, aapl.shariah_compliance_status);

// Every relevant response carries typed disclaimers — render them.
for (const d of aapl.disclaimers) {
  console.log(`[${d.severity}] ${d.text}  (${d.url})`);
}
```

Need a free API key? `POST https://api.halalterminal.com/api/keys/generate` with `{"email": "you@example.com"}` — no credit card.

## Typed endpoints

```ts
const quote     = await ht.getQuote("MSFT");
const portfolio = await ht.scanPortfolio(["AAPL", "MSFT", "JNJ", "BAC"]);
const zakat     = await ht.calculateZakat(
  [{ symbol: "AAPL", market_value: 25_000 }],
  { goldPricePerGram: 65 },
);
const registry  = await ht.getDisclaimers(); // public, no key required
```

Each call returns a fully-typed response. Unknown server fields are preserved on the result object so the SDK never crashes on forward-compatible API changes.

## Generic escape hatch

```ts
const trending = await ht.get<Array<{ symbol: string; name: string }>>("/api/trending");
const report   = await ht.post("/api/reports/portfolio", { symbols: ["AAPL", "MSFT"] });
```

## Error handling

```ts
import { ApiKeyError, QuotaExceededError, NotFoundError } from "@halalterminal/sdk";

try {
  await ht.screen("NOTAREALTICKER");
} catch (e) {
  if (e instanceof NotFoundError) { /* ... */ }
  else if (e instanceof QuotaExceededError) { /* prompt upgrade — e.detail */ }
  else if (e instanceof ApiKeyError) { /* re-prompt for key */ }
  else throw e;
}
```

## Disclaimers

Every compliance / market-data / zakat / purification response carries a typed `disclaimers: Disclaimer[]`. Each disclaimer is versioned, severity-tagged (`religious` for fatwa caveats, `data` for freshness/sourcing), and deep-links to a specific section on the Halal Terminal legal page. Show them inline — the API ships your compliance copy for you.

## License

MIT. © Halal Terminal.
