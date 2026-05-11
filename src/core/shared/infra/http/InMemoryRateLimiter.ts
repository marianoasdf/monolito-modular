interface RateLimitEntry {
  count: number;
  expiresAt: number;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
  remaining: number;
}

export class InMemoryRateLimiter {
  private readonly entries = new Map<string, RateLimitEntry>();

  constructor(
    private readonly limit: number,
    private readonly windowInMs: number,
  ) {}

  consume(key: string): RateLimitResult {
    const now = Date.now();
    const current = this.entries.get(key);

    if (!current || current.expiresAt <= now) {
      this.entries.set(key, {
        count: 1,
        expiresAt: now + this.windowInMs,
      });

      return {
        allowed: true,
        retryAfterSeconds: Math.ceil(this.windowInMs / 1000),
        remaining: this.limit - 1,
      };
    }

    if (current.count >= this.limit) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, Math.ceil((current.expiresAt - now) / 1000)),
        remaining: 0,
      };
    }

    current.count += 1;
    this.entries.set(key, current);

    return {
      allowed: true,
      retryAfterSeconds: Math.max(1, Math.ceil((current.expiresAt - now) / 1000)),
      remaining: this.limit - current.count,
    };
  }
}