const mongoose = require('mongoose');

const intradaySchema = new mongoose.Schema({
    name: {
        type: String,
        default: "Intraday",
    },
    advisor: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Advisor',
    }],
});

const Intraday = mongoose.model('Intraday', intradaySchema);

module.exports = Intraday;
