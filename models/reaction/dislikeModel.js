const mongoose = require('mongoose');

const dislikeSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
  },
  ipAddress: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
});

const Dislike = mongoose.model('Dislike', dislikeSchema);

module.exports = Dislike;
