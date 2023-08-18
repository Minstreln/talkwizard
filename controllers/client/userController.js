const User = require('../../models/client/userModel');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const factory = require('.././factory/handlerFactory');
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

exports.uploadClientPhoto = upload.single('photo');

exports.resizeClientPhoto = (req, res, next) => {
  if (!req.file) return next();

  if (req.user.photo) {
    const existingPhotoPath = path.join('public/img/clients', req.user.photo);
    if (fs.existsSync(existingPhotoPath)) {
      fs.unlinkSync(existingPhotoPath);
    }
  }

  req.file.filename = `client-${req.user.id}-${Date.now()}.jpeg`;

  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/clients/${req.file.filename}`);

    next();
};

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

exports.getAllUsers = factory.getAll(User);

exports.updateMe = async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This is not for password update. Please use /updatePassword'
      ),
      400
    );
  }

  const filteredBody = filterObj (req.body, 
    'firstName',
    'lastName', 
    'email'
  );

  if (req.file) filteredBody.photo = req.file.filename;

  const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
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
  await User.findByIdAndUpdate(req.user.id, { active: false });

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

exports.getUser = factory.getOne(User);

exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
