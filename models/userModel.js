const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name required"],
  },
  email: {
    type: String,
    required: [true, "please provide email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide valid email"],
  },
  photo: String,
  password: {
    type: String,
    required: [true, "Please provide password"],
    minLenghth: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      //this only works on CREATE and SAVE
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords are not the same",
    },
  },
  passwordChangedAt: Date,
});

userSchema.pre("save", async function (next) {
  //only run this function when pass is modified
  if (!this.isModified("password")) return next();
  //hash the pass with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  //delete passwordconfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfterAuth = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimeStamp;
  }
  //false means NOT changed
  return false;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
