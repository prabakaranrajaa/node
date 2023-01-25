const fs = require('fs');
const mongoose = require('mongoose');
const config = require('config');

mongoose.connect(config.get('db.connectionString'), {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Database Connected');
});
