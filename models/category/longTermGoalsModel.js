const mongoose = require('mongoose');

const longTermGoalsSchema = new mongoose.Schema({
    name: {
        type: String,
        default: "Long Term Goals",
    },
    advisor: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Advisor',
    }],
});

const LongTermGoals = mongoose.model('LongTermGoal', longTermGoalsSchema);

module.exports = LongTermGoals;
