const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  // If on Railway, check Railway internal MongoDB or MONGO_URL
  const isRailway = !!(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID);
  let uri = process.env.MONGODB_URI || process.env.MONGO_URL;

  if (isRailway && (!uri || uri.includes('127.0.0.1') || uri.includes('localhost'))) {
    console.log('Railway environment detected. Overriding localhost with Railway internal MongoDB...');
    uri = process.env.MONGO_URL || 'mongodb://mongo:GAIiJLZAJKLIOiLhkWUoQbVHTEpuaKal@mongodb.railway.internal:27017';
  }

  // 1. Try connecting to configured MongoDB (e.g. Railway MongoDB service or Atlas)
  if (uri) {
    try {
      console.log(`Connecting to MongoDB at: ${uri.replace(/:[^:]*@/, ':****@')}`);
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 8000,
      });
      console.log(`✅ MongoDB Connected successfully: ${mongoose.connection.host}`);
      return;
    } catch (err) {
      console.error(`MongoDB connection error: ${err.message}.`);
      if (isRailway) {
        // If the custom URI failed on Railway, try the default Railway internal MongoDB
        const railwayInternalUri = 'mongodb://mongo:GAIiJLZAJKLIOiLhkWUoQbVHTEpuaKal@mongodb.railway.internal:27017';
        if (uri !== railwayInternalUri) {
          try {
            console.log(`Trying fallback to Railway internal MongoDB...`);
            await mongoose.connect(railwayInternalUri, { serverSelectionTimeoutMS: 5000 });
            console.log(`✅ Railway internal MongoDB Connected successfully!`);
            return;
          } catch (rErr) {
            console.error(`Railway internal MongoDB fallback error: ${rErr.message}`);
          }
        }
      }
    }
  }

  // 1b. Try default local uri (only if not on cloud hosting)
  if (!isRailway) {
    try {
      const localUri = 'mongodb://127.0.0.1:27017/vkdryclean';
      console.log(`Connecting to local MongoDB at: ${localUri}`);
      await mongoose.connect(localUri, {
        serverSelectionTimeoutMS: 2000,
      });
      console.log(`✅ Local MongoDB Connected successfully: ${mongoose.connection.host}`);
      return;
    } catch (err) {
      console.log(`No active local MongoDB on 27017. Initializing embedded database...`);
    }
  }

  // 2. Start embedded MongoMemoryServer (with Debian 12/13 version compatibility)
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongod = await MongoMemoryServer.create({
      binary: { version: '7.0.14' },
      instance: {
        port: 27017,
        dbName: 'vkdryclean',
      },
    });

    const memUri = mongod.getUri();
    await mongoose.connect(memUri);
    console.log(`✅ Embedded persistent MongoDB active: ${memUri}`);
  } catch (memErr) {
    console.warn(`Dynamic port fallback due to: ${memErr.message}`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create({
        binary: { version: '7.0.14' },
        instance: { dbName: 'vkdryclean' },
      });
      const fallbackUri = mongod.getUri();
      await mongoose.connect(fallbackUri);
      console.log(`✅ Embedded MongoDB connected: ${fallbackUri}`);
    } catch (e) {
      console.error('Fatal DB error:', e.message);
      // Don't exit process immediately, let Express serve error or keep attempting
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
