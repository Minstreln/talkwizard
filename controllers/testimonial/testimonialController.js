const Testimonial = require('../../models/testimonial/testimonialModel');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const factory = require('.././factory/handlerFactory');

exports.createTestimonial = catchAsync(async (req, res, next) => {
    const newTestimonial = await Testimonial.create({
      name: req.body.name,
      occupation: req.body.occupation,
      heading: req.body.heading,
      body: req.body.body,
    });
  
    await newTestimonial.save();

    res.status(201).json({
        status: 'success',
        data: {
            newTestimonial,
        },
    });
});

exports.getAllTestimonials = factory.getAll(Testimonial);
exports.getTestimonial = factory.getOne(Testimonial);
exports.updateTestimonial = factory.updateOne(Testimonial);
exports.deleteTestimonial = factory.deleteOne(Testimonial);
