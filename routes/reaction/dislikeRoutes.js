const express = require('express');
const dislikeController = require('../../controllers/reaction/dislikeController');

const Router = express.Router();

Router.route('/:id').post(dislikeController.dislikePost);

module.exports = Router;
