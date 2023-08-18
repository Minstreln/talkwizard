const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
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
    default: 'advisor',
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number with your country code at the beginning.'],
    unique: true,
  },
  aadharNo: {
    type: String,
    required: [true, 'Please provide aadhar No'],
    unique: true,
  },
  panNo: {
    type: String,
    required: [true, 'Please provide aadhar No'],
    unique: true,
  },
  sebiNo: {
    type: String,
    required: [true, 'Please provide sebi No'],
    unique: true,
  },
  birthDate: {
    type: String,
    required: [true, 'Please provide Email'],
    lowercase: true,
    validate: [validator.isDate, 'Please provide a valid Email'],
  },
  experience: {
    type: Number,
    required: [true, 'Please provide a valid number of years'],
  },
  gender: {
    type: String,
    required: [true, 'Please select your gender'],
  },
  qualification: {
    type: String,
    required: [true, 'Please provide qualification'],
  },
  language: {
    type: String,
    required: [true, 'Please provide a language'],
  },
  websiteLink: String,
  skills: {
    type: [String],
    required: true,
    validate: {
      validator: function(arr) {
        return arr.length >= 2;
      },
      message: 'Please provide at least two skills',
    },
  },
  companyName: String,
  companyAddress: String,
  companyLink: String,
  instagramLink: String,
  facebookLink: String,
  twitterLink: String,
  youtubeLink: String,
  siteTime: {
    type: Number,
    required: [true, 'Please enter a number of hours']
  },
  startTime: {
    type: String,
    validate: {
      validator: function(value) {
        const timePattern = /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/i;
        return timePattern.test(value);
      },
      message: 'Please provide a valid start time',
    },
  },
  endTime: {
    type: String,
    validate: {
      validator: function(value) {
        const timePattern = /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/i;
        return timePattern.test(value);
      },
      message: 'Please provide a valid end time',
    },
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

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hashSync(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('firstName') && !this.isModified('lastName')) {
    return next();
  }

  const username = (this.firstName + ' ' + this.lastName);
  this.set('userName', username);
  next();
});


userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 1 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
