// how to make a queue in bullmq:
// nothing much we just have to give a connection that is redis connection and a name to the queue and we are good to go

// queue.ts Redis connection set karta hai aur BullMQ ki emails queue create karta hai.

declare const process: { env: Record<string, string | undefined> };

import { Queue } from "bullmq";

export const redisConnection = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
};

export const emailQueue = new Queue('emails', {connection: redisConnection});

export default emailQueue;