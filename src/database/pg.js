const { Pool } = require('pg');
const fs = require('fs');
const config = require('config');
const { consoleLog } = require('../helpers/commonHelper');
const dbConfig = {
  connectionString: config.get('db.sqlConnectionString'),
  ssl: {
    rejectUnauthorized: false,
  },
};

const pool = new Pool(dbConfig);
pool
  .connect()
  .then((client) => {
    consoleLog('Database Connected');
    client.release();
  })
  .catch((err) => console.error(' connecting', err.stack));

module.exports = pool;
