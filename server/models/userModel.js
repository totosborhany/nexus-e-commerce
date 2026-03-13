const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      minLength: [8, "name too short must be longer than 8 characters"],
      maxLength: [20, "name too long must be shorter than 20 charecters"],
      trim: true,
      unique: [true, "name must be unique"],
      required: [true, "please create a username"],
    },
    email: {
      type: String,
      trim: true,
      validate: [validator.isEmail, "please provide valid email"],
    },
    password: {
      type: String,
      validate: {
        validator: function (el) {
          return validator.isStrongPassword(el, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
          });
        },
        message: "choose a strong password please",
      },
      select: false,
      trim: true,
      required: [true, "password is required"],
    },
    passwordConfirm: {
      type: String,
      validate: {
        validator: function (p) {
          return p === this.password;
        },
        message: "password must match please",
      },
      select: false,
      required: [true, "please confirmPassword is required"],
    },
    passwordChangedAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "user", "publisher"],
      default: "user",
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    photo: {
      type: String,
      default: "default.jpeg",
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
    },
    verifierDigit: String,
    varifierExpires: Date
    ,
    likes:[{
      type:mongoose.Schema.ObjectId,
      ref:"Game"
    }]
  
  
  },
  
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  //next();
});
userSchema.pre(/^find/g, function () {
  this.find({
    active: {
      $ne: false,
    },
  });
});
userSchema.methods.comparePassword = async function (real, input) {
  return await bcrypt.compare(input, real);
};
userSchema.methods.passwordChangedWhen = async function (jwtexpired) {
  return await jwtexpired < this.passwordChangedAt;
};
userSchema.methods.createResetToken = async function () {
  const resetToken = await crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = await crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.PasswordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};
userSchema.methods.createVerification = async function () {
  const array = new Uint32Array(1);
  await crypto.webcrypto.getRandomValues(array); // Node 19+ Web Crypto API

  const verifier = ((array[0] % 900000) + 100000).toString(); // 6-digit code

  // hash it before storing
  this.verifierDigit = await crypto
    .createHash("sha256")
    .update(verifier)
    .digest("hex");
  this.varifierExpires = Date.now() + 10 * 60 * 1000;

  return verifier;
};
const userModel = mongoose.model("User", userSchema);
module.exports = userModel;
