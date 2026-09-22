const NodeCache = require("node-cache");

/**
 * Single shared in-memory cache instance for the whole process.
 *
 * stdTTL: default time-to-live in seconds for every key (can be overridden per-set).
 * checkperiod: how often expired keys are swept from memory.
 *
 * NOTE: this is per-process memory. If you ever run multiple server instances
 * behind a load balancer, this cache will NOT be shared between them — that's
 * fine for now (a few duplicate upstream calls is cheap), but swap for Redis
 * if that becomes a problem.
 */
const cache = new NodeCache({
  stdTTL: 600, // 10 minutes default
  checkperiod: 120,
  useClones: false,
});

/**
 * Builds a stable, collision-resistant cache key from a namespace and params.
 * e.g. buildKey('food:search', { q: 'apple', pageSize: 25, pageNumber: 1 })
 *   -> 'food:search:pageNumber=1&pageSize=25&q=apple'
 */
function buildKey(namespace, params = {}) {
  const sorted = Object.keys(params)
    .filter(
      (k) => params[k] !== undefined && params[k] !== null && params[k] !== "",
    )
    .sort()
    .map((k) => `${k}=${String(params[k]).toLowerCase().trim()}`)
    .join("&");
  return `${namespace}:${sorted}`;
}

function get(key) {
  return cache.get(key);
}

function set(key, value, ttlSeconds) {
  if (ttlSeconds === undefined) {
    return cache.set(key, value);
  }
  return cache.set(key, value, ttlSeconds);
}

function del(key) {
  return cache.del(key);
}

function flush() {
  return cache.flushAll();
}

module.exports = { buildKey, get, set, del, flush };
