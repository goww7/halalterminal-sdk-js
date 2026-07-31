# @halalterminal/sdk - SDK TypeScript / JavaScript

![AAPL halal status](https://api.halalterminal.com/api/badge/AAPL.svg) _lencana langsung dari API, tempelkan untuk simbol apa pun_

Klien TypeScript/JavaScript resmi untuk [Halal Terminal API](https://halalterminal.com): pemeriksaan saham Syariah dalam 5 metodologi yang diaudit, data pasar real-time, ETF look-through, kalkulator zakat & pemurnian.

Tanpa dependensi. Berjalan di Node 18+, browser modern, Cloudflare Workers, dan runtime apa pun yang mengekspos global `fetch`.

## Instalasi

```bash
npm install @halalterminal/sdk
# or
pnpm add @halalterminal/sdk
# or
yarn add @halalterminal/sdk
```

## Panduan Cepat

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

Butuh kunci API gratis? `POST https://api.halalterminal.com/api/keys/generate` dengan `{"email": "you@example.com"}` tanpa kartu kredit.

## Endpoint Bertipe

```ts
const quote     = await ht.getQuote("MSFT");
const portfolio = await ht.scanPortfolio(["AAPL", "MSFT", "JNJ", "BAC"]);
const zakat     = await ht.calculateZakat(
  [{ symbol: "AAPL", market_value: 25_000 }],
  { goldPricePerGram: 65 },
);
const registry  = await ht.getDisclaimers(); // public, no key required
```

Setiap panggilan mengembalikan respons yang sepenuhnya bertipe. Field server yang tidak dikenal dipertahankan di objek hasil sehingga SDK tidak pernah crash saat perubahan API yang kompatibel ke depan.

## Jalan Keluar Generik

```ts
const trending = await ht.get<Array<{ symbol: string; name: string }>>("/api/trending");
const report   = await ht.post("/api/reports/portfolio", { symbols: ["AAPL", "MSFT"] });
```

## Penanganan Kesalahan

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

Setiap respons kepatuhan / data pasar / zakat / pemurnian membawa `disclaimers: Disclaimer[]` yang bertipe. Setiap penafian memiliki versi, diberi tag tingkat keparahan (`religious` untuk penafian fatwa, `data` untuk kesegaran/sumber), dan tautan langsung ke bagian tertentu di halaman legal Halal Terminal. Tampilkan secara inline. API menyediakan salinan kepatuhan untuk Anda.

## Pelajari Lebih Lanjut

- [Referensi API](https://api.halalterminal.com/api-reference)
- [Panduan Pemeriksaan Sukuk](https://www.halalterminal.com/research/sukuk-screening)
- [Perbandingan ETF Patuh Syariah (2026)](https://www.halalterminal.com/research/sharia-etf-comprehensive-analysis)
- [Apakah saham saya halal? Pemeriksa](https://www.halalterminal.com/stocks)

## Bagian dari Ekosistem Halal Terminal

[Website](https://www.halalterminal.com) · [API](https://api.halalterminal.com/api-reference) · [Python SDK](https://github.com/goww7/halalterminal-sdk-python) · [MCP server](https://github.com/goww7/halalterminal-mcp) · [Claude plugin](https://github.com/goww7/halalterminal-claude-skills) · [Discord bot](https://github.com/goww7/halal-discord-bot) · [TradingView indicator](https://github.com/goww7/halal-pine) · [Portfolio tracker](https://github.com/goww7/halal-portfolio-tracker)

## Lisensi

MIT. © Halal Terminal.

---

Bagian dari [ekosistem terbuka Halal Terminal](https://github.com/goww7/awesome-islamic-finance):
[API](https://api.halalterminal.com) · [MCP server](https://github.com/goww7/halalterminal-mcp) · [Python SDK](https://github.com/goww7/halalterminal-sdk-python) · [JS SDK](https://github.com/goww7/halalterminal-sdk-js) · [Datasets](https://github.com/goww7/sp500-shariah-compliance) · [Awesome Islamic Finance](https://github.com/goww7/awesome-islamic-finance)