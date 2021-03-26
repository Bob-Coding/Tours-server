const express = require("express");
const morgan = require("morgan");
const userRouter = require("./routes/userRouter");
const tourRouter = require("./routes/tourRouter");
const AppError = require("./utils/AppError");
const globalErrorHandler = require("./utils/errorHandler");

const app = express();

console.log(process.env.NODE_ENV);
//MIDDLEWARES
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
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
