require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGO_URL = process.env.MONGO_URL || "mongodb+srv://alharethcn12012_db_user:12341234@prayer.oqctcuc.mongodb.net/?appName=prayer";

async function testConnection() {
  console.log('Testing connection to:', MONGO_URL);
  const client = new MongoClient(MONGO_URL);
  try {
    await client.connect();
    console.log('Successfully connected to MongoDB!');
    const db = client.db('prayers_db');
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    await client.close();
  } catch (err) {
    console.error('Connection failed:', err.message);
  }
}

testConnection();
