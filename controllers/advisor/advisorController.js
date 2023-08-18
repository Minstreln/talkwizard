const Advisor = require('../../models/advisor/advisorModel');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const factory = require('./../factory/handlerFactory');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

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

  if (req.user.photo) {
    const existingPhotoPath = path.join('public/img/advisors', req.user.photo);
    if (fs.existsSync(existingPhotoPath)) {
      fs.unlinkSync(existingPhotoPath);
    }
  }

  req.file.filename = `advisor-${req.user.id}-${Date.now()}.jpeg`;

  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/advisors/${req.file.filename}`);

    next();
};

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

exports.aliasTopAdvisors = catchAsync(async (req, res, next) => {
  const advisors = await Advisor.aggregate([
    {
      $match: {
        experience: { $gte: 5 },
      },
    },
    {
      $project: {
        userName: 1,
        qualification: 1,
        language: 1,
        experience: 1,
        _id: 0,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    result: advisors.length,
    data: {
      advisors,
    },
  });
});

exports.getAllUsers = factory.getAll(Advisor);

exports.updateMe = async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This is not for password update. Please use /updatePassword'
      ),
      400
    );
  }

  const filteredBody = filterObj(req.body, 
  'firstName', 
  'lastName', 
  'email',
  'phone',
  'aadharNo',
  'panNo',
  'sebiNo',
  'birthDate',
  'experience',
  'gender',
  'qualification',
  'language',
  'websiteLink',
  'skills',
  'companyName',
  'companyAddress',
  'companyLink',
  'instagramLink',
  'facebookLink',
  'twitterLink',
  'youtubeLink',
  'siteTime',
  'startTime',
  'endTime',);

  if (req.file) filteredBody.photo = req.file.filename;

  const updateUser = await Advisor.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updateUser,
    },
  });
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.deleteMe = catchAsync(async (req, res, next) => {
  await Advisor.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined! Please use /signup instead.',
  });
};

exports.getUser = factory.getOne(Advisor);
exports.deleteUser = factory.deleteOne(Advisor);
