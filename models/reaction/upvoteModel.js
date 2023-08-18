const mongoose = require('mongoose');

const upvoteSchema = new mongoose.Schema({
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

const Upvote = mongoose.model('Upvote', upvoteSchema);

module.exports = Upvote;
