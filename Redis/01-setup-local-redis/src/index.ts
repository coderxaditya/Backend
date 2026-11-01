import express from "express";
import { Redis } from "ioredis";
import mongoose from "mongoose";

const PORT = Number(process.env.PORT) || 3000;

const app = express();

app.use(express.json());

const redis = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379"
);

const mongoUrl =
  process.env.MONGO_URL ||
  "mongodb://localhost:27017/chai_aur_redis";

// Redis endpoint
app.get("/redis", async (req, res) => {
  try {
    const reply = await redis.ping();

    res.json({
      message: `Redis replied with: ${reply}`,
    });
  } catch (error) {
    res.status(500).json({
      error: "Redis connection failed",
    });
  }
});

// MongoDB endpoint
app.get("/mongo", (req, res) => {
  res.json({
    mongo: "connected",
    database: mongoose.connection.name,
  });
});

// Start server after MongoDB connects
async function startServer() {
  try {
    await mongoose.connect(mongoUrl);

    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();