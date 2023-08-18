const Blog = require('../../models/blog/blogModel');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const apiFeatures = require('../../utils/apiFeatures');
const factory = require('.././factory/handlerFactory');

exports.aliasLatestPost = (req, res, next) => {
  req.query.limit = '3';
  req.query.sort = '-createdAt';
  req.query.fields =
    'title,author,body,images';
  next();
};

exports.getAllPosts = factory.getAll(Blog);

exports.createPost = factory.createOne(Blog);
exports.getPost = factory.getOne(Blog);

exports.updatePost = factory.updateOne(Blog)

exports.deletePost = factory.deleteOne(Blog)
