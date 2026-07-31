# @halalterminal/sdk - SDK لـ TypeScript / JavaScript

![AAPL halal status](https://api.halalterminal.com/api/badge/AAPL.svg) _شارة مباشرة من واجهة البرمجة، يمكن تضمينها لأي رمز_

عميل TypeScript/JavaScript الرسمي لـ [Halal Terminal API](https://halalterminal.com). فحص أسهم شرعي عبر 5 منهجيات مدققة، وبيانات السوق في الوقت الفعلي، وتحليل مكونات ETF، وحاسبات الزكاة والتطهير.

صفر تبعيات. يعمل على Node 18+، والمتصفحات الحديثة، وCloudflare Workers، وأي بيئة تشغيل تُتاح فيها الدالة العامة `fetch`.

## التثبيت

```bash
npm install @halalterminal/sdk
# or
pnpm add @halalterminal/sdk
# or
yarn add @halalterminal/sdk
```

## البدء السريع

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

تحتاج مفتاح واجهة برمجة مجاني؟ أرسل `POST https://api.halalterminal.com/api/keys/generate` مع `{"email": "you@example.com"}`. لا حاجة لبطاقة ائتمان.

## نقاط النهاية المُنوّتة

```ts
const quote     = await ht.getQuote("MSFT");
const portfolio = await ht.scanPortfolio(["AAPL", "MSFT", "JNJ", "BAC"]);
const zakat     = await ht.calculateZakat(
  [{ symbol: "AAPL", market_value: 25_000 }],
  { goldPricePerGram: 65 },
);
const registry  = await ht.getDisclaimers(); // public, no key required
```

تُعيد كل استدعاء استجابة مُنوّتة بالكامل. يتم الاحتفاظ بالحقول غير المعروفة من الخادم في كائن النتيجة، بحيث لا يتعطل الـ SDK أبدًا عند تغييرات واجهة البرمجة المتوافقة مع الإصدارات المستقبلية.

## باب الخروج العام

```ts
const trending = await ht.get<Array<{ symbol: string; name: string }>>("/api/trending");
const report   = await ht.post("/api/reports/portfolio", { symbols: ["AAPL", "MSFT"] });
```

## معالجة الأخطاء

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

## إخلاء المسؤولية

تحمل كل استجابة للفحص / بيانات السوق / الزكاة / التطهير قائمة مُنوّتة من `disclaimers: Disclaimer[]`. كل تنبيه مُصدر برقم إصدار ومُصنف حسب الخطورة (`religious` للتحذيرات الفقهية، و`data` لحداثة البيانات ومصادرها)، ويرتبط برابط مباشر بقسم محدد في الصفحة القانونية لـ Halal Terminal. اعرضها بشكل مضمن. توفر لك واجهة البرمجة نص الامتثال.

## معرفة المزيد

- [مرجع API](https://api.halalterminal.com/api-reference)
- [دليل فحص الصكوك](https://www.halalterminal.com/research/sukuk-screening)
- [مقارنة صناديق الاستثمار المتداولة المتوافقة مع الشريعة (2026)](https://www.halalterminal.com/research/sharia-etf-comprehensive-analysis)
- [هل سهمي حلال؟ أداة الفحص](https://www.halalterminal.com/stocks)

## جزء من النظام البيئي لـ Halal Terminal

[الموقع](https://www.halalterminal.com) · [API](https://api.halalterminal.com/api-reference) · [Python SDK](https://github.com/goww7/halalterminal-sdk-python) · [MCP server](https://github.com/goww7/halalterminal-mcp) · [Claude plugin](https://github.com/goww7/halalterminal-claude-skills) · [Discord bot](https://github.com/goww7/halal-discord-bot) · [TradingView indicator](https://github.com/goww7/halal-pine) · [Portfolio tracker](https://github.com/goww7/halal-portfolio-tracker)

## الترخيص

MIT. © Halal Terminal.

---

جزء من [النظام البيئي المفتوح لـ Halal Terminal](https://github.com/goww7/awesome-islamic-finance):
[API](https://api.halalterminal.com) · [MCP server](https://github.com/goww7/halalterminal-mcp) · [Python SDK](https://github.com/goww7/halalterminal-sdk-python) · [JS SDK](https://github.com/goww7/halalterminal-sdk-js) · [مجموعات البيانات](https://github.com/goww7/sp500-shariah-compliance) · [Awesome Islamic Finance](https://github.com/goww7/awesome-islamic-finance)