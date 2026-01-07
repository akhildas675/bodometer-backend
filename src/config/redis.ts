import Redis from "ioredis";

export const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
});

export const connectRedis = async () => {
  return new Promise<void>((resolve, reject) => {
    redis.once("connect", () => {
      console.log("Redis connected");
      resolve();
    });

    redis.once("error", (err) => {
      console.error("Redis connection failed:", err);
      reject(err);
    });
  });
};
