const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    advisor: {
      type: mongoose.Schema.ObjectId,
      ref: 'Advisor',
      required: [true, 'Review must belong to an Advisor.'],
    },
    client: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, async function (next) {
    this.populate({
    path: 'client',
    select: 'userName photo',
  });

  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
