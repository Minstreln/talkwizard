
const nodemailer = require('nodemailer');

const sendMail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USERNAME, //save in config.env
      pass: process.env.EMAIL_PASSWORD, //save in config.env
    },
    tls: {
      rejectUnauthorized: true,
    },
  });
  const mailOptions = {
    from: 'Minstrel Nwachukwu <minstrel@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendMail;
