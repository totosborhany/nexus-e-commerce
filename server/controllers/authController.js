const User = require("../models/userModel");
const catchAsync = require("../utills/catchAsync");
const jwt = require("jsonwebtoken");
const appError = require("../utills/appError");
const AppError = require("../utills/appError");
const Email = require("../utills/email");
const crypto = require("crypto");
const assignToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const assignCookie = (res, statusCode, user, message) => {
  const token = assignToken(user._id);

  res.cookie("jwt", token, {
    expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    secure: true,
    httpOnly: true,
  });
  user.password = undefined;
  user.passwordChangedAt = undefined;

  res.status(statusCode).json({
    status: "success",
    message,
    token,
    user,
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  const exist  = await User.findOne({email:req.body.email});
 if(exist){
   return next(new appError("user with this email already exists", 400));
 }

  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  // await newUser.createVerification();
  //  await newUser.save({ validateBeforeSave: false });
  //  const veremail = new Email("", `your verification code is: ${newUser.verifier}`, newUser);
  // await veremail.send("verification code");
  //  res.send("verification code sent to email");
   
  assigncookies(res, 201, newUser, "user created successfully");
});

exports.login = catchAsync(async (req, res, next) => {
  
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new appError("please provide email and password", 400));
  }
  const user = await User.findOne({ email: email }).select("+password");
  console.log(await user.comparePassword(user.password, req.body.password));

  if (
    !user ||
    !(await user.comparePassword(user.password, req.body.password))
  ) {
    return next(new appError("sorry  invalid credentials", 404));
  }
  //  await user.createVerification();
  //  await user.save({ validateBeforeSave: false });
  //  const veremail = new Email("", `your verification code is: ${user.verifier}`, user);
  //    await veremail.send("verification code");

  //  res.send("verification code sent to email");
     
   
  assignCookie(res, 201, user, "successfully loged in");
});
const verification = catchAsync(async (req, res, next) => {
  // const user = await User.findOne({ email: email });
  const { verifier } = req.body;
  const hashed = await crypto
    .createHash("sha256")
    .update(verifier)
    .digest("hex");
  const user = await User.findOne({
    
    varifierExpires: { $gte: Date.now() },
  });
  if(!user||(verifierDigit!= hashed)){
return false;  
}

  assignCookie(res, 201, user, "successfully loged in");

});
exports.logout = catchAsync(async (req, res, next) => {
  let token = undefined;
  res.cookie("jwt", "logged out", {
    expires: new Date(0),
  });
  res.status(200).json({
    status: "success",
    message: "successfully logged out",
    token
  });
});
exports.authorizedTo = (...roles) => (req, res, next) => {

  console.log(roles," and ",req.user.role);
  if (roles.includes(req.user.role)) {
    return next();}
    return next(new appError("sorry youre not authorized to this action", 403));
  
};
exports.protected = catchAsync(async (req, res, next) => {
  let token;
  let decoded;
  if (
    req.headers.authorization 
   && req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization?.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  } else {
    return next(new AppError("please log in", 401));
  }
  try {
     decoded = await jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new appError(err.message, err.statusCode));
  }
  const user =await  User.findById(decoded.id);
  if (!user) {
    return next(new appError("user doesnt exist", 404));
  }
  if (await user.passwordChangedWhen(token.iat)) {
    return next(new appError("please log in ou changed password nearly", 401));
  }
  req.user = user;
  next();
});
exports.updateMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      email: req.body.email,
      name: req.body.name,
      photo: req.body.photo,
    },
    {
      new: true,
      runValidators: true,
    },
  );
  assignCookie(res, 201, user, "user successfully updated");
});
exports.updatePassword = catchAsync(async (req, res, next) => {
  const { password, newPassword, passwordConfirm } = req.body;

  if (!passwordConfirm || !password || !newPassword) {
    return next(
      new appError(
        "please provide passwordConfim,password and newPassword",
        404,
      ),
    );
  }
  const user = await User.findById(req.user.id).select("+password");
  if (!(await user.comparePassword(user.password, req.body.password))) {
    return next(new appError("invalid password", 401));
  }
  if (req.body.newPassword !== req.body.passwordConfirm) {
    return next(
      new AppError("New password and confirm password do not match", 401),
    );
  }
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  assignCookie(res, 201, user, "password successfully created");
});
exports.forgetPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(new appError("user doesnt exist try signing up", 404));
  }
  const token = await user.createResetToken();
  await user.save({ validateBeforeSave: false });
  console.log(token);

  // const url = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  const messageText = `this is your reset token its only valid for 10 mins ${url}`;

  const sendemail = new Email(url, messageText, user);
  await sendemail.send("reset token");
  res.status(200).json({
    status: "success",
    message: "token sent",
    token
  });
});
exports.resetPassword = catchAsync(async (req, res, next) => {
 const { token, password, passwordConfirm } = req.body;
  if (!token) return next(new appError("Token missing", 400));  console.log(token);
  const hashedToken = await crypto
  .createHash("sha256")
  .update(token)
  .digest("hex");
  
  console.log(hashedToken,token) ;
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gte: Date.now() },
  });

  if (!user) {
    return next(new appError("sorry user not found the token is wrong", 404));
  }

  user.password =password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  assignCookie(res, 201, user, "password successfully reset");
});
