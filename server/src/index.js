require('dotenv').config();
const path = require('path');
const app = require('./app');

const PORT = process.env.SERVER_PORT || 3000;

app.listen(PORT, () => {
  console.log(`Prayers API listening on port ${PORT} (API base: /api/prayers)`);
});
