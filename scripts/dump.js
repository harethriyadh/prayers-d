#!/usr/bin/env node
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = process.env.MONGO_DB || 'prayers_db';
const OUT_FILE = path.join(__dirname, '..', 'dump.json');

if (!MONGO_URL) {
  console.error('MONGO_URL not set. Provide a MongoDB connection string in env to run this dump script.');
  process.exit(1);
}

async function run() {
  const client = new MongoClient(MONGO_URL);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    
    // Get all collections in the database
    const collections = await db.listCollections().toArray();
    
    const dumpData = {};
    
    for (const colInfo of collections) {
      const colName = colInfo.name;
      const col = db.collection(colName);
      console.log(`Fetching data from collection: ${colName}...`);
      const data = await col.find({}).toArray();
      dumpData[colName] = data;
    }
    
    fs.writeFileSync(OUT_FILE, JSON.stringify(dumpData, null, 2));
    console.log(`Successfully dumped database '${DB_NAME}' to ${OUT_FILE}`);
  } catch (err) {
    console.error('Dumping failed:', err);
    process.exitCode = 2;
  } finally {
    await client.close();
  }
}

run();
