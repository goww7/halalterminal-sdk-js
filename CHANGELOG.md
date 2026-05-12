# Changelog

All notable changes to `@halalterminal/sdk` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2026-05-12

### Changed
- Source code moved out of the FinanceData2 monorepo into its own public
  repository at `github.com/goww7/halalterminal-sdk-js`. The `repository`
  and `bugs` URLs in `package.json` now point there. No code changes —
  the API surface is identical to 0.1.0.

## [0.1.0] - 2026-05-12

Initial public release.

### Added
- `HalalTerminal` client — zero dependencies, fetch-based, runs on Node 18+,
  modern browsers, Cloudflare Workers, and any runtime exposing a global `fetch`.
- API-key auth via constructor option or the `HALAL_TERMINAL_API_KEY` env var.
- Typed endpoints: `screen`, `getQuote`, `scanPortfolio`, `calculateZakat`,
  `getDisclaimers`, `health`.
- Generic `get` / `post` escape hatches for any endpoint not yet wrapped.
- Typed response shapes: `ScreeningResult`, `Quote`, `PortfolioScanResult`,
  `ZakatResult`, `Disclaimer`, `MethodologyEntry`.
- Error hierarchy: `HalalTerminalError` (base), `ApiKeyError`, `NotFoundError`,
  `RateLimitError`, `QuotaExceededError`, `ServerError` — mapped from HTTP
  status and the API's `code` field.
- ESM-only build with `.d.ts` types and source maps.
