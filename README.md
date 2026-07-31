# @halalterminal/sdk — TypeScript / JavaScript SDK

![AAPL halal status](https://api.halalterminal.com/api/badge/AAPL.svg) _live badge from the API, embed one for any symbol_

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

## Learn more

- [API reference](https://api.halalterminal.com/api-reference)
- [Sukuk screening guide](https://www.halalterminal.com/research/sukuk-screening)
- [Shariah-compliant ETFs compared (2026)](https://www.halalterminal.com/research/sharia-etf-comprehensive-analysis)
- [Is my stock halal? Screener](https://www.halalterminal.com/stocks)

## Part of the Halal Terminal ecosystem

[Website](https://www.halalterminal.com) · [API](https://api.halalterminal.com/api-reference) · [Python SDK](https://github.com/goww7/halalterminal-sdk-python) · [MCP server](https://github.com/goww7/halalterminal-mcp) · [Claude plugin](https://github.com/goww7/halalterminal-claude-skills) · [Discord bot](https://github.com/goww7/halal-discord-bot) · [TradingView indicator](https://github.com/goww7/halal-pine) · [Portfolio tracker](https://github.com/goww7/halal-portfolio-tracker)

## License

MIT. © Halal Terminal.


---

Part of the [Halal Terminal open ecosystem](https://github.com/goww7/awesome-islamic-finance):
[API](https://api.halalterminal.com) · [MCP server](https://github.com/goww7/halalterminal-mcp) · [Python SDK](https://github.com/goww7/halalterminal-sdk-python) · [JS SDK](https://github.com/goww7/halalterminal-sdk-js) · [Datasets](https://github.com/goww7/sp500-shariah-compliance) · [Awesome Islamic Finance](https://github.com/goww7/awesome-islamic-finance)
