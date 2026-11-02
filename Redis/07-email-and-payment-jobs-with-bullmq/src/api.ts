import express from "express";
import { emailQueue, paymentQueue } from "./queue.ts";

const app = express();

app.use(express.json());

const PORT = 3000;

app.post("/welcome-email", async (req, res) => {
  const { to, name } = req.body;
  if (!to || !name) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  // Here you would typically add the email to the queue
  const job = await emailQueue.add(
    "welcome-email", // job name

    {
      to,
      name,
    }, // job data

    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
    }, // job options (e.g., retry attempts and backoff strategy)

    // retry attempts: 3 means that if the job fails, it will be retried up to 3 times
    // backoff: 5000 means that if the job fails, it will wait for 5 seconds before retrying
  );
  res
    .status(201)
    .json({ message: "Welcome email job added to the queue", jobId: job.id });
});

app.post("/payment", async (req, res) => {
  const { userId, amount, currency } = req.body;

  if (!userId || !amount || !currency) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const job = await paymentQueue.add(
    "process-payment",
    {
      userId,
      amount,
      currency,
    },
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
    },
  );

  res.status(201).json({
    message: "Payment job added to the queue",
    jobId: job.id,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});

// Teeno files ka complete flow
// api.ts

// Client request aati hai aur job queue mein add hoti hai.

// queue.ts

// Redis connection aur emails queue manage karta hai.

// worker.ts

// Queue se job uthakar process karta hai.
