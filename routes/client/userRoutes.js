const express = require('express');
const userController = require('../../controllers/client/userController');
const authController = require('../../controllers/client/authController');

const Router = express.Router();

Router.post('/signup',
  authController.uploadClientPhoto,
  authController.resizeClientPhoto,
  authController.signup);

Router.post('/login', authController.login);

Router.get('/logout', authController.logout);

Router.post('/forgotPassword', authController.forgotPassword);
Router.patch('/resetPassword/:token', authController.resetPassword);

Router.use(authController.protect);

Router.patch('/updatePassword', authController.updatePassword);

Router.get('/me', userController.getMe, userController.getUser);

Router.patch('/updateMe', 
  userController.uploadClientPhoto,
  userController.resizeClientPhoto,
  userController.updateMe);

Router.delete('/deleteMe', userController.deleteMe);

Router.use(authController.restrictTo('admin'));

Router.route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

Router.route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = Router;
