#!/usr/bin/env node
/**
 * Seed script for prayers MongoDB
 * Usage:
 *   MONGO_URL="..." node scripts/seed.js
 * Options:
 *   --drop   : clear existing collection before seeding
 */

const { MongoClient } = require('mongodb');

const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = process.env.MONGO_DB || 'prayers_db';
const DROP = process.argv.includes('--drop');

if (!MONGO_URL) {
  console.error('MONGO_URL not set. Provide a MongoDB connection string in env to run this seed script.');
  process.exit(1);
}

const SAMPLE = {
  '2025-11-24': { 'الفجر': 1, 'الظهر': 3, 'العصر': 2 },
  '2025-11-23': { 'الفجر': 2, 'الظهر': 2, 'العصر': 1 },
  '2025-11-22': { 'الفجر': 3, 'الظهر': 1, 'العصر': 1 },
};

async function run() {
  const client = new MongoClient(MONGO_URL);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const col = db.collection('prayer_days');

    if (DROP) {
      console.log('Dropping existing documents in prayer_days...');
      await col.deleteMany({});
    }

    const ops = Object.entries(SAMPLE).map(([date, data]) => ({
      updateOne: {
        filter: { _id: date },
        update: { $set: { data } },
        upsert: true,
      },
    }));

    const res = await col.bulkWrite(ops);
    console.log('Seed complete. Summary:', res.result || res);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exitCode = 2;
  } finally {
    await client.close();
  }
}

run();
