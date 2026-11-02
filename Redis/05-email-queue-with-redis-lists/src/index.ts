import express from "express";

import { Redis } from "ioredis";

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

const QUEUE_KEY = "queue:emails";

app.post("/emails", async (req, res) => {
  const { to, subject, body } = req.body;
  if (!to || !subject || !body) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const job = {
    to: to,
    subject: subject,
    body: body,
    createdAt: new Date().toISOString(),
  };

  await redis.lpush(QUEUE_KEY, JSON.stringify(job));

  res.status(201).json({ message: "Email job added to the queue", job: job });
});

app.get("/emails/process-one", async (req, res) => {
  const rawJob = await redis.rpop(QUEUE_KEY);

  if (!rawJob) {
    return res.status(404).json({ message: "No email jobs in the queue" });
  }

  const job = JSON.parse(rawJob);

  // Here you would normally process the email job, e.g., send the email using an email service
  res.status(200).json({ message: "Email job processed(sent)", job: job });
});

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});


// if you are using redis as a list quwe, you can use the following commands to manage the queue:
// LPUSH queue:emails <job> - Add a job to the queue
// RPOP queue:emails - Remove and return the last job from the queue
// LRANGE queue:emails 0 -1 - Get all jobs in the queue
// LLEN queue:emails - Get the number of jobs in the queue


// if you are using as a queue there is a chance that the job will be lost if the server crashes before processing the job.
// To avoid this, you can use a reliable queue pattern by using a second list to store the jobs that are being processed. You can use the following commands to implement this pattern:
// LPUSH queue:emails <job> - Add a job to the queue
// RPOPLPUSH queue:emails processing:emails - Move a job from the queue to the processing list
// LREM processing:emails 1 <job> - Remove a job from the processing list after it has been processed
// LRANGE processing:emails 0 -1 - Get all jobs in the processing list
// LLEN processing:emails - Get the number of jobs in the processing list