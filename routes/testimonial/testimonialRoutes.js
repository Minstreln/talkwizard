const express = require('express');
const testimonialController = require('../../controllers/testimonial/testimonialController');
const adminAuthController = require('../../controllers/admin/adminAuthController');

const Router = express.Router();

Router.route('/')
  .get(testimonialController.getAllTestimonials)
  .post(testimonialController.createTestimonial);

Router.route('/:id')
  .get(testimonialController.getTestimonial)
  .patch(testimonialController.updateTestimonial)
  .delete(testimonialController.deleteTestimonial);

module.exports = Router;
