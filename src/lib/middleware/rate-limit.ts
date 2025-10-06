import "server-only";

type Rule = {
  windowMs: number; // length of the rolling window
  max: number;      // max number of hits allowed in that window
};

type Hit = { ts: number };

type Result =
  | { ok: true; headers: Record<string, string> }
  | { ok: false; retryAfterSec: number; headers: Record<string, string> };

// Persist map across HMR in dev
const buckets: Map<string, Hit[]> =
  (globalThis as { __rl_buckets?: Map<string, Hit[]> }).__rl_buckets ?? new Map();
(globalThis as { __rl_buckets?: Map<string, Hit[]> }).__rl_buckets = buckets;

function pruneOld(hits: Hit[], now: number, windowMs: number) {
  while (hits.length && now - hits[0].ts > windowMs) hits.shift();
}

/**
 * Record a hit for `key` and return whether it's allowed.
 * Keys should be stable identifiers like `ip:1.2.3.4:pwdreq` or `email:foo@bar:verify`
 */
export function rateLimit({
  key,
  rule,
}: {
  key: string;
  rule: Rule;
}): Result {
  const now = Date.now();
  const hits = buckets.get(key) ?? [];
  pruneOld(hits, now, rule.windowMs);

  if (hits.length >= rule.max) {
    const retryAfterMs = hits[0].ts + rule.windowMs - now;
    const retryAfterSec = Math.max(1, Math.ceil(retryAfterMs / 1000));
    return {
      ok: false,
      retryAfterSec,
      headers: {
        "Retry-After": String(retryAfterSec),
        "X-RateLimit-Limit": String(rule.max),
        "X-RateLimit-Remaining": "0",
      },
    };
  }

  hits.push({ ts: now });
  buckets.set(key, hits);

  const remaining = Math.max(0, rule.max - hits.length);
  return {
    ok: true,
    headers: {
      "X-RateLimit-Limit": String(rule.max),
      "X-RateLimit-Remaining": String(remaining),
    },
  };
}
