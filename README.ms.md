# @halalterminal/sdk — SDK TypeScript / JavaScript

![AAPL halal status](https://api.halalterminal.com/api/badge/AAPL.svg) _lencana langsung daripada API, benamkan satu untuk mana-mana simbol_

Klien TypeScript/JavaScript rasmi untuk [Halal Terminal API](https://halalterminal.com) - penapisan saham Shariah merentasi 5 metodologi diaudit, data pasaran masa nyata, penelusan ETF, kalkulator zakat & penyucian.

Tiada pergantungan. Berjalan pada Node 18+, pelayar moden, Cloudflare Workers, dan mana-mana runtime yang mendedahkan global `fetch`.

## Pemasangan

```bash
npm install @halalterminal/sdk
# or
pnpm add @halalterminal/sdk
# or
yarn add @halalterminal/sdk
```

## Permulaan Pantas

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

Perlukan kunci API percuma? `POST https://api.halalterminal.com/api/keys/generate` dengan `{"email": "you@example.com"}` - tiada kad kredit.

## Titik Akhir Berjenis

```ts
const quote     = await ht.getQuote("MSFT");
const portfolio = await ht.scanPortfolio(["AAPL", "MSFT", "JNJ", "BAC"]);
const zakat     = await ht.calculateZakat(
  [{ symbol: "AAPL", market_value: 25_000 }],
  { goldPricePerGram: 65 },
);
const registry  = await ht.getDisclaimers(); // public, no key required
```

Setiap panggilan mengembalikan respons berjenis penuh. Medan pelayan yang tidak dikenali dipelihara pada objek keputusan supaya SDK tidak pernah ranap apabila API berubah serasi ke hadapan.

## Pintu Keluar Generik

```ts
const trending = await ht.get<Array<{ symbol: string; name: string }>>("/api/trending");
const report   = await ht.post("/api/reports/portfolio", { symbols: ["AAPL", "MSFT"] });
```

## Pengendalian Ralat

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

## Penafian

Setiap respons pematuhan / data-pasaran / zakat / penyucian membawa `disclaimers: Disclaimer[]` berjenis. Setiap penafian ada versi, ditanda keseriusan (`religious` untuk amaran fatwa, `data` untuk kesegaran/sumber), dan pautan dalam ke bahagian tertentu pada halaman undang-undang Halal Terminal. Tunjukkan mereka sebaris - API menghantar salinan pematuhan anda untuk anda.

## Ketahui Lebih Lanjut

- [Rujukan API](https://api.halalterminal.com/api-reference)
- [Panduan penapisan Sukuk](https://www.halalterminal.com/research/sukuk-screening)
- [ETF patuh Shariah dibandingkan (2026)](https://www.halalterminal.com/research/sharia-etf-comprehensive-analysis)
- [Adakah saham saya halal? Penapis](https://www.halalterminal.com/stocks)

## Sebahagian daripada Ekosistem Halal Terminal

[Laman Web](https://www.halalterminal.com) · [API](https://api.halalterminal.com/api-reference) · [Python SDK](https://github.com/goww7/halalterminal-sdk-python) · [MCP server](https://github.com/goww7/halalterminal-mcp) · [Claude plugin](https://github.com/goww7/halalterminal-claude-skills) · [Discord bot](https://github.com/goww7/halal-discord-bot) · [TradingView indicator](https://github.com/goww7/halal-pine) · [Portfolio tracker](https://github.com/goww7/halal-portfolio-tracker)

## Lesen

MIT. © Halal Terminal.

---

Sebahagian daripada [ekosistem terbuka Halal Terminal](https://github.com/goww7/awesome-islamic-finance):
[API](https://api.halalterminal.com) · [MCP server](https://github.com/goww7/halalterminal-mcp) · [Python SDK](https://github.com/goww7/halalterminal-sdk-python) · [JS SDK](https://github.com/goww7/halalterminal-sdk-js) · [Datasets](https://github.com/goww7/sp500-shariah-compliance) · [Awesome Islamic Finance](https://github.com/goww7/awesome-islamic-finance)