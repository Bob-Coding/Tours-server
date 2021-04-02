const express = require("express");
const morgan = require("morgan");
const userRouter = require("./routes/userRouter");
const tourRouter = require("./routes/tourRouter");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./utils/errorHandler");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

const app = express();

//1) GLOBAL MIDDLEWARES
// set security HTTP headers
app.use(helmet());

// development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// limiter for request per set timeframe
const limiter = rateLimit({
  max: 250,
  // 1 hour window
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in one hour.",
});
app.use("/api", limiter);

// body parser, reading data from body into req.body
app.use(express.json());

// data sanitization against NoSQL query injection(Will filter out the query '$')
app.use(mongoSanitize());

// data sanitization against cross-site scripting attacks(XSS), will convert all the HTML symbols to prevend malicious code
app.use(xss());

// prevent parameter pollution, todo: make whitelist dynamic
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);

// test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.headers);
  next();
});

//ROUTES
app.use("/api/tours", tourRouter);
app.use("/api/users", userRouter);

//if a request makes it to this point of code then it means the routers weren't able to catch it
//so if a req is made to a route that isn't specified its catched here for any sort req with app.all
app.all("*", (req, res, next) => {
  //when using parameters for next, express will assume it is an error and will skip any other middlewares in the stack and will go straight to the err handling middleware
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
