const express = require('express');
const advisorController = require('../../controllers/advisor/advisorController');
const advisorAuthController = require('../../controllers/advisor/advisorAuthController');
const reviewRouter = require('../../routes/reaction/reviewRoutes');

const Router = express.Router();

Router.use('/:advisorId/reviews', reviewRouter);

Router.route('/top-advisors').get(
  advisorController.aliasTopAdvisors,
  advisorController.getAllUsers
);

Router.post('/signup',
  advisorAuthController.uploadAdvisorPhoto,
  advisorAuthController.resizeAdvisorPhoto,
  advisorAuthController.signup);

Router.post('/login', advisorAuthController.login);

Router.get('/logout', advisorAuthController.logout);

Router.post('/forgotPassword', advisorAuthController.forgotPassword);
Router.patch('/resetPassword/:token', advisorAuthController.resetPassword);

Router.use(advisorAuthController.protect);

Router.patch('/updatePassword', advisorAuthController.updatePassword);

Router.get('/me', advisorController.getMe, advisorController.getUser);

Router.patch('/updateMe',
  advisorController.uploadAdvisorPhoto,
  advisorController.resizeAdvisorPhoto,
  advisorController.updateMe);

Router.delete('/deleteMe', advisorController.deleteMe);

Router.get('/activeAdvisors', 
  advisorAuthController.restrictTo('client', 'admin'), 
  advisorAuthController.getAllActiveAdvisors);

// Router.use(advisorAuthController.restrictTo('admin'));

Router.route('/')
  .get(advisorAuthController.restrictTo('client', 'admin'), advisorController.getAllUsers);

Router.route('/:id')
  .get(advisorAuthController.restrictTo('client', 'admin'), advisorController.getUser)
  .delete(advisorAuthController.restrictTo('admin'), advisorController.deleteUser);

module.exports = Router;
