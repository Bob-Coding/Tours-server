const User = require("./../models/userModel");
const catchAsyncErrors = require("../utils/catchAsyncErrors");

exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: "failure",
    message: "Route is not yet defined",
  });
};

exports.getUser = (req, res) => {
  res.status(500).json({
    status: "failure",
    message: "Route is not yet defined",
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: "failure",
    message: "Route is not yet defined",
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: "failure",
    message: "Route is not yet defined",
  });
};
