// worker.ts queue se jobs uthata hai, processor function run karta hai aur job complete ya fail hone ke events handle karta hai.


import { Job, Worker } from "bullmq";

import { redisConnection } from "./queue.ts";

const emailWorker = new Worker(
  // it takes 3 parameters, first is the name of the queue(basically the queue from which want to pich data since we can have multiple queues),
  // second is the function that will process the job and
  // third is the connection to redis

  'emails',
  async (job: Job) => {
    // Here you would normally process the email job, e.g., send the email using an email service(basically your business logic)
    console.log(`Processing job ${job.id} with data:`, job.data, `with id ${job.id}`, `with name ${job.name}`);
  },
  { connection: redisConnection }
)

emailWorker.on('completed', (job) => {
  console.log(`Job ${job.id} has been completed`);
});

emailWorker.on('failed', (job, err) => {
  console.log(`Job ${job?.id} has failed with error: ${err.message}`);
});

const paymentWorker = new Worker(
  'payments',
  async (job: Job) => {
    console.log(`Processing job ${job.id} with data:`, job.data, `with id ${job.id}`, `with name ${job.name}`);
  },
  {
    connection: redisConnection
  }
)

paymentWorker.on('completed', (job) => {
  console.log(`Job ${job.id} has been completed`)
})

paymentWorker.on('failed', (job, err) => {
  console.log(`Job ${job?.id} has failed with error: ${err.message}`);
})

export default emailWorker;