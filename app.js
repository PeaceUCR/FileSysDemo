var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');

var mongoose = require('mongoose');

var app = express();

var socketIO =require('socket.io');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://peace:123@localhost:27017/myDB',{ useNewUrlParser: true });
//mongoose.connect('mongodb://Peace2018:heping1991@ds153198.mlab.com:53198/auth',{ useNewUrlParser: true });

app.io = socketIO();
require('./socket/notification')(app.io);

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send({
      message: res.locals.message,
      status: res.locals.error.status,
      stack: res.locals.error.stack
  });
});

module.exports = app;
