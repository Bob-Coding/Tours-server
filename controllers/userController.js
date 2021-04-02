const User = require("./../models/userModel");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const AppError = require("../utils/appError");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

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

//update for logged in user
exports.updateMe = catchAsyncErrors(async (req, res, next) => {
  //1) create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "this route is not for password updates. Please use /updateMyPassword",
        400
      )
    );
  }

  //2) filter out unwanted fieldnames that are not allowed to be updated
  const filteredBody = filterObj(req.body, "name", "email");
  //3) update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "succes",
    data: {
      user: updatedUser,
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

//update for admin to change all fields
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
