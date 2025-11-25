const { MongoClient } = require('mongodb');

const MONGO_URL = process.env.MONGO_URL || '';
const DB_NAME = process.env.MONGO_DB || 'prayers_db';

let client;
let collection;

async function connect() {
  if (collection) return collection;
  if (!MONGO_URL) {
    throw new Error('MONGO_URL not set');
  }
  client = new MongoClient(MONGO_URL);
  await client.connect();
  const db = client.db(DB_NAME);
  collection = db.collection('prayer_days');
  // ensure index on _id (date) is present by default
  return collection;
}

async function getAll() {
  const col = await connect();
  const docs = await col.find({}).toArray();
  const out = {};
  for (const d of docs) {
    out[d._id] = d.data || {};
  }
  return out;
}

async function getByDate(date) {
  const col = await connect();
  const doc = await col.findOne({ _id: date });
  return doc ? doc.data || {} : {};
}

async function upsertPrayer(date, prayer, status) {
  const col = await connect();
  const existing = await getByDate(date);
  const updated = { ...existing, [prayer]: status };
  await col.updateOne({ _id: date }, { $set: { data: updated } }, { upsert: true });
  return updated;
}

async function getBatch(dates) {
  const col = await connect();
  const docs = await col.find({ _id: { $in: dates } }).toArray();
  const map = {};
  for (const d of dates) map[d] = {};
  for (const doc of docs) map[doc._id] = doc.data || {};
  return map;
}

async function deleteByDate(date) {
  const col = await connect();
  const res = await col.deleteOne({ _id: date });
  return res.deletedCount > 0;
}

async function clearAll() {
  const col = await connect();
  await col.deleteMany({});
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
