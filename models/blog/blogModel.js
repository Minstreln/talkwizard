const mongoose = require('mongoose');
const slugify = require('slugify');
const Admin = require('../../models/admin/adminModel');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A post must have a title'],
    unique: true,
    trim: true,
    maxlength: [50, 'A post title cannot have more than 50 characters'],
    minlength: [10, 'A post title must have a minimum of 10 characters'],
  },
  author: {
    type: String,
    default: 'Admin',
  },
  slug: String,
  body: {
    type: String,
    required: [true, 'A post must have a body'],
  },
  images: [String],
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Like',
    },
  ],
  dislikes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dislike',
    },
  ],
  upvotes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Upvote',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
});

blogSchema.pre('save', function (next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
