const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const AppError = require('./utils/appError');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const globalErrorHandler = require('./controllers/errorController');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
//SERVING STATIC FILES
app.use(express.static(path.join(__dirname, 'public')));

//Set security HTTP Headers
app.use(helmet());

//Development Logging
// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//LIMIT REQ FROM THE SAME IP ADDRESS
const limiter = rateLimit({
  max: 100, //adjust this based on app
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour',
});
app.use('/api', limiter);
//BODY PARSER, READING DATA FROM BODY INTO REQ.BODY
app.use(express.json({ limit: '10kb' }));

//DATA SANITIZATION AGAINST NOSQL QUERY INJECTION
app.use(mongoSanitize());
//DATA SANITIZATION AGAINST XSS
app.use(xss());
//PREVENTING PARAMETER POLLUTION
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'difficulty',
      'price',
      'ratingsQuantity',
      'maxGroupSize',
    ],
  })
);

//TEST MIDDLEWARE
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  next();
});

// 3) ROUTES
app.get('/', (req, res) => {
  res.status(200).render('base', {
    tour: 'The Forest Hiker',
    user: 'Lindsey',
  });
});
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server.`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
