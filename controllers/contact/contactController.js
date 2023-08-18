const Contact = require('../../models/contact/contactModel');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');

exports.submit = catchAsync(async (req, res, next) => {
    const newUser = await Contact.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      subject: req.body.subject,
      message: req.body.message,
    });
  
    await newUser.save();

    res.status(201).json({
        status: 'success',
        data: {
          newUser,
        },
    });
});
