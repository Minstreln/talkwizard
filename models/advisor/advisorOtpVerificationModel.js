const mongoose = require('mongoose');


const advisorOtpVerificationSchema = new mongoose.Schema({
    userId: String,
    otp: String,
    createdAt: Date,
    expiresAt: Date,
});

const advisorOtpVerification = mongoose.model(
    'advisorOtpVerification', 
    advisorOtpVerificationSchema
);

module.exports = advisorOtpVerification;

