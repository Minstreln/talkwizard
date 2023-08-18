const express = require('express');
const categoryController = require('../../controllers/category/categoryController');

const Router = express.Router();

Router.get('/futureAndOptions', categoryController.getAllFutureAndOptions);

Router.get('/intraday', categoryController.getAllIntraday);

Router.get('/longTermGoals', categoryController.getAllLongTermGoals);

Router.get('/shortTermGoals', categoryController.getAllShortTermGoals);

Router.get('/dynamic', categoryController.getAllDynamicModels);



Router.get('/futureAndOptions/:id', categoryController.getFutureAndOptions);

Router.get('/intraday/:id', categoryController.getIntraday);

Router.get('/longTermGoals/:id', categoryController.getLongTermGoals);

Router.get('/shortTermGoals/:id', categoryController.getShortTermGoals);



Router.delete('/futureAndOptions/:id', categoryController.deleteFutureAndOptions);

Router.delete('/intraday/:id', categoryController.deleteIntraday);

Router.delete('/longTermGoals/:id', categoryController.deleteLongTermGoals);

Router.delete('/shortTermGoals/:id', categoryController.deleteShortTermGoals);

module.exports = Router;
