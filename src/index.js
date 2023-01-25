const config = require('config');
const express = require('express');
var cors = require('cors');
require('./database/mongoose');
var bodyParser = require('body-parser');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
const socketHelper = require('./helpers/socketHelper')
const app = express();

const http = require('http').createServer(app);
// const io = require('socket.io')(http, {
//   cors: {
//     origins: config.get("crossDomains")
//   }
// });



//app.use(cors());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
const port = config.get("app.port");
app.set('port', port);

const appRouter = require('./routes/app_router');
//const adminRouter = require('./routes/admin_router');

app.use('/app', appRouter);
//app.use('/admin', adminRouter);

// io.on('connection', (socket) => {
//   socket.on('disconnect', () => {
//     console.log('user disconnected');
//   });
//   //console.log(socket)
//   socketHelper.getBlockData(socket);
//   socketHelper.getTransactionData(socket);


// });

// setInterval(function(){
//   socketHelper.getBlockData(io);
//   socketHelper.getTransactionData(io);
// }, 20000);

http.listen(config.get("app.socket"), () => {
  console.log('listening on *:' + config.get("app.socket"));
});

module.exports = app;
app.listen(port, () => {
  console.log('Server is up on port ' + port);
});