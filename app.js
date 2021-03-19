const express = require("express");
const morgan = require("morgan");
const userRouter = require("./routes/userRouter");
const tourRouter = require("./routes/tourRouter");

const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.requestTime);
  next();
});

app.use("/api/tours", tourRouter);
app.use("/api/users", userRouter);

module.exports = app;
