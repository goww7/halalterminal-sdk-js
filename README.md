# @halalterminal/sdk — TypeScript / JavaScript SDK

Official TypeScript/JavaScript client for the [Halal Terminal API](https://halalterminal.com) — Shariah stock screening across 5 audited methodologies, real-time market data, ETF look-through, zakat & purification calculators.

**Zero dependencies.** Runs on Node 18+, modern browsers, Cloudflare Workers, and any runtime that exposes a `fetch` global.

---

## Table of Contents

- [Install](#install)
- [Authentication](#authentication)
- [Quickstart](#quickstart)
- [Usage Examples](#usage-examples)
  - [Screen a stock](#screen-a-stock)
  - [Portfolio scan](#portfolio-scan)
  - [Real-time quote](#real-time-quote)
  - [Zakat calculator](#zakat-calculator)
  - [Error handling](#error-handling)
  - [Disclaimer rendering](#disclaimer-rendering)
  - [Generic escape hatch](#generic-escape-hatch)
- [API Reference](#api-reference)
  - [Constructor](#constructor)
  - [Methods](#methods)
  - [Types](#types)
  - [Error classes](#error-classes)
- [Runtime notes](#runtime-notes)
- [License](#license)

---

## Install

```bash
npm install @halalterminal/sdk
# or
pnpm add @halalterminal/sdk
# or
yarn add @halalterminal/sdk
```

Requires **Node 18+** (or any runtime with a global `fetch`).

---

## Authentication

Most endpoints require an API key. The SDK reads it from:

1. The `apiKey` constructor option — use this for explicit control.
2. The `HALAL_TERMINAL_API_KEY` environment variable — convenient for server-side apps.

**Get a free API key** — no credit card required:

```bash
curl -s -X POST https://api.halalterminal.com/api/keys/generate \
  -H 'Content-Type: application/json' \
  -d '{"email": "you@example.com"}'
# → { "api_key": "ht_…", "plan": "free", … }
```

**Via environment variable (recommended for server apps):**

```bash
export HALAL_TERMINAL_API_KEY=ht_your_key_here
```

```ts
import { HalalTerminal } from "@halalterminal/sdk";

// Picks up HALAL_TERMINAL_API_KEY automatically
const ht = new HalalTerminal();
```

**Via constructor option (useful for multi-tenant or edge deployments):**

```ts
const ht = new HalalTerminal({ apiKey: "ht_your_key_here" });
```

> **Note:** `getDisclaimers()` and `health()` are public endpoints — they work without an API key.

---

## Quickstart

```ts
import { HalalTerminal } from "@halalterminal/sdk";

const ht = new HalalTerminal({ apiKey: process.env.HALAL_TERMINAL_API_KEY });

// Screen a single stock
const result = await ht.screen("AAPL");
console.log(result.shariah_compliance_status); // "compliant" | "non_compliant" | "insufficient_data"
console.log(result.is_compliant);              // true | false | null
console.log(result.purification_rate);         // e.g. 0.009 (0.9% of dividends to purify)

// Always render disclaimers — they carry the required religious and data-freshness caveats
for (const d of result.disclaimers) {
  console.log(`[${d.severity}] ${d.text}`);
}
```

---

## Usage Examples

### Screen a stock

Screening returns a verdict across **all 5 Shariah methodologies** (AAOIFI, DJIM, FTSE, MSCI, S&P) so you can surface the methodology that matters most to each user.

```ts
import { HalalTerminal } from "@halalterminal/sdk";

const ht = new HalalTerminal();
const result = await ht.screen("MSFT");

console.log(result.symbol);                     // "MSFT"
console.log(result.is_compliant);               // overall verdict (null if insufficient data)
console.log(result.shariah_compliance_status);  // "compliant" | "non_compliant" | "insufficient_data"
console.log(result.business_screen_pass);       // business activity check passed?
console.log(result.financial_screen_pass);      // financial ratios check passed?
console.log(result.purification_rate);          // fraction of dividends to donate
console.log(result.compliance_explanation);     // plain-English explanation

// Per-methodology breakdown
for (const [method, entry] of Object.entries(result.by_methodology)) {
  const verdict = entry.is_compliant === null ? "insufficient data" : entry.is_compliant ? "PASS" : "FAIL";
  console.log(`${method}: ${verdict} (verified: ${entry.verified})`);
  if (entry.reason) console.log(`  reason: ${entry.reason}`);
}
// Example output:
// AAOIFI: FAIL (verified: true)  reason: gaming revenue threshold exceeded
// DJIM:   PASS (verified: true)
// FTSE:   PASS (verified: true)
// MSCI:   FAIL (verified: true)  reason: gaming revenue threshold exceeded
// SP500S: PASS (verified: true)

// Force a fresh data fetch, bypassing the cache
const fresh = await ht.screen("NVDA", { forceRefresh: true });
```

### Portfolio scan

Classify multiple tickers in a single request.

```ts
const scan = await ht.scanPortfolio(["AAPL", "MSFT", "JNJ", "BAC", "TSLA"]);

console.log(scan.summary);
// { total: 5, compliant: 3, non_compliant: 2 }

for (const stock of scan.results) {
  console.log(stock.symbol, stock.shariah_compliance_status);
}

// Render disclaimers from the portfolio-level response
for (const d of scan.disclaimers) {
  console.log(`[${d.severity}] ${d.text}`);
}
```

### Real-time quote

```ts
const quote = await ht.getQuote("AAPL");

console.log(quote.symbol);        // "AAPL"
console.log(quote.name);          // "Apple Inc."
console.log(quote.price);         // 187.34
console.log(quote.change);        // 1.24
console.log(quote.changePercent); // 0.67
console.log(quote.volume);        // 54_210_000
console.log(quote.marketCap);     // 2_890_000_000_000 (or null)

for (const d of quote.disclaimers) {
  console.log(`[${d.severity}] ${d.text}`);
}
```

### Zakat calculator

Computes zakat owed on a set of stock holdings against the gold nisab threshold.

```ts
const zakatResult = await ht.calculateZakat(
  [
    { symbol: "AAPL", market_value: 25_000 },
    { symbol: "MSFT", market_value: 10_000 },
    { symbol: "JNJ",  market_value: 8_500 },
  ],
  {
    goldPricePerGram: 65, // optional; omit to use the server's default
  },
);

console.log(zakatResult.is_above_nisab);     // true
console.log(zakatResult.nisab_threshold);    // e.g. 4888.5 (85g × gold price)
console.log(zakatResult.total_market_value); // 43_500
console.log(zakatResult.zakat_rate);         // 0.025 (2.5%)
console.log(zakatResult.total_zakat);        // 1_087.5

for (const h of zakatResult.holdings) {
  console.log(`${h.symbol}: $${h.market_value} → zakat $${h.zakat_amount.toFixed(2)}`);
}
// AAPL: $25000 → zakat $625.00
// MSFT: $10000 → zakat $250.00
// JNJ:  $8500  → zakat $212.50

for (const d of zakatResult.disclaimers) {
  console.log(`[${d.severity}] ${d.text}`);
}
```

### Error handling

Every error is a subclass of `HalalTerminalError`. Catch the specific class you expect and re-throw the rest.

```ts
import {
  HalalTerminal,
  ApiKeyError,
  QuotaExceededError,
  RateLimitError,
  NotFoundError,
  ServerError,
} from "@halalterminal/sdk";

const ht = new HalalTerminal();

try {
  const result = await ht.screen("AAPL");
  // … handle result
} catch (err) {
  if (err instanceof ApiKeyError) {
    // 401 or 403 — missing or invalid API key
    console.error("Invalid API key — re-check HALAL_TERMINAL_API_KEY", err.status);

  } else if (err instanceof QuotaExceededError) {
    // 429 with code QUOTA_EXCEEDED — monthly call limit reached
    // err.detail often contains a human-readable upgrade nudge
    console.error("Monthly quota exhausted:", err.detail);
    // Prompt the user to upgrade at https://halalterminal.com/pricing

  } else if (err instanceof RateLimitError) {
    // 429 without quota code — short-window rate limit
    // Back off and retry after a short delay
    console.error("Rate limited — retry after a moment");

  } else if (err instanceof NotFoundError) {
    // 404 — symbol not found in the database
    console.error("Symbol not found", err.message);

  } else if (err instanceof ServerError) {
    // 5xx — server-side error; safe to retry
    console.error("Server error — try again shortly", err.status);

  } else {
    // Unknown error — rethrow so you don't swallow unexpected exceptions
    throw err;
  }
}
```

All error objects expose:

| Property | Type | Description |
|---|---|---|
| `message` | `string` | Human-readable description |
| `status` | `number` | HTTP status code (0 if no response) |
| `code` | `string \| undefined` | Machine-readable code from the API (e.g. `QUOTA_EXCEEDED`) |
| `detail` | `string \| null` | Optional extra detail from the API |

### Disclaimer rendering

Every compliance, quote, portfolio, and zakat response includes a `disclaimers: Disclaimer[]` array. **Always render these to end users** — they carry the required religious caveats (fatwa limitation notices) and data-freshness warnings.

```ts
const result = await ht.screen("TSLA");

for (const d of result.disclaimers) {
  // d.severity: "religious" | "data" | string
  // d.text:     the display string to show the user
  // d.url:      deep-link to the full legal text on halalterminal.com
  // d.version:  ISO-date stamp of this disclaimer version
  // d.lang:     language code (e.g. "en")

  console.log(`[${d.severity}] ${d.text}`);
  console.log(`  → ${d.url}`);
}

// Fetch the full registry of current disclaimers — no API key required
const allDisclaimers = await ht.getDisclaimers();
```

### Generic escape hatch

For any endpoint not yet wrapped, use `get` or `post`:

```ts
// GET with query params
const trending = await ht.get<Array<{ symbol: string; name: string }>>(
  "/api/trending",
  { limit: 10, category: "halal" },
);

// POST with a body
const report = await ht.post<{ pdf_url: string }>(
  "/api/reports/portfolio",
  { symbols: ["AAPL", "MSFT"], format: "pdf" },
);
```

Unknown server fields are preserved on every typed response object — the SDK never crashes on forward-compatible API additions.

---

## API Reference

### Constructor

```ts
new HalalTerminal(opts?: ClientOptions)
```

| Option | Type | Default | Description |
|---|---|---|---|
| `apiKey` | `string` | `HALAL_TERMINAL_API_KEY` env var | Your API key. Falls back to the environment variable automatically. |
| `baseUrl` | `string` | `https://api.halalterminal.com` | Override for staging/self-hosted deployments. Trailing slashes are stripped. |
| `fetchImpl` | `typeof fetch` | `globalThis.fetch` | Inject a custom `fetch` implementation — useful for testing or non-standard runtimes. |
| `userAgent` | `string` | `halalterminal-js/0.1.0` | Custom `User-Agent` header value. |

### Methods

#### `screen(symbol, opts?): Promise<ScreeningResult>`

Screen a single ticker for Shariah compliance across all 5 methodologies.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `symbol` | `string` | Yes | Ticker symbol (case-insensitive; uppercased before the request). |
| `opts.forceRefresh` | `boolean` | No | Bypass the server cache and fetch fresh data. |

**Returns:** `ScreeningResult`

---

#### `getQuote(symbol): Promise<Quote>`

Fetch the latest market quote for a symbol.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `symbol` | `string` | Yes | Ticker symbol (case-insensitive). |

**Returns:** `Quote`

---

#### `scanPortfolio(symbols): Promise<PortfolioScanResult>`

Screen multiple tickers in a single request.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `symbols` | `string[]` | Yes | Array of ticker symbols (case-insensitive; uppercased before the request). |

**Returns:** `PortfolioScanResult`

---

#### `calculateZakat(holdings, opts?): Promise<ZakatResult>`

Calculate zakat due on a set of equity holdings.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `holdings` | `ZakatHolding[]` | Yes | Array of `{ symbol: string; market_value: number }` objects. |
| `opts.goldPricePerGram` | `number` | No | Gold price per gram in USD, used to compute the nisab threshold. Omit to use the server's default. |

**Returns:** `ZakatResult`

---

#### `getDisclaimers(): Promise<Disclaimer[]>`

Fetch the full canonical disclaimer registry. **No API key required.**

**Returns:** `Disclaimer[]`

---

#### `health(): Promise<{ message: string }>`

Ping the API. **No API key required.**

---

#### `get<T>(path, params?): Promise<T>`

Generic GET — calls any path and returns parsed JSON as `T`.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `path` | `string` | Yes | API path (e.g. `/api/trending`). Leading slash is optional. |
| `params` | `Record<string, string \| number \| boolean>` | No | Query-string parameters. |

---

#### `post<T>(path, body?): Promise<T>`

Generic POST — sends `body` as JSON and returns parsed response as `T`.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `path` | `string` | Yes | API path. |
| `body` | `unknown` | No | Request body (serialised to JSON). |

---

### Types

#### `ScreeningResult`

| Field | Type | Description |
|---|---|---|
| `symbol` | `string` | Ticker symbol (uppercased). |
| `is_compliant` | `boolean \| null` | Overall compliance verdict. `null` = insufficient data. |
| `shariah_compliance_status` | `"compliant" \| "non_compliant" \| "insufficient_data" \| null` | Status string. |
| `business_screen_pass` | `boolean \| null` | Business activity screen result. |
| `financial_screen_pass` | `boolean \| null` | Financial ratios screen result. |
| `purification_rate` | `number \| null` | Fraction of dividends to donate as purification (e.g. `0.009` = 0.9%). |
| `compliance_explanation` | `string \| null` | Plain-English explanation of the verdict. |
| `by_methodology` | `Record<string, MethodologyEntry>` | Per-methodology breakdown. Keys: `AAOIFI`, `DJIM`, `FTSE`, `MSCI`, `SP500S`. |
| `disclaimers` | `Disclaimer[]` | Required disclaimers — always render to end users. |

#### `MethodologyEntry`

| Field | Type | Description |
|---|---|---|
| `is_compliant` | `boolean \| null` | Verdict for this methodology. |
| `verified` | `boolean` | Whether the verdict has been human-verified. |
| `reason` | `string \| null` | Reason for a FAIL verdict, or `null` on PASS. |

#### `Quote`

| Field | Type | Description |
|---|---|---|
| `symbol` | `string` | Ticker symbol. |
| `name` | `string` | Company name. |
| `price` | `number` | Latest price. |
| `change` | `number` | Price change since previous close. |
| `changePercent` | `number` | Percentage change since previous close. |
| `volume` | `number` | Trading volume. |
| `marketCap` | `number \| null` | Market capitalisation, or `null` if unavailable. |
| `disclaimers` | `Disclaimer[]` | Data-freshness disclaimers. |

#### `ZakatHolding`

| Field | Type | Description |
|---|---|---|
| `symbol` | `string` | Ticker symbol. |
| `market_value` | `number` | Current market value of the holding in USD. |

#### `ZakatResult`

| Field | Type | Description |
|---|---|---|
| `total_market_value` | `number` | Sum of all holding values. |
| `nisab_threshold` | `number` | Nisab in USD (85g gold × `gold_price_per_gram`). |
| `gold_price_per_gram` | `number` | Gold price used for the calculation. |
| `is_above_nisab` | `boolean` | Whether the portfolio exceeds the nisab — zakat is only due if `true`. |
| `zakat_rate` | `number` | Rate applied (typically `0.025`). |
| `total_zakat` | `number` | Total zakat amount due. |
| `holdings` | `Array<{ symbol, market_value, zakat_amount }>` | Per-holding breakdown. |
| `disclaimers` | `Disclaimer[]` | Religious and data caveats. |

#### `PortfolioScanResult`

| Field | Type | Description |
|---|---|---|
| `summary` | `{ total: number; compliant: number; non_compliant: number }` | High-level counts. |
| `results` | `Array<Record<string, unknown>>` | Per-ticker screening details. |
| `disclaimers` | `Disclaimer[]` | Required disclaimers. |

#### `Disclaimer`

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Stable identifier (e.g. `"screening"`, `"market-data"`). |
| `version` | `string` | ISO-date stamp of this disclaimer version. |
| `lang` | `string` | Language code (e.g. `"en"`). |
| `severity` | `"religious" \| "data" \| string` | `"religious"` = fatwa limitation; `"data"` = freshness/sourcing caveat. |
| `text` | `string` | Display text — show this to the user. |
| `url` | `string` | Deep-link to the full legal text on halalterminal.com. |

---

### Error classes

All errors extend `HalalTerminalError` (which extends `Error`).

| Class | HTTP status | When thrown |
|---|---|---|
| `HalalTerminalError` | any | Base class — catch this to handle all API errors generically. |
| `ApiKeyError` | 401, 403 | Missing, invalid, or expired API key. |
| `NotFoundError` | 404 | Symbol or resource not found. |
| `RateLimitError` | 429 | Short-window rate limit hit — back off and retry. |
| `QuotaExceededError` | 429 | Monthly call quota exhausted — check `err.detail` for upgrade info. |
| `ServerError` | 5xx | Server-side error — safe to retry after a short delay. |

---

## Runtime notes

**Node.js** — Node 18+ has a built-in `fetch` global. No polyfill needed.

**Browsers** — the SDK is ESM-only (`type: "module"`). Import it via a bundler (Vite, webpack, esbuild, etc.) — it works in any modern browser without modification.

**Cloudflare Workers / edge runtimes** — `fetch` is available globally; the SDK works out of the box. Pass `apiKey` via a secret binding rather than an environment variable:

```ts
// Cloudflare Worker
export default {
  async fetch(request: Request, env: Env) {
    const ht = new HalalTerminal({ apiKey: env.HALAL_TERMINAL_API_KEY });
    const result = await ht.screen("AAPL");
    return Response.json(result);
  },
};
```

**Testing** — inject a mock `fetch` via the `fetchImpl` option to avoid live API calls in unit tests:

```ts
const ht = new HalalTerminal({
  apiKey: "test",
  fetchImpl: async () =>
    new Response(JSON.stringify({ symbol: "AAPL", is_compliant: true, disclaimers: [] }), {
      status: 200,
      headers: { "content-type": "application/json" },
    }),
});
```

---

## License

MIT. © Halal Terminal. — [halalterminal.com](https://halalterminal.com)
