const { MongoClient } = require('mongodb');

const MONGO_URL = process.env.MONGO_URL || '';
const DB_NAME = process.env.MONGO_DB || 'prayers_db';

let client;
let collection;

async function connect() {
  if (collection) return collection;
  if (!MONGO_URL) {
    console.error('❌ CRITICAL: MONGO_URL environment variable is missing!');
    console.error('Current environment keys:', Object.keys(process.env));
    throw new Error('Database configuration missing (MONGO_URL)');
  }
  
  console.log('📡 Attempting to connect to MongoDB...');
  client = new MongoClient(MONGO_URL);
  await client.connect();
  const db = client.db(DB_NAME);
  console.log(`✅ Connected to database: ${DB_NAME}`);
  collection = db.collection('prayer_days');
  try {
    await collection.createIndex({ userId: 1, date: 1 }, { unique: true });
  } catch (err) {
    console.error('Index creation failed (likely existing data conflict):', err.message);
  }
  return collection;
}

async function getAll() {
  const col = await connect();
  const docs = await col.find({ userId: 'anonymous' }).toArray();
  const out = {};
  for (const d of docs) {
    out[d.date] = d.data || {};
  }
  return out;
}

async function getByDate(date) {
  const col = await connect();
  const doc = await col.findOne({ userId: 'anonymous', date: date });
  return doc ? doc.data || {} : {};
}

async function upsertPrayer(date, prayer, status) {
  const col = await connect();
  const existing = await getByDate(date);
  const updated = { ...existing, [prayer]: status };
  await col.updateOne({ userId: 'anonymous', date: date }, { $set: { data: updated } }, { upsert: true });
  return updated;
}

async function getBatch(dates) {
  const col = await connect();
  const docs = await col.find({ userId: 'anonymous', date: { $in: dates } }).toArray();
  const map = {};
  for (const d of dates) map[d] = {};
  for (const doc of docs) map[doc.date] = doc.data || {};
  return map;
}

async function deleteByDate(date) {
  const col = await connect();
  const res = await col.deleteOne({ userId: 'anonymous', date: date });
  return res.deletedCount > 0;
}

async function clearAll() {
  const col = await connect();
  await col.deleteMany({ userId: 'anonymous' });
}

async function close() {
  if (client) await client.close();
  client = null;
  collection = null;
}

module.exports = {
  connect,
  getAll,
  getByDate,
  upsertPrayer,
  getBatch,
  deleteByDate,
  clearAll,
  close,
};
