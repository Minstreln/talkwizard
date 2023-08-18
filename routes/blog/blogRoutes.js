const express = require('express');

const blogController = require('../../controllers/blog/blogController');
const adminAuthController = require('../../controllers/admin/adminAuthController');

const Router = express.Router();

Router.route('/latest-post').get(
  blogController.aliasLatestPost,
  blogController.getAllPosts
);

Router.route('/')
  .get(blogController.getAllPosts)
  .post(
    adminAuthController.protect,
    adminAuthController.restrictTo('admin'),
    blogController.createPost);
Router.route('/:id')
  .get(blogController.getPost)
  .patch(
    adminAuthController.protect,
    adminAuthController.restrictTo('admin'),
    blogController.updatePost)
  .delete(
    adminAuthController.protect,
    adminAuthController.restrictTo('admin'),
    blogController.deletePost
  );

module.exports = Router;
