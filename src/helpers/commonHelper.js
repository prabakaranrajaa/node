const config = require('config');

exports.consoleLog = (e) => {
  if (config.get('server.DEBUG')) {
    console.log(e);
  }
};