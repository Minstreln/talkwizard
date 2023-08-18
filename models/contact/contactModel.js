const mongoose = require('mongoose');
const validator = require('validator');

const contactSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'Please tell us your first name'],
    },
    lastName: {
        type: String,
        required: [true, 'Please tell us your last name'],
    },
    email: {
        type: String,
        required: [true, 'Please provide Email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid Email'],
    },
    phone: {
        type: String,
        required: [true, 'Please provide a phone number with your country code at the beginning.'],
        unique: true,
    },
    subject: {
        type: String,
        required: [true, 'Please select a Subject.'],
    },
    message: {
        type: String,
        required: [true, 'Please enter your message'],
    },
});


const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;
