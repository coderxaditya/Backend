import express from "express";

import { Redis } from "ioredis";

const PORT = 3000;

const app = express();

app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

function otpKey(phone: string) {
  return `otp:${phone}`;
}

app.post("/otp", async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ message: "Phone nmber is required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await redis.set(otpKey(phone), otp, "EX", 30); // Set OTP with a TTL of 30 seconds
  // Some might get confused by the 'EX' parameter, it is used to set the expiration time in seconds for the key in Redis. In this case, the OTP will expire after 30 seconds.

  // In a real application, you would send the OTP via SMS here

  res.json({ message: "OTP sent successfully", otp });
});

app.post("/opt/verify", async (req, res) => {
  
  const { phone, otp } = req.body;
  
  if (!phone || !otp) {
    return res
      .status(400)
      .json({ message: "Phone number and OTP are required" });
  }
  const storedOtp = await redis.get(otpKey(phone));

  if (!storedOtp) {
    return res.status(400).json({ message: "OTP expired or not found" });
  }
  if (storedOtp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  await redis.del(otpKey(phone))

  res.json({ message: "OTP verified successfully" });
});

app.get("/otp/:phone/ttl", async (req, res) => {
  const { phone } = req.params;
  const ttl = await redis.ttl(otpKey(phone));
  if (ttl === -2) { // status code -2 means the key does not exist, which indicates that the OTP has expired or was never set
    return res.status(404).json({ message: "OTP TTL expired" });
  }
  res.json({ phone, ttl });
});

app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});