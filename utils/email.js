const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  //1) How to use with gmail:
  // const transporter = nodemailer.createTransport({
  //     service: "gmail",
  //     auth: {
  //       user: process.env.EMAIL_USERNAME,
  //       pass: process.env.EMAIL_PASSWORD,
  //     },
  //   });
  //2) Then activate option "less secure app" option in your gmail account.

  //1) create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  //2) define the email options
  const mailOptions = {
    from: "The creator of Tours app <devtourstest@test.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
    //html:
  };
  //3) send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
