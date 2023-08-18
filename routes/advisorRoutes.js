const express = require('express');
const userController = require('../controllers/advisorController');
const authController = require('../controllers/advisorAuthController');

const Router = express.Router();

Router.post('/signup', authController.signup);

Router.post('/login', authController.login);

Router.post('/forgotPassword', authController.forgotPassword);
Router.patch('/resetPassword/:token', authController.resetPassword);

Router.use(authController.protect);

Router.patch('/updatePassword', authController.updatePassword);

Router.get('/me', userController.getMe, userController.getUser);

Router.patch('/updateMe', userController.updateMe);

Router.delete('/deleteMe', userController.deleteMe);

Router.use(authController.restrictTo('advisor'));

Router.route('/')
  .get(userController.getAllUsers);

Router.route('/:id')
  .get(userController.getUser)
  .delete(userController.deleteUser);

module.exports = Router;
