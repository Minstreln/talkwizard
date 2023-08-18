const express = require('express');
const serviceController = require('../../controllers/service/serviceController');

const Router = express.Router();

Router.route('/')
  .get(serviceController.getAllServices)
  .post(serviceController.createService);

Router.route('/:id')
  .get(serviceController.getService)
  .patch(serviceController.updateService)
  .delete(serviceController.deleteService);

module.exports = Router;
