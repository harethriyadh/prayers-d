/* Integration tests for prayers API using an ephemeral in-memory MongoDB */

process.env.NODE_ENV = 'test';
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const db = require('../db');

let mongod;
let app;

beforeAll(async () => {
  try {
    mongod = await MongoMemoryServer.create();
    process.env.MONGO_URL = mongod.getUri();
  } catch (err) {
    // mongodb-memory-server may fail in some environments (missing libs).
    // Fall back to using an externally provided MONGO_URL if available.
    if (process.env.MONGO_URL) {
      // use provided MONGO_URL
      // eslint-disable-next-line no-console
      console.warn('mongodb-memory-server unavailable, using MONGO_URL from environment');
    } else {
      // rethrow to fail tests with helpful message
      throw new Error(
        'Could not start in-memory MongoDB. Set MONGO_URL environment variable to a running MongoDB instance to run tests.'
      );
    }
  }
  // require app after MONGO_URL is set so db functions can connect lazily
  app = require('../app');
});

afterAll(async () => {
  await db.close();
  if (mongod) await mongod.stop();
});

beforeEach(async () => {
  await db.clearAll();
});

test('POST /api/prayers upserts and GET /api/prayers/:dateKey returns updated status', async () => {
  const payload = { date: '2025-11-24', prayer: 'الفجر', status: 1 };
  const res = await request(app).post('/api/prayers').send(payload).set('Accept', 'application/json');
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('success', true);
  expect(res.body.data).toHaveProperty('الفجر', 1);

  const get = await request(app).get('/api/prayers/2025-11-24');
  expect(get.status).toBe(200);
  expect(get.body).toHaveProperty('الفجر', 1);
});

test('POST /api/prayers/batch returns requested dates including empty object for missing', async () => {
  // insert one date
  await request(app).post('/api/prayers').send({ date: '2025-11-23', prayer: 'الظهر', status: 2 });

  const res = await request(app)
    .post('/api/prayers/batch')
    .send({ dates: ['2025-11-23', '2025-11-22'] })
    .set('Accept', 'application/json');
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('2025-11-23');
  expect(res.body['2025-11-23']).toHaveProperty('الظهر', 2);
  expect(res.body).toHaveProperty('2025-11-22');
  expect(res.body['2025-11-22']).toEqual({});
});

test('GET /api/prayers returns all data and reflects inserted values', async () => {
  await request(app).post('/api/prayers').send({ date: '2025-11-21', prayer: 'العصر', status: 3 });
  await request(app).post('/api/prayers').send({ date: '2025-11-22', prayer: 'المغرب', status: 1 });

  const res = await request(app).get('/api/prayers');
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('2025-11-21');
  expect(res.body['2025-11-21']).toHaveProperty('العصر', 3);
  expect(res.body).toHaveProperty('2025-11-22');
  expect(res.body['2025-11-22']).toHaveProperty('المغرب', 1);
});
