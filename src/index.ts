/**
 * Halal Terminal API — official TypeScript / JavaScript SDK.
 *
 * Zero-dependency, fetch-based. Works in Node 18+, modern browsers,
 * Cloudflare Workers, and any other runtime that exposes a fetch
 * global.
 *
 * Quickstart:
 *
 *   import { HalalTerminal } from "@halalterminal/sdk";
 *
 *   const ht = new HalalTerminal({ apiKey: "ht_…" });
 *
 *   const aapl = await ht.screen("AAPL");
 *   console.log(aapl.is_compliant, aapl.shariah_compliance_status);
 *
 *   for (const d of aapl.disclaimers) {
 *     console.log(`[${d.severity}] ${d.text}`);
 *   }
 *
 * Every relevant response carries a typed `disclaimers` array. Render
 * them in your UI — they're versioned, severity-tagged, and link to
 * the long-form legal page.
 */

export const DEFAULT_BASE_URL = "https://api.halalterminal.com";
export const DEFAULT_USER_AGENT = "halalterminal-js/0.1.0";

// ── Types ──────────────────────────────────────────────────────────────

export interface Disclaimer {
  id: string;
  version: string;
  lang: string;
  severity: "religious" | "data" | string;
  text: string;
  url: string;
}

export interface MethodologyEntry {
  is_compliant: boolean | null;
  verified: boolean;
  reason: string | null;
}

export interface ScreeningResult {
  symbol: string;
  is_compliant: boolean | null;
  shariah_compliance_status: "compliant" | "non_compliant" | "insufficient_data" | null;
  business_screen_pass: boolean | null;
  financial_screen_pass: boolean | null;
  purification_rate: number | null;
  compliance_explanation: string | null;
  by_methodology: Record<string, MethodologyEntry>;
  disclaimers: Disclaimer[];
  [k: string]: unknown;
}

export interface Quote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number | null;
  disclaimers: Disclaimer[];
  [k: string]: unknown;
}

export interface ZakatHolding {
  symbol: string;
  market_value: number;
}

export interface ZakatResult {
  total_market_value: number;
  nisab_threshold: number;
  gold_price_per_gram: number;
  is_above_nisab: boolean;
  zakat_rate: number;
  total_zakat: number;
  holdings: Array<{ symbol: string; market_value: number; zakat_amount: number }>;
  disclaimers: Disclaimer[];
  [k: string]: unknown;
}

export interface PortfolioScanResult {
  summary: {
    total: number;
    compliant: number;
    non_compliant: number;
  };
  results: Array<Record<string, unknown>>;
  disclaimers: Disclaimer[];
  [k: string]: unknown;
}

export interface DisclaimersRegistryResponse {
  disclaimers: Disclaimer[];
  total: number;
}

export interface ClientOptions {
  apiKey?: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  userAgent?: string;
}

export interface ApiErrorPayload {
  code?: string;
  message?: string;
  detail?: string | null;
}

// ── Error classes ──────────────────────────────────────────────────────

export class HalalTerminalError extends Error {
  status: number;
  code?: string;
  detail?: string | null;
  constructor(message: string, opts: { status?: number; code?: string; detail?: string | null } = {}) {
    super(message);
    this.name = new.target.name;
    this.status = opts.status ?? 0;
    this.code = opts.code;
    this.detail = opts.detail ?? null;
  }
}

export class ApiKeyError extends HalalTerminalError {}
export class NotFoundError extends HalalTerminalError {}
export class RateLimitError extends HalalTerminalError {}
export class QuotaExceededError extends HalalTerminalError {}
export class ServerError extends HalalTerminalError {}

// ── Client ─────────────────────────────────────────────────────────────

export class HalalTerminal {
  readonly apiKey?: string;
  readonly baseUrl: string;
  private readonly _fetch: typeof fetch;
  private readonly _ua: string;

  constructor(opts: ClientOptions = {}) {
    // In Node 18+ / browsers / workers, `fetch` is global. Allow override
    // for tests + non-global runtimes. `process` is referenced via a
    // typed cast so this file builds without a hard @types/node dep.
    const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
    this.apiKey = opts.apiKey ?? proc?.env?.HALAL_TERMINAL_API_KEY;
    this.baseUrl = (opts.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    this._fetch =
      opts.fetchImpl ?? (typeof globalThis.fetch === "function" ? globalThis.fetch.bind(globalThis) : (undefined as unknown as typeof fetch));
    this._ua = opts.userAgent ?? DEFAULT_USER_AGENT;
    if (!this._fetch) {
      throw new Error(
        "halalterminal: no fetch implementation available. Pass `fetchImpl` or run on Node 18+/a modern browser.",
      );
    }
  }

  // ── Low-level request helpers ────────────────────────────────────────

  private headers(): Record<string, string> {
    const h: Record<string, string> = { "User-Agent": this._ua };
    if (this.apiKey) h["X-API-Key"] = this.apiKey;
    return h;
  }

  private async raiseForStatus(res: Response): Promise<void> {
    if (res.status < 400) return;
    let body: ApiErrorPayload = {};
    try {
      body = (await res.json()) as ApiErrorPayload;
    } catch {
      // Non-JSON error body — leave fields undefined.
    }
    const message = body.message || (await res.text().catch(() => "")) || "request failed";
    const opts = { status: res.status, code: body.code, detail: body.detail ?? null };
    if (res.status === 401 || res.status === 403) throw new ApiKeyError(message, opts);
    if (res.status === 404) throw new NotFoundError(message, opts);
    if (res.status === 429) {
      if (body.code === "QUOTA_EXCEEDED") throw new QuotaExceededError(message, opts);
      throw new RateLimitError(message, opts);
    }
    if (res.status >= 500) throw new ServerError(message, opts);
    throw new HalalTerminalError(message, opts);
  }

  /** Generic GET escape hatch — returns parsed JSON. */
  async get<T = unknown>(path: string, params?: Record<string, string | number | boolean>): Promise<T> {
    const url = new URL(`${this.baseUrl}${path.startsWith("/") ? path : `/${path}`}`);
    if (params) {
      for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
    }
    const res = await this._fetch(url.toString(), { method: "GET", headers: this.headers() });
    await this.raiseForStatus(res);
    return (await res.json()) as T;
  }

  /** Generic POST escape hatch — returns parsed JSON. */
  async post<T = unknown>(path: string, body?: unknown): Promise<T> {
    const url = `${this.baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
    const res = await this._fetch(url, {
      method: "POST",
      headers: { ...this.headers(), "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    await this.raiseForStatus(res);
    return (await res.json()) as T;
  }

  // ── Typed endpoints ──────────────────────────────────────────────────

  /** Screen a single symbol for Shariah compliance across all 5 methodologies. */
  async screen(symbol: string, opts: { forceRefresh?: boolean } = {}): Promise<ScreeningResult> {
    return this.get<ScreeningResult>(
      `/api/screen/${symbol.toUpperCase()}`,
      opts.forceRefresh ? { force_refresh: "true" } : undefined,
    );
  }

  async getQuote(symbol: string): Promise<Quote> {
    return this.get<Quote>(`/api/quote/${symbol.toUpperCase()}`);
  }

  async scanPortfolio(symbols: string[]): Promise<PortfolioScanResult> {
    return this.post<PortfolioScanResult>("/api/portfolio/scan", {
      symbols: symbols.map((s) => s.toUpperCase()),
    });
  }

  async calculateZakat(
    holdings: ZakatHolding[],
    opts: { goldPricePerGram?: number } = {},
  ): Promise<ZakatResult> {
    const body: Record<string, unknown> = { holdings };
    if (opts.goldPricePerGram !== undefined) body.gold_price_per_gram = opts.goldPricePerGram;
    return this.post<ZakatResult>("/api/zakat/calculate", body);
  }

  /** Canonical disclaimer registry — no API key required. */
  async getDisclaimers(): Promise<Disclaimer[]> {
    const body = await this.get<DisclaimersRegistryResponse>("/api/disclaimers");
    return body.disclaimers ?? [];
  }

  async health(): Promise<{ message: string }> {
    return this.get("/api/health");
  }
}

// Default export for `import HalalTerminal from "@halalterminal/sdk"`.
export default HalalTerminal;
