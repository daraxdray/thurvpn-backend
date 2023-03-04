const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const connecDB = require('./db/connect')
const {authMiddleware,authAdmin} = require('./middleware/authentication')

const indexRouter = require('./routes');
const usersRouter = require('./routes/users');
const vpnRouter = require('./routes/vpn');
const planRouter = require('./routes/plans');
const purchaseRouter = require('./routes/purchases');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/vpn', authMiddleware, vpnRouter);
app.use('/api/plans', planRouter);
app.use('/api/purchases',purchaseRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  // next(createError(404));
  return res.status(404).json({status:false, message:"Resource not found",data:null})
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
