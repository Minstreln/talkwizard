const Admin = require('../../models/admin/adminModel');
const User = require('../../models/client/userModel');
const Advisor = require('../../models/advisor/advisorModel');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const factory = require('.././factory/handlerFactory');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

exports.getAllUsers = factory.getAll(Admin);

exports.updateMe = async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This is not for password update. Please use /updatePassword'
      ),
      400
    );
  }

  const filteredBody = filterObj(req.body, 'firstName', 'lastName', 'email');
  const updateUser = await Admin.findByIdAndUpdate(req.user.id, filteredBody, {
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
  await Admin.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.banUser = catchAsync(async (req, res, next) => {
  const userId = req.params.id; 
  await User.findByIdAndUpdate(userId, { isBanned: true });

  res.status(200).json({
    status: 'success',
    message: 'User has been banned',
    data: null,
  });
});

exports.unbanUser = catchAsync(async (req, res, next) => {
  const userId = req.params.id; 
  await User.findByIdAndUpdate(userId, { isBanned: false });

  res.status(200).json({
    status: 'success',
    message: 'User has been unbanned',
    data: null,
  });
});

exports.banAdvisor = catchAsync(async (req, res, next) => {
  const userId = req.params.id; 
  await Advisor.findByIdAndUpdate(userId, { isBanned: true });

  res.status(200).json({
    status: 'success',
    message: 'Advisor has been banned',
    data: null,
  });
});

exports.unbanAdvisor = catchAsync(async (req, res, next) => {
  const userId = req.params.id; 
  await Advisor.findByIdAndUpdate(userId, { isBanned: false });

  res.status(200).json({
    status: 'success',
    message: 'Advisor has been unbanned',
    data: null,
  });
});

exports.acceptAdvisor = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  await Advisor.findByIdAndUpdate(userId, {  status: true });

  res.status(200).json({
    status: 'success',
    message: 'Advisor has been Accepted!',
    data: null,
  });
});

exports.denyAdvisor = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  await Advisor.findByIdAndUpdate(userId, {  status: false });

  res.status(200).json({
    status: 'success',
    message: 'Advisor has been denied!',
    data: null,
  });
});

exports.totalClients = catchAsync(async (req, res, next) => {
  const totalClients = await User.aggregate([
    {
      $group: {
        _id: null,
        count: { $sum: 1 }
      }
    }
  ]);

  const totalCount = totalClients[0] ? totalClients[0].count : 0;

  res.status(200).json({ 
    status: 'success',
    data: {
      totalClients,
    },
  });
});

exports.totalAdvisors = catchAsync(async (req, res, next) => {
  const totalAdvisors = await Advisor.aggregate([
    {
      $group: {
        _id: null,
        count: { $sum: 1 }
      }
    }
  ]);

  const totalCount = totalAdvisors[0] ? totalAdvisors[0].count : 0;

  res.status(200).json({ 
    status: 'success',
    data: {
      totalAdvisors,
    },
  });
});

exports.totalUsers = catchAsync(async (req, res, next) => {
  const [userCount, advisorCount] = await Promise.all([
    User.countDocuments(),
    Advisor.countDocuments(),
  ]);

  const totalUsers = userCount + advisorCount;

  res.status(200).json({
    status: 'success',
    data: {
      totalUsers,
    },
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined! Please use /signup instead.',
  });
};

exports.getUser = factory.getOne(Admin);

exports.updateUser = factory.updateOne(Admin);
exports.deleteUser = factory.deleteOne(Admin);
