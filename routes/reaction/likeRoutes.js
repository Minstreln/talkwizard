const express = require('express');
const likeController = require('../../controllers/reaction/likeController');

const Router = express.Router();

Router.route('/:id').post(likeController.likePost);

module.exports = Router;
