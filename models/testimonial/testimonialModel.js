const mongoose = require('mongoose');
const validator = require('validator');

const testimonialSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name.'],
    },
    occupation: String,
    heading: {
        type: String,
        required: [true, 'A testimonial heading is required!'],
        maxlength: 50,
        minlength: 25,
    },
    body: {
        type: String,
        required: [true, 'Please fill the body'],
        maxlength: 200,
        minlength: 100,
    }
})

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

module.exports = Testimonial;
