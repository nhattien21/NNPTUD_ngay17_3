var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let mongoose = require('mongoose')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/categories', require('./routes/categories'));
app.use('/api/v1/products', require('./routes/products'));
app.use('/api/v1/roles', require('./routes/roles'));
app.use('/api/v1/auth', require('./routes/auth'));

// Connect to MongoDB
async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/NNPTUD-S3';
    await mongoose.connect(mongoUri);
    console.log("✓ MongoDB connected successfully");
  } catch (err) {
    console.log("MongoDB connection failed, starting in-memory MongoDB...");
    try {
      const startMongoDB = require('./mongoSetup');
      const mongoServer = await startMongoDB();
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("✓ In-Memory MongoDB connected successfully");
    } catch (fallbackErr) {
      console.error("Failed to start both MongoDB and in-memory server:", fallbackErr);
      process.exit(1);
    }
  }
}

connectDB();

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
