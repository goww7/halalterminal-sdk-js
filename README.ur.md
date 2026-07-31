# @halalterminal/sdk - TypeScript / JavaScript SDK

![AAPL halal status](https://api.halalterminal.com/api/badge/AAPL.svg) _API سے لائیو بیج، کسی بھی سمبل کے لیے ایمبیڈ کریں_

[Halal Terminal API](https://halalterminal.com) کے لیے سرکاری TypeScript/JavaScript کلائنٹ - 5 آڈٹ شدہ طریقہ کار پر مبنی شریعہ اسٹاک اسکریننگ، ریئل ٹائم مارکیٹ ڈیٹا، ETF look-through، زکوٰۓ اور تصفیہ کے کیلکولیٹرز۔

کوئی انحصار نہیں۔ Node 18+، جدید براؤزرز، Cloudflare Workers، اور کسی بھی رن ٹائم پر چلتا ہے جو `fetch` گلوبل پیش کرتا ہے۔

## تنصیب

```bash
npm install @halalterminal/sdk
# or
pnpm add @halalterminal/sdk
# or
yarn add @halalterminal/sdk
```

## فوری آغاز

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

مفت API key چاہیے؟ `POST https://api.halalterminal.com/api/keys/generate` `{"email": "you@example.com"}` کے ساتھ - کوئی کریڈٹ کارڈ نہیں۔

## ٹائپ شدہ اینڈ پوائنٹس

```ts
const quote     = await ht.getQuote("MSFT");
const portfolio = await ht.scanPortfolio(["AAPL", "MSFT", "JNJ", "BAC"]);
const zakat     = await ht.calculateZakat(
  [{ symbol: "AAPL", market_value: 25_000 }],
  { goldPricePerGram: 65 },
);
const registry  = await ht.getDisclaimers(); // public, no key required
```

ہر کال ایک مکمل طور پر ٹائپ شدہ جواب واپس کرتی ہے۔ نامعلوم سرور فیلڈز ریزلٹ آبجیکٹ پر محفوظ رکھے جاتے ہیں تاکہ SDK فارورڈ کمپیٹیبل API تبدیلیوں پر کبھی کریش نہ ہو۔

## عمومی نکلنے کا راستہ

```ts
const trending = await ht.get<Array<{ symbol: string; name: string }>>("/api/trending");
const report   = await ht.post("/api/reports/portfolio", { symbols: ["AAPL", "MSFT"] });
```

## خرابی کی سنبھال

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

## تنبیہات

ہر کمپلائنس / مارکیٹ-ڈیٹا / زکوٰۓ / تصفیہ کا جواب ایک ٹائپ شدہ `disclaimers: Disclaimer[]` رکھتا ہے۔ ہر دسکلیمر ورژن شدہ ہے، شدت سے ٹیگ شدہ (`religious` فتوٰی کی تنبیہات کے لیے، `data` تازگی/ذرائع کے لیے) ہے، اور Halal Terminal لیگل پیج کے ایک مخصوص حصے سے ڈیپ-لنک کرتا ہے۔ انہیں ان لائن دکھائیں - API آپ کے لیے آپ کا کمپلائنس متن فراہم کرتی ہے۔

## مزید جانیں

- [API دستاویز](https://api.halalterminal.com/api-reference)
- [Sukuk اسکریننگ رہنما](https://www.halalterminal.com/research/sukuk-screening)
- [شریعہ ہم آہنگ ETFs کا موازنہ (2026)](https://www.halalterminal.com/research/sharia-etf-comprehensive-analysis)
- [کیا میرا اسٹاک حلال ہے؟ اسکرینر](https://www.halalterminal.com/stocks)

## Halal Terminal ایکو سسٹم کا حصہ

[ویب سائٹ](https://www.halalterminal.com) · [API](https://api.halalterminal.com/api-reference) · [Python SDK](https://github.com/goww7/halalterminal-sdk-python) · [MCP server](https://github.com/goww7/halalterminal-mcp) · [Claude plugin](https://github.com/goww7/halalterminal-claude-skills) · [Discord bot](https://github.com/goww7/halal-discord-bot) · [TradingView indicator](https://github.com/goww7/halal-pine) · [Portfolio tracker](https://github.com/goww7/halal-portfolio-tracker)

## لائسنس

MIT. © Halal Terminal.


---

[Halal Terminal open ecosystem](https://github.com/goww7/awesome-islamic-finance) کا حصہ:
[API](https://api.halalterminal.com) · [MCP server](https://github.com/goww7/halalterminal-mcp) · [Python SDK](https://github.com/goww7/halalterminal-sdk-python) · [JS SDK](https://github.com/goww7/halalterminal-sdk-js) · [Datasets](https://github.com/goww7/sp500-shariah-compliance) · [Awesome Islamic Finance](https://github.com/goww7/awesome-islamic-finance)