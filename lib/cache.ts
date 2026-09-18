type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const cache = new Map<string, CacheEntry<unknown>>();

export function getCachedValue<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.value as T;
}

export function setCachedValue<T>(key: string, value: T, ttlMs: number) {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

export function clearCache() {
  cache.clear();
}

export function withRequestDeduplication<T>(key: string, loader: () => Promise<T>): Promise<T> {
  const pendingKey = `__pending__${key}`;
  const existing = (globalThis as typeof globalThis & { [key: string]: Promise<T> | undefined })[pendingKey];
  if (existing) {
    return existing;
  }

  const promise = loader();
  (globalThis as typeof globalThis & { [key: string]: Promise<T> | undefined })[pendingKey] = promise;

  return promise.finally(() => {
    delete (globalThis as typeof globalThis & { [key: string]: Promise<T> | undefined })[pendingKey];
  });
}
