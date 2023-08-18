const express = require('express');
const adminAuthController = require('../../controllers/admin/adminAuthController');
const adminController = require('../../controllers/admin/adminController');

const Router = express.Router();

Router.post('/login', adminAuthController.login);

Router.get('/logout', adminAuthController.logout);

Router.post('/forgotPassword', adminAuthController.forgotPassword);
Router.patch('/resetPassword/:token', adminAuthController.resetPassword);

Router.use(adminAuthController.protect);

Router.patch('/updatePassword', adminAuthController.updatePassword);

Router.get('/me', adminController.getMe, adminController.getUser);

Router.patch('/updateMe', adminController.updateMe);

Router.delete('/deleteMe', adminController.deleteMe);

Router.post('/banUser/:id',
  adminAuthController.restrictTo('admin'),
  adminController.banUser);

Router.post('/unbanUser/:id',
  adminAuthController.restrictTo('admin'),
  adminController.unbanUser);

Router.post('/banAdvisor/:id',
  adminAuthController.restrictTo('admin'),
  adminController.banAdvisor);

Router.post('/unbanAdvisor/:id',
  adminAuthController.restrictTo('admin'),
  adminController.unbanAdvisor);

Router.post('/acceptAdvisor/:id',
  adminAuthController.restrictTo('admin'),
  adminController.acceptAdvisor);

Router.post('/denyAdvisor/:id',
  adminAuthController.restrictTo('admin'),
  adminController.denyAdvisor);

Router.get('/totalClients',
  adminAuthController.restrictTo('admin'),
  adminController.totalClients);

Router.get('/totalAdvisors',
  adminAuthController.restrictTo('admin'),
  adminController.totalAdvisors);

Router.get('/totalUsers',
  adminAuthController.restrictTo('admin'),
  adminController.totalUsers);

Router.use(adminAuthController.restrictTo('admin'));

Router.route('/')
  .get(adminController.getAllUsers)
  .post(adminController.createUser);

Router.route('/:id')
  .get(adminController.getUser)
  .patch(adminController.updateUser)
  .delete(adminController.deleteUser);

module.exports = Router;
