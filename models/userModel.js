const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

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
    default: "user",
  },
  photo: String,
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
  },
  password: {
    type: String,
    required: [true, "Please provide password"],
    minLength: 8,
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
  passwordResetToken: String,
  passwordResetExpires: Date,
});

userSchema.pre("save", async function (next) {
  // only run this function when pass is modified
  if (!this.isModified("password")) return next();
  // hash the pass with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  // delete passwordconfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  //-1000(-1s)small hack to put passwordChangedAt 1s in the past to ensure created JWT token is always created after password is changed
  this.passwordChangedAt = Date.now() - 1000;
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
  // false means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  // create token
  const resetToken = crypto.randomBytes(32).toString("hex");
  // encrypt token
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
