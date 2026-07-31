# @halalterminal/sdk - SDK TypeScript / JavaScript

![AAPL halal status](https://api.halalterminal.com/api/badge/AAPL.svg) _badge en direct de l'API, intégrez-en un pour n'importe quel symbole_

Client TypeScript/JavaScript officiel pour [Halal Terminal API](https://halalterminal.com) - Filtrage d'actions selon la charia à travers 5 méthodologies auditées, données de marché en temps réel, transparence ETF, calculateurs de zakat et de purification.

Zéro dépendance. Fonctionne sur Node 18+, les navigateurs modernes, Cloudflare Workers et tout runtime exposant un global `fetch`.

## Installation

```bash
npm install @halalterminal/sdk
# or
pnpm add @halalterminal/sdk
# or
yarn add @halalterminal/sdk
```

## Démarrage rapide

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

Besoin d'une clé API gratuite ? `POST https://api.halalterminal.com/api/keys/generate` avec `{"email": "you@example.com"}` - aucune carte de crédit.

## Points de terminaison typés

```ts
const quote     = await ht.getQuote("MSFT");
const portfolio = await ht.scanPortfolio(["AAPL", "MSFT", "JNJ", "BAC"]);
const zakat     = await ht.calculateZakat(
  [{ symbol: "AAPL", market_value: 25_000 }],
  { goldPricePerGram: 65 },
);
const registry  = await ht.getDisclaimers(); // public, no key required
```

Chaque appel retourne une réponse entièrement typée. Les champs inconnus du serveur sont préservés dans l'objet résultat pour que le SDK ne plante jamais lors de changements d'API à compatibilité ascendante.

## Échappatoire générique

```ts
const trending = await ht.get<Array<{ symbol: string; name: string }>>("/api/trending");
const report   = await ht.post("/api/reports/portfolio", { symbols: ["AAPL", "MSFT"] });
```

## Gestion des erreurs

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

## Avertissements

Chaque réponse de conformité, de données de marché, de zakat ou de purification contient un `disclaimers: Disclaimer[]` typé. Chaque avertissement est versionné, étiqueté par sévérité (`religious` pour les mises en garde relatives à la fatwa, `data` pour la fraîcheur et la provenance des données), et fait un lien profond vers une section spécifique de la page légale de Halal Terminal. Affichez-les en ligne - l'API livre votre texte de conformité pour vous.

## En savoir plus

- [Référence API](https://api.halalterminal.com/api-reference)
- [Guide de filtrage des sukuks](https://www.halalterminal.com/research/sukuk-screening)
- [ETF conformes à la charia comparés (2026)](https://www.halalterminal.com/research/sharia-etf-comprehensive-analysis)
- [Mon action est-elle halal ? Screener](https://www.halalterminal.com/stocks)

## Fait partie de l'écosystème Halal Terminal

[Site web](https://www.halalterminal.com) · [API](https://api.halalterminal.com/api-reference) · [SDK Python](https://github.com/goww7/halalterminal-sdk-python) · [Serveur MCP](https://github.com/goww7/halalterminal-mcp) · [Plugin Claude](https://github.com/goww7/halalterminal-claude-skills) · [Bot Discord](https://github.com/goww7/halal-discord-bot) · [Indicateur TradingView](https://github.com/goww7/halal-pine) · [Suivi de portefeuille](https://github.com/goww7/halal-portfolio-tracker)

## Licence

MIT. © Halal Terminal.

---

Fait partie de l'[écosystème ouvert Halal Terminal](https://github.com/goww7/awesome-islamic-finance) :
[API](https://api.halalterminal.com) · [Serveur MCP](https://github.com/goww7/halalterminal-mcp) · [SDK Python](https://github.com/goww7/halalterminal-sdk-python) · [SDK JS](https://github.com/goww7/halalterminal-sdk-js) · [Jeux de données](https://github.com/goww7/sp500-shariah-compliance) · [Awesome Islamic Finance](https://github.com/goww7/awesome-islamic-finance)