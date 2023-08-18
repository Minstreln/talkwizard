const Service = require('../../models/service/serviceModel');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const factory = require('.././factory/handlerFactory');

exports.createService = catchAsync(async (req, res, next) => {
    const newService = await Service.create({
      heading: req.body.heading,
      body: req.body.body,
    });
  
    await newService.save();

    res.status(201).json({
        status: 'success',
        data: {
            newService,
        },
    });
});

exports.getAllServices = factory.getAll(Service);
exports.getService = factory.getOne(Service);
exports.updateService = factory.updateOne(Service);
exports.deleteService = factory.deleteOne(Service);
