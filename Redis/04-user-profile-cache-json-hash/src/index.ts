// This exercise the demonstrate that how hash way is better than json way to store data in redis. 
// Because in json way we have to store the entire object as a string, which is not efficient. 
// But in hash way we can store the object as a hash, which is more efficient and we can also retrieve individual fields from the hash.
// 
// Also in redis we do not have to worry about the size of the object, because redis can handle large objects. But in json way we have to worry about the size of the object, because we have to store the entire object as a string, which can be inefficient and can cause performance issues.

import express from "express";

import { Redis } from "ioredis";

const app = express();

app.use(express.json());

const redis = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379"
)

app.post('/user/:id/json', async (req, res) => {
  const { id } = req.params;
  const userData = req.body;

  await redis.set(`user:${id}`, JSON.stringify(userData));

  res.status(201).json({ message: "User data cached successfully" });
});

app.get('/user/:id/json', async (req, res) => {
  const { id } = req.params;

  const cachedData = await redis.get(`user:${id}`);

  if (cachedData) {
    return res.status(200).json(JSON.parse(cachedData));
  }

  res.status(404).json({ message: "User not found in cache" });
});

app.post('/user/:id/hash', async (req, res) => {
  const { id } = req.params;
  const userData = req.body;

  await redis.hset(`user:${id}`, userData);

  res.status(201).json({ message: "User data cached successfully in hash" });
});

app.get('/user/:id/hash', async (req, res) => {
  const { id } = req.params;

  const cachedData = await redis.hgetall(`user:${id}`);
  // hgetall returns an entire hash as an object, even if the key does not exist, it returns an empty object

  if (Object.keys(cachedData).length > 0) {
    return res.status(200).json(cachedData);
  }

  res.status(404).json({ message: "User not found in cache" });
});

app.listen(3000, () => {
  console.log("Server is running on port http://localhost:3000");
});


// Notes:

// // commands in redis:
// set = store a string value in redis
// get = retrieve a string value from redis
// hset = store a hash value in redis (basically storing an object in redis) (its a key value pair where the value is an object)
// hgetall = retrieve a hash value from redis (basically retrieving an object from redis) (its a key value pair where the value is an object)


// more commands:
// hset = store a hash value in redis (basically storing an object in redis) (its a key value pair where the value is an object)
// hget = retreave a single hash field from redis (basically retrieving a single key from an object in redis) (its a key value pair where the value is an object)
// hgetall = retrieve a hash value from redis (basically retrieving an object from redis) (its a key value pair where the value is an object)
// hexists = check if a hash field exists in redis (basically checking if a key exists in an object in redis) (its a key value pair where the value is an object)
// hdel = delete a hash field in redis (basically deleting a key from an object in redis) (its a key value pair where the value is an object)

// // difference between hset and hmset:
// hset = store a single hash field in redis (basically storing a single key in an object in redis) (its a key value pair where the value is an object)
// hmset = store multiple hash fields in redis (basically storing multiple keys in an object in redis) (its a key value pair where the value is an object)

// // difference between hget and hmget:
// hget = retrieve a single hash field from redis (basically retrieving a single key from an object in redis) (its a key value pair where the value is an object)
// hmget = retrieve multiple hash fields from redis (basically retrieving multiple keys from an object in redis) (its a key value pair where the value is an object)

// // difference between hgetall and hmget:
// hgetall = retrieve all hash fields from redis (basically retrieving all keys from an object in redis) (its a key value pair where the value is an object)
// hmget = retrieve multiple hash fields from redis (basically retrieving multiple keys from an object in redis) (its a key value pair where the value is an object)

// // difference between hdel and hdel:
// hdel = delete a single hash field from redis (basically deleting a single key from an object in redis) (its a key value pair where the value is an object)
// hdel = delete multiple hash fields from redis (basically deleting multiple keys from an object in redis) (its a key value pair where the value is an object)


// // difference between hget and hgetall:
// hget = retrieve a single hash field from redis (basically retrieving a single key from an object in redis) (its a key value pair where the value is an object)
// hgetall = retrieve all hash fields from redis (basically retrieving all keys from an object in redis) (its a key value pair where the value is an object)

// // difference between hset and hsetnx:
// hset = store a hash field in redis (basically storing a key in an object in redis) (its a key value pair where the value is an object)
// hsetnx = store a hash field in redis only if it does not exist (basically storing a key in an object in redis only if it does not exist) (its a key value pair where the value is an object)