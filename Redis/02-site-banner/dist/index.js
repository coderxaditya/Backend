"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ioredis_1 = require("ioredis");
const redis_constants_1 = require("./constants/redis.constants");
const app = (0, express_1.default)();
const PORT = 3000;
app.use(express_1.default.json());
const redis = new ioredis_1.Redis(process.env.REDIS_URL || "redis://localhost:6379");
app.post("/banner", async (req, res) => {
    try {
        const { message } = req.body;
        if (message !== undefined && typeof message !== "string") {
            return res.status(400).json({
                error: "Message must be a string",
            });
        }
        await redis.set(redis_constants_1.BANNER_KEY, message || "Welcome to our website");
        res.json({ success: true });
    }
    catch (error) {
        console.error("Failed to set banner:", error);
        res.status(500).json({
            error: "Failed to set banner",
        });
    }
});
app.get("/banner", async (req, res) => {
    try {
        const message = await redis.get(redis_constants_1.BANNER_KEY);
        res.json({
            message: message || "Welcome to our website",
        });
    }
    catch (error) {
        console.error("Failed to get banner:", error);
        res.status(500).json({
            error: "Failed to get banner",
        });
    }
});
app.delete("/banner", async (req, res) => {
    try {
        await redis.del(redis_constants_1.BANNER_KEY);
        res.json({ success: true });
    }
    catch (error) {
        console.error("Failed to delete banner:", error);
        res.status(500).json({
            error: "Failed to delete banner",
        });
    }
});
app.get("/banner/exists", async (req, res) => {
    try {
        const exists = await redis.exists(redis_constants_1.BANNER_KEY);
        res.json({ exists: Boolean(exists) });
    }
    catch (error) {
        console.error("Failed to check banner:", error);
        res.status(500).json({
            error: "Failed to check banner",
        });
    }
});
app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
});
