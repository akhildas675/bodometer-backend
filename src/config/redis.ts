import Redis from "ioredis";
import logger from "./logger.config";

let redisClient: Redis;

export function connectRedis() {
  redisClient = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || "0"),
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    lazyConnect: false,
  });

  redisClient.on("connect", () => {
    logger.info("Redis connected");
  });

  redisClient.on("error", (err) => {
    logger.error({ err }, "Redis client error");
  });

  return redisClient;
}

export function getRedisClient(): Redis {
  if (!redisClient) {
    throw new Error("Redis client not initialized. Call connectRedis() first.");
  }
  return redisClient;
}

// Helper functions for common operations
export async function get(key: string): Promise<string | null> {
  const client = getRedisClient();
  return client.get(key);
}

export async function set(key: string, value: string, ttlSeconds?: number): Promise<void> {
  const client = getRedisClient();
  if (ttlSeconds) {
    await client.setex(key, ttlSeconds, value);
  } else {
    await client.set(key, value);
  }
}

export async function del(key: string): Promise<void> {
  const client = getRedisClient();
  await client.del(key);
}

export async function delPattern(pattern: string): Promise<void> {
  const client = getRedisClient();
  const keys = await client.keys(pattern);
  if (keys.length > 0) {
    await client.del(...keys);
  }
}

export async function exists(key: string): Promise<boolean> {
  const client = getRedisClient();
  const result = await client.exists(key);
  return result === 1;
}

export async function expire(key: string, ttlSeconds: number): Promise<void> {
  const client = getRedisClient();
  await client.expire(key, ttlSeconds);
}
