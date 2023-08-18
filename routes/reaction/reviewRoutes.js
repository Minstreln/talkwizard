// step 77, creating and getting reviews
const express = require('express');
const reviewController = require('../../controllers/reaction/reviewController');
const authController = require('../../controllers/client/authController');

const Router = express.Router({ mergeParams: true });

Router.use(authController.protect);

Router.route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('client'),
    reviewController.setTourAndUserIds,
    reviewController.createReview
  );


Router.route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('client', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('client', 'admin'),
    reviewController.deleteReview
  );

module.exports = Router;
