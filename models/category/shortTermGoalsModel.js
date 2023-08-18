const mongoose = require('mongoose');

const shortTermGoalsSchema = new mongoose.Schema({
    name: {
        type: String,
        default: "Short Term Goals",
    },
    advisor: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Advisor',
    }],
});

const ShortTermGoals = mongoose.model('ShortTermGoal', shortTermGoalsSchema);

module.exports = ShortTermGoals;
