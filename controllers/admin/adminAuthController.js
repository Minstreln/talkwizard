const { promisify } = require('util');
// eslint-disable-next-line import/no-extraneous-dependencies
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Admin = require('../../models/admin/adminModel');
const Advisor = require('../../models/advisor/advisorModel');
const User = require('../../models/client/userModel');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const sendMail = require('../../utils/email');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.login = catchAsync(async (req, res, next) => {
  const { userName, password } = req.body;

  if (!userName || !password) {
    return next(new AppError('Please Provide username and password', 400));
  }

  const admin = await Admin.findOne({ userName }).select('+password');

  if (!admin || !(await admin.correctPassword(password, admin.password))) {
    return next(new AppError('Incorrect Username Or Password', 401));
  }

  createSendToken(admin, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
    message: 'Logged Out Successfully, refresh page',
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Please log in to get access', 401));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await Admin.findById(decoded.id);

  if (!currentUser) {
    return next(new AppError('The token does not exist', 401));
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again', 401)
    );
  }

  req.user = currentUser;
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action'),
        403
      );
    }
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const admin = await Admin.findOne({ email: req.body.email });
  if (!admin) {
    return next(new AppError('There is no user with that email address'), 404);
  }

  const resetToken = admin.createPasswordResetToken();
  await admin.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `
  <h1>Forgot Your Password?</h1>
  <p>Please follow the link below to change your password</p>
  <p><a href="${resetURL}">${resetURL}</a></p>
  <p>If you didn't forget your password, please ignore this email.</p>
  `;

  try {
    await sendMail({
      email: admin.email,
      subject: 'Your password reset token (Valid for only 10mins)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    admin.passwordResetToken = undefined;
    admin.passwordResetExpired = undefined;
    await admin.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email, try again later.'),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const admin = await Admin.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!admin) {
    return next(new AppError('Token is Invalid or has expired'), 400);
  }

  admin.password = req.body.password;
  admin.passwordConfirm = req.body.passwordConfirm;
  admin.passwordResetToken = undefined;
  admin.passwordResetExpires = undefined;
  await admin.save();

  createSendToken(admin, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const admin = await Admin.findById(req.user.id).select('+password');

  if (!(await admin.correctPassword(req.body.passwordCurrent, admin.password))) {
    return next(new AppError('Your current password is wrong'), 401);
  }

  admin.password = req.body.password;
  admin.passwordConfirm = req.body.passwordConfirm;
  await admin.save();

  createSendToken(admin, 200, res);
});
