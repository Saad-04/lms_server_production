import nodemailer, { createTransport } from "nodemailer";
import path from "path";
import ejs from "ejs";
import { trusted } from "mongoose";
require("dotenv").config();
// interface MailOptions {
//   email: string;
//   subject: string;
//   // text: string;
//   html: any;
//   // template: string;
//   // data: { [key: string]: any };
//   // avatar:
// }
// const sendEmail = async (options: MailOptions): Promise<void> => {
//   const transporter = createTransport({
//     host: process.env.SMPT_HOST, //"",
//     // service: process.env.SMPT_SERVICE, //"gmail",
//     port: process.env.SMPT_PORT, //465,
//     auth: {
//       user: process.env.SMPT_USER, //"",//this is website owner email
//       pass: process.env.SMPT_PASS, //"hkxykdsmbvtqvhnr",
//     },
//     // secure: trusted,
//   });

//   const { email, template, data, subject } = options;

//   const templatePath = path.join(__dirname, "../mails", template);

//   const html: string = await ejs.renderFile(templatePath, data); //templatePth is file name and data is (otpcode and user name)

//   const option = {
//     from: process.env.SMPT_USER, //this is website owner email
//     to: email,
//     subject,
//     html,
//     // text: text,
//   };

//   await transporter
//     .sendMail(option)
//     .then((res) => {
//       console.log("mail sent successfully");
//     })
//     .catch((err) => {
//       console.log(err.message);
//     });
// };

interface MailOptionsEjs {
  email: string;
  subject: string;
  // text: string;
  // html: any;
  template: string;
  data: { [key: string]: any };
  // avatar:
}
const sendEmailEjs = async (options: MailOptionsEjs): Promise<void> => {
  const transporter = createTransport({
    host: process.env.SMPT_HOST, //"",
    // service: process.env.SMPT_SERVICE, //"gmail",
    port: process.env.SMPT_PORT, //465,
    auth: {
      user: process.env.SMPT_USER, //"",//this is website owner email
      pass: process.env.SMPT_PASS, //"hkxykdsmbvtqvhnr",
    },
    // secure: trusted,
  });
  const { email, template, data, subject } = options;
  // const { email, subject, html } = options;

  const templatePath = path.join(__dirname, "../mails/", template);

  const html = await ejs.renderFile(templatePath, data); //templatePth is file name and data is (otpcode and user name)

  const option = {
    from: process.env.SMPT_USER, //this is website owner email
    to: email,
    subject,
    html,
    // text: text,
  };

  await transporter
    .sendMail(option)
    .then((res) => {
      console.log("mail sent successfully");
    })
    .catch((err) => {
      console.log(err.message);
    });
};

export default sendEmailEjs;
