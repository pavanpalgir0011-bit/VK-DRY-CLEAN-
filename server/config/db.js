const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URL;

  // 1. Try connecting to configured MongoDB (e.g. Railway MongoDB service or Atlas)
  if (uri) {
    try {
      console.log(`Connecting to configured MongoDB...`);
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`✅ MongoDB Connected successfully: ${mongoose.connection.host}`);
      return;
    } catch (err) {
      console.error(`Configured MongoDB connection error: ${err.message}. Trying local fallback...`);
    }
  }

  // 1b. Try default local uri
  try {
    const localUri = 'mongodb://127.0.0.1:27017/vkdryclean';
    console.log(`Connecting to MongoDB at: ${localUri}`);
    await mongoose.connect(localUri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`✅ Local MongoDB Connected successfully: ${mongoose.connection.host}`);
    return;
  } catch (err) {
    console.log(`No active local MongoDB on 27017. Initializing embedded database with persistent disk storage...`);
  }

  // 2. Start embedded MongoMemoryServer
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongod = await MongoMemoryServer.create({
      instance: {
        port: 27017,
        dbName: 'vkdryclean',
      },
    });

    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log(`✅ Embedded persistent MongoDB active on port 27017: ${uri}`);
  } catch (memErr) {
    console.warn(`Dynamic port fallback due to: ${memErr.message}`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create({ instance: { dbName: 'vkdryclean' } });
      const fallbackUri = mongod.getUri();
      await mongoose.connect(fallbackUri);
      console.log(`✅ Embedded MongoDB connected: ${fallbackUri}`);
    } catch (e) {
      console.error('Fatal DB error:', e);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
  } catch (err) {
    console.error('Error during DB disconnect', err);
  }
};

module.exports = { connectDB, disconnectDB };
