const Advisor = require('../../models/advisor/advisorModel');
const FutureAndOptions = require('../../models/category/futureAndOptionsModel');
const Intraday = require('../../models/category/intradayModel');
const LongTermGoals = require('../../models/category/longTermGoalsModel');
const ShortTermGoals = require('../../models/category/shortTermGoalsModel');
const catchAsync = require('../../utils/catchAsync');
const getDynamicModel = require('../../utils/dynamicModel');
const AppError = require('../../utils/appError');
const factory = require('./../factory/handlerFactory');


exports.getAllFutureAndOptions = factory.getAll(FutureAndOptions);
exports.getAllIntraday = factory.getAll(Intraday);
exports.getAllLongTermGoals = factory.getAll(LongTermGoals);
exports.getAllShortTermGoals= factory.getAll(ShortTermGoals);

exports.getAllDynamicModels = catchAsync(async (req, res) => {
  try {
    const allData = {};

    for (const category of getDynamicModel) {
      const DynamicModel = getDynamicModel(category);
      const data = await DynamicModel.find().exec();
      allData[category] = data;
    }

    res.status(200).json({
      status: 'success',
      data: allData,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving data',
      error: error.message,
    });
  }
});

exports.getFutureAndOptions = catchAsync(async (req, res, next) => {

  const futureAndOptionsId =  req.params.id
  
  const futureAndOptions = await FutureAndOptions
    .findById(futureAndOptionsId)
    .populate({
      path: 'advisor',
      select: 'photo  skills  userName  email  phone  experience  language  qualification  startTime  gender   websiteLink companyName  companyAddress  companyLink  instagramLink  facebookLink  twitterLink  youtubeLink',
    });
  
  
  res.status(200).json({
    status: 'success',
    data: {
      futureAndOptions,
    },
  });

});

exports.getIntraday = catchAsync(async (req, res, next) => {

  const intradayId =  req.params.id
  
  const intraday = await Intraday
    .findById(intradayId)
    .populate({
      path: 'advisor',
      select: 'photo  skills  userName  email  phone  experience  language  qualification  startTime  gender   websiteLink companyName  companyAddress  companyLink  instagramLink  facebookLink  twitterLink  youtubeLink',
    });
  
  
  res.status(200).json({
    status: 'success',
    data: {
      intraday,
    },
  });

});

exports.getLongTermGoals = catchAsync(async (req, res, next) => {

  const longTermGoalsId =  req.params.id
  
  const longTermGoals = await LongTermGoals
    .findById(longTermGoalsId)
    .populate({
      path: 'advisor',
      select: 'photo  skills  userName  email  phone  experience  language  qualification  startTime  gender   websiteLink companyName  companyAddress  companyLink  instagramLink  facebookLink  twitterLink  youtubeLink',
    });
  
  
  res.status(200).json({
    status: 'success',
    data: {
      longTermGoals,
    },
  });
});

exports.getShortTermGoals = catchAsync(async (req, res, next) => {

  const shortTermGoalsId =  req.params.id
  
  const shortTermGoals = await ShortTermGoals
    .findById(shortTermGoalsId)
    .populate({
      path: 'advisor',
      select: 'photo  skills  userName  email  phone  experience  language  qualification  startTime  gender   websiteLink companyName  companyAddress  companyLink  instagramLink  facebookLink  twitterLink  youtubeLink',
    });
  
  
  res.status(200).json({
    status: 'success',
    data: {
      shortTermGoals,
    },
  });
});

exports.deleteFutureAndOptions = factory.deleteOne(FutureAndOptions);
exports.deleteIntraday = factory.deleteOne(Intraday);
exports.deleteLongTermGoals = factory.deleteOne(LongTermGoals);
exports.deleteShortTermGoals = factory.deleteOne(ShortTermGoals);