const mongoose = require('mongoose');
const validator = require('validator');

const serviceSchema = new mongoose.Schema({
    heading: {
        type: String,
        required: [true, 'A heading is required'],
        minlength: 10,
        maxlength: 50,
    },
    body: {
        type: String,
        required: [true, 'The body is required'],
        minlength: 250,
        maxlength: 1024,
    },
});

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;
