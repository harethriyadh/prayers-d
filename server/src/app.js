const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const prayersRouter = require('./routes/prayers');
const db = require('./db');

function createApp() {
  const app = express();

  app.use(cors());
  app.use(morgan('dev'));
  app.use(express.json({ limit: '10kb' }));

  app.use('/api/prayers', prayersRouter);

  // Root info and health endpoints
  app.get('/', (req, res) => {
    res.json({ message: 'Prayers API', api: '/api/prayers' });
  });

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // 404
  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // error handler
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err && err.stack ? err.stack : err);
    const status = err.status || 500;
    const msg = process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message || 'Internal error';
    res.status(status).json({ error: msg });
  });

  return app;
}

module.exports = createApp();
