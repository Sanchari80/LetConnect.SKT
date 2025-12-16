const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // Gmail ব্যবহার করলে
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// একটা helper function বানাও
async function sendResetEmail(to, resetLink) {
  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Password Reset",
    text: `Click here to reset your password: ${resetLink}`,
  });
}

module.exports = { sendResetEmail };