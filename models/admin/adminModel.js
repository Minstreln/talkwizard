const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please tell us your first name'],
  },
  lastName: {
    type: String,
    required: [true, 'Please tell us your last name'],
  },
  userName: {
    type: String,
  },
  email: {
    type: String,
    required: [true, 'Please provide Email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid Email'],
  },
  photo: String,
  role: {
    type: String,
    enum: ['client', 'advisor', 'admin'],
    default: 'client',
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number with your country code at the beginning.'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Password do not match',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

adminSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hashSync(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

adminSchema.pre('save', function (next) {
  if (!this.isModified('firstName') && !this.isModified('lastName')) {
    return next();
  }

  const username = (this.firstName + ' ' + this.lastName);
  this.set('userName', username);
  next();
});


adminSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

adminSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

adminSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

adminSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 1 * 60 * 1000;

  return resetToken;
};

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
