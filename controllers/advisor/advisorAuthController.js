const { promisify } = require('util');
// eslint-disable-next-line import/no-extraneous-dependencies
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../../models/client/userModel');
const LongTermGoals = require('../../models/category/longTermGoalsModel');
const ShortTermGoals = require('../../models/category/shortTermGoalsModel');
const FutureAndOptions = require('../../models/category/futureAndOptionsModel');
const Intraday = require('../../models/category/intradayModel');
const Advisor = require('../../models/advisor/advisorModel');
const Admin = require('../../models/admin/adminModel');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const sendMail = require('../../utils/email');
const getDynamicModel = require('../../utils/dynamicModel');
const multer = require('multer');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const advisorOtpVerification = require('../../models/advisor/advisorOtpVerificationModel');

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

exports.uploadAdvisorPhoto = upload.single('photo');

exports.resizeAdvisorPhoto = (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `advisor-$${uuidv4()}-${Date.now()}.jpeg`;

  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/advisors/${req.file.filename}`);

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

let transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USERNAME, // save in config.env
    pass: process.env.EMAIL_PASSWORD, // save in config.env
  },
  tls: {
    rejectUnauthorized: true,
  },
});

exports.sendOtpVerificationEmail = catchAsync(async (req, res, next) => {
    const { email } = req.body;
    const userId = req.userId;

    if (!email) {
      throw new AppError('Please provide a valid email in the email field', 400);
    }

    const otp = `${Math.floor(100000 + Math.random() * 900000)}`;

    const mailOptions = {
      from: 'Minstrel Nwachukwu <minstrel@gmail.com>',
      to: email,
      subject: 'Verify your Email',
      html: `<p>Enter <b>${otp}</b> in the app to verify your email address</p><p>This code <b>expires in 10 Minutes</b></p>.`,
    };

    const hashedOtp = await bcrypt.hash(otp, 10);
    const newOtpVerification = new advisorOtpVerification({
      userId: userId,
      otp: hashedOtp,
      createdAt: Date.now(),
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    await newOtpVerification.save();
    await transporter.sendMail(mailOptions);
});


exports.getAllActiveAdvisors = catchAsync(async (req, res) => {
  const minutes = [1, 2, 3, 4, 5];

  const currentTime = new Date();
  const allAdvisors = await Advisor.find({}).exec();

  const activeAdvisors = [];
  const inactiveAdvisors = [];

  allAdvisors.forEach((advisor) => {
    const lastActivityTime = advisor.lastActivity.getTime();
    if (lastActivityTime > currentTime.getTime() - minutes[4] * 60 * 1000) {
      activeAdvisors.push(advisor);
    } else {
      inactiveAdvisors.push(advisor);
    }
  });

  const sortedAdvisors = activeAdvisors.concat(inactiveAdvisors);

  if (sortedAdvisors.length === 0) {
    return res.status(500).json({
      status: 'Error',
      message: 'No advisors found.',
      data: {
        activeUsers: [],
      },
    });
  }

  res.status(200).json({
    status: 'success',
    message: sortedAdvisors.length,
    data: {
      activeUsers: sortedAdvisors,
    }
  });
});

exports.signup = catchAsync(async (req, res, next) => {
  const uniqueID = `TZA${uuidv4().replace(/-/g, '').substring(0, 4)}`;
  const newUser = await Advisor.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    phone: req.body.phone,
    aadharNo: req.body.aadharNo,
    panNo: req.body.panNo,
    sebiNo: req.body.sebiNo,
    birthDate: req.body.birthDate,
    experience: req.body.experience,
    gender: req.body.gender,
    qualification: req.body.qualification,
    language: req.body.language,
    websiteLink: req.body.websiteLink,
    skills: req.body.skills,
    category: req.body.category,
    companyName: req.body.companyName,
    companyAddress: req.body.companyAddress,
    companyLink: req.body.companyLink,
    instagramLink: req.body.instagramLink,
    facebookLink: req.body.facebookLink,
    twitterLink: req.body.twitterLink,
    youtubeLink: req.body.youtubeLink,
    siteTime: req.body.siteTime,
    startTime: req.body.startTime,
    endTime: req.bodyendTime,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    uniqueID,
    photo: req.file && req.file.filename,
  });

  const advisorID = newUser._id;
  
    for (const category of req.body.category) {
      let categoryModel;
      switch (category) {
        case 'Long term goals':
          categoryModel = LongTermGoals;
          break;
        case 'Short term goals':
          categoryModel = ShortTermGoals;
          break;
        case 'Future and options':
          categoryModel = FutureAndOptions;
          break;
        case 'Intraday':
          categoryModel = Intraday;
          break;
        default:
          categoryModel = getDynamicModel(category);
          break;
      }

      if (categoryModel) {
        const existingCategory = await categoryModel.findOne({});

        if (existingCategory) {
          await categoryModel.updateOne(
            { _id: existingCategory._id },
            { $addToSet: { advisor: advisorID } }
          );
        } else {
          await categoryModel.create({ name: category, advisor: [advisorID] });
        }
      }
    }

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { userName, password } = req.body;

  if (!userName || !password) {
    return next(new AppError('Please provide a username and password', 400));
  }

  const advisor = await Advisor.findOne({ userName }).select('+password +isBanned +status');

  if (!advisor || !(await advisor.correctPassword(password, advisor.password))) {
    return next(new AppError('Incorrect username or password', 401));
  }

  if (advisor.isBanned === true) {
    return next(new AppError('You are banned. Please contact the administrator for further information.', 403));
  }

  if (advisor.status === false) {
    return next(new AppError('Your request has not been accept. If this is a mistake, Please contact the administrator for further information.', 403));
  }

  await Advisor.updateOne(
    { _id: advisor._id },
    { $set: { lastActivity: new Date() } }
  );

  createSendToken(advisor, 200, res);
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
  const advisor = await Advisor.findOne({ email: req.body.email });
  if (!advisor) {
    return next(new AppError('There is no user with that email address'), 404);
  }

  const resetToken = advisor.createPasswordResetToken();
  await advisor.save({ validateBeforeSave: false });

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
      email: advisor.email,
      subject: 'Your password reset token (Valid for only 10mins)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    advisor.passwordResetToken = undefined;
    advisor.passwordResetExpired = undefined;
    await advisor.save({ validateBeforeSave: false });

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

  const advisor = await Advisor.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!advisor) {
    return next(new AppError('Token is Invalid or has expired'), 400);
  }

  advisor.password = req.body.password;
  advisor.passwordConfirm = req.body.passwordConfirm;
  advisor.passwordResetToken = undefined;
  advisor.passwordResetExpires = undefined;
  await advisor.save();

  createSendToken(advisor, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const advisor = await Advisor.findById(req.user.id).select('+password');

  if (!(await advisor.correctPassword(req.body.passwordCurrent, advisor.password))) {
    return next(new AppError('Your current password is wrong'), 401);
  }

  advisor.password = req.body.password;
  advisor.passwordConfirm = req.body.passwordConfirm;
  await advisor.save();

  createSendToken(advisor, 200, res);
});
