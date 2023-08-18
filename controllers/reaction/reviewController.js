const Review = require('../../models/reaction/reviewModel');
const factory = require('.././factory/handlerFactory');

exports.getAllReviews = factory.getAll(Review);
exports.setTourAndUserIds = (req, res, next) => {
  if (!req.body.advisor) req.body.advisor = req.params.advisorId;
  if (!req.body.client) req.body.client = req.user.id;
  next();
};

exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
