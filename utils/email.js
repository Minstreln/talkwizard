
const nodemailer = require('nodemailer');
const htmlToText = require('html-to-text');

const sendMail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USERNAME, 
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: true,
    },
  });
  const mailOptions = {
    from: 'Minstrel Nwachukwu <minstrel@gmail.com>',
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendMail;
