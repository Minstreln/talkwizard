const express = require('express');
const contactController = require('../../controllers/contact/contactController');

const Router = express.Router();

Router.post('/submit', contactController.submit);

module.exports = Router;
