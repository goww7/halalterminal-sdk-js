// Smoke tests for the JS SDK — uses node:test + a mocked fetch.
// Compiles src/index.ts via tsc on build; tests import from dist.
// To run during dev without a build, the tests instantiate the
// HalalTerminal class via the compiled output expected at dist/index.mjs.

import test from "node:test";
import assert from "node:assert/strict";
import {
  HalalTerminal,
  ApiKeyError,
  NotFoundError,
  QuotaExceededError,
  RateLimitError,
  ServerError,
  HalalTerminalError,
} from "../dist/index.mjs";

/** Build a fake fetch that returns a single canned response. */
function fakeFetch(payload, status = 200) {
  return async () =>
    new Response(JSON.stringify(payload), {
      status,
      headers: { "content-type": "application/json" },
    });
}

/** Build a fake fetch that captures the request for assertions. */
function recordingFetch(payload, status = 200) {
  const calls = [];
  const fn = async (url, init) => {
    calls.push({ url: String(url), init });
    return new Response(JSON.stringify(payload), {
      status,
      headers: { "content-type": "application/json" },
    });
  };
  fn.calls = calls;
  return fn;
}

const DISCLAIMER = {
  id: "screening",
  version: "2026-05-12",
  lang: "en",
  severity: "religious",
  text: "Methodology-based screen, not a fatwa.",
  url: "https://halalterminal.com/legal/disclaimer#no-shariah-certification",
};

test("screen() returns typed result with disclaimers", async () => {
  const fetchImpl = fakeFetch({
    symbol: "AAPL",
    is_compliant: true,
    shariah_compliance_status: "compliant",
    by_methodology: { AAOIFI: { is_compliant: true, verified: true, reason: null } },
    disclaimers: [DISCLAIMER],
  });
  const ht = new HalalTerminal({ apiKey: "k", fetchImpl });
  const r = await ht.screen("aapl");
  assert.equal(r.symbol, "AAPL");
  assert.equal(r.is_compliant, true);
  assert.equal(r.disclaimers.length, 1);
  assert.equal(r.disclaimers[0].severity, "religious");
});

test("screen() uppercases symbol in the URL", async () => {
  const fetchImpl = recordingFetch({
    symbol: "MSFT",
    is_compliant: true,
    shariah_compliance_status: "compliant",
    by_methodology: {},
    disclaimers: [],
  });
  const ht = new HalalTerminal({ apiKey: "k", fetchImpl });
  await ht.screen("msft");
  assert.ok(fetchImpl.calls[0].url.endsWith("/api/screen/MSFT"));
});

test("scanPortfolio() uppercases symbols in the body", async () => {
  const fetchImpl = recordingFetch({
    summary: { total: 2, compliant: 2, non_compliant: 0 },
    results: [],
    disclaimers: [],
  });
  const ht = new HalalTerminal({ apiKey: "k", fetchImpl });
  await ht.scanPortfolio(["aapl", "msft"]);
  const body = JSON.parse(fetchImpl.calls[0].init.body);
  assert.deepEqual(body.symbols, ["AAPL", "MSFT"]);
});

test("getDisclaimers() works without an API key", async () => {
  const fetchImpl = recordingFetch({ disclaimers: [DISCLAIMER], total: 1 });
  const ht = new HalalTerminal({ fetchImpl });
  const items = await ht.getDisclaimers();
  assert.equal(items.length, 1);
  assert.equal(items[0].id, "screening");
  // No X-API-Key header on the request.
  assert.equal(fetchImpl.calls[0].init.headers["X-API-Key"], undefined);
});

test("401 routes to ApiKeyError", async () => {
  const fetchImpl = fakeFetch({ code: "API_KEY_REQUIRED", message: "missing key" }, 401);
  const ht = new HalalTerminal({ apiKey: "k", fetchImpl });
  await assert.rejects(() => ht.screen("AAPL"), (err) => {
    assert.ok(err instanceof ApiKeyError);
    assert.equal(err.status, 401);
    assert.equal(err.code, "API_KEY_REQUIRED");
    return true;
  });
});

test("404 routes to NotFoundError", async () => {
  const fetchImpl = fakeFetch({ code: "HTTP_404", message: "not found" }, 404);
  const ht = new HalalTerminal({ apiKey: "k", fetchImpl });
  await assert.rejects(() => ht.screen("NOPE"), (err) => err instanceof NotFoundError);
});

test("429 with QUOTA_EXCEEDED routes to QuotaExceededError", async () => {
  const fetchImpl = fakeFetch(
    { code: "QUOTA_EXCEEDED", message: "limit", detail: "Upgrade to Starter" },
    429,
  );
  const ht = new HalalTerminal({ apiKey: "k", fetchImpl });
  await assert.rejects(() => ht.screen("AAPL"), (err) => {
    assert.ok(err instanceof QuotaExceededError);
    assert.equal(err.detail, "Upgrade to Starter");
    return true;
  });
});

test("429 without quota code routes to RateLimitError", async () => {
  const fetchImpl = fakeFetch({ code: "RATE_LIMIT", message: "too many" }, 429);
  const ht = new HalalTerminal({ apiKey: "k", fetchImpl });
  await assert.rejects(() => ht.screen("AAPL"), (err) => err instanceof RateLimitError);
});

test("500 routes to ServerError", async () => {
  const fetchImpl = fakeFetch({ code: "INTERNAL_ERROR", message: "boom" }, 500);
  const ht = new HalalTerminal({ apiKey: "k", fetchImpl });
  await assert.rejects(() => ht.screen("AAPL"), (err) => err instanceof ServerError);
});

test("HalalTerminalError is the base of every API error class", () => {
  const err = new ApiKeyError("x");
  assert.ok(err instanceof HalalTerminalError);
  assert.equal(err.name, "ApiKeyError");
});

test("trailing slash in baseUrl is stripped", () => {
  const ht = new HalalTerminal({ apiKey: "k", baseUrl: "https://api.halalterminal.com/" });
  assert.equal(ht.baseUrl, "https://api.halalterminal.com");
});
