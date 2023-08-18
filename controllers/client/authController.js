const { promisify } = require('util');
// eslint-disable-next-line import/no-extraneous-dependencies
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../../models/client/userModel');
const Admin = require('../../models/admin/adminModel');
const Advisor = require('../../models/advisor/advisorModel');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const sendMail = require('../../utils/email');
const multer = require('multer');
const sharp = require('sharp');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true)
  } else {
    cb(new AppError('Not an image, please upload only Images', 400), false)
  };
};

const upload = multer({ 
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadClientPhoto = upload.single('photo');

exports.resizeClientPhoto = (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `client-${uuidv4()}-${Date.now()}.jpeg`;

  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/clients/${req.file.filename}`);

    next();
};

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

exports.signup = catchAsync(async (req, res, next) => {
  const uniqueID = `TZU${uuidv4().replace(/-/g, '').substring(0, 4)}`;
  const newUser = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    phone: req.body.phone,
    uniqueID,
    photo: req.file && req.file.filename,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { userName, password } = req.body;

  if (!userName || !password) {
    return next(new AppError('Please Provide username and password', 400));
  }

  const user = await User.findOne({ userName }).select('+password +isBanned');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect Username Or Password', 401));
  }

  if (user.isBanned === true) {
    return next(new AppError('You are banned. Please contact the administrator for further information.', 403));
  }

  createSendToken(user, 200, res);
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

  let currentUser;

  currentUser = await Advisor.findById(decoded.id);

  if (!currentUser) {
    currentUser = await Admin.findById(decoded.id);
  }

  if (!currentUser) {
    currentUser = await User.findById(decoded.id);
  }

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
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with that email address'), 404);
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

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
      email: user.email,
      subject: 'Your password reset token (Valid for only 10mins)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpired = undefined;
    await user.save({ validateBeforeSave: false });

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

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is Invalid or has expired'), 400);
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong'), 401);
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  createSendToken(user, 200, res);
});
