const express = require('express');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/error/errorController');
const userRouter = require(path.join(__dirname, 'routes', 'client', 'userRoutes'));
const advisorRouter = require(path.join(__dirname, 'routes', 'advisor', 'advisorRoutes'));
const contactRouter = require(path.join(__dirname, 'routes', 'contact', 'contactRoutes'));
const adminRouter = require(path.join(__dirname, 'routes', 'admin', 'adminRoutes'));
const blogRouter = require(path.join(__dirname, 'routes', 'blog', 'blogRoutes'));
const likeRouter = require(path.join(__dirname, 'routes', 'reaction', 'likeRoutes'));
const dislikeRouter = require(path.join(__dirname, 'routes', 'reaction', 'dislikeRoutes'));
const upvoteRouter = require(path.join(__dirname, 'routes', 'reaction', 'upvoteRoutes'));
const reviewRouter = require(path.join(__dirname, 'routes', 'reaction', 'reviewRoutes'));
const testimonialRouter = require(path.join(__dirname, 'routes', 'testimonial', 'testimonialRoutes'));
const serviceRouter = require(path.join(__dirname, 'routes', 'service', 'serviceRoutes'));
const categoryRouter = require(path.join(__dirname, 'routes', 'category', 'categoryRoutes'));

const app = express();

app.use(express.static(path.join(__dirname, 'public'))) ;

app.use(helmet());

const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);


if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '10kb' }));

app.use(mongoSanitize());
app.use(xss());

app.use('/api/v1/users', userRouter);
app.use('/api/v1/advisors', advisorRouter);
app.use('/api/v1/contactUs', contactRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/posts', blogRouter);
app.use('/api/v1/like', likeRouter);
app.use('/api/v1/dislike', dislikeRouter);
app.use('/api/v1/upvote', upvoteRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/testimonial', testimonialRouter);
app.use('/api/v1/services', serviceRouter);
app.use('/api/v1/category', categoryRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
  
app.use(globalErrorHandler);

module.exports = app;
