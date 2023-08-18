const express = require('express');
const upvoteController = require('../../controllers/reaction/upvoteController');

const Router = express.Router();

Router.route('/:id').post(upvoteController.upvotePost);

module.exports = Router;
