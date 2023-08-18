const mongoose = require('mongoose');

const futureAndOptionsSchema = new mongoose.Schema({
    name: {
        type: String,
        default: "Future And Options",
    },
    advisor: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Advisor',
    }],
});

const FutureAndOptions = mongoose.model('FutureAndOption', futureAndOptionsSchema);

module.exports = FutureAndOptions;
