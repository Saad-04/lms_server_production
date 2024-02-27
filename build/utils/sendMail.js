"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = require("nodemailer");
const path_1 = __importDefault(require("path"));
const ejs_1 = __importDefault(require("ejs"));
require("dotenv").config();
const sendEmailEjs = (options) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = (0, nodemailer_1.createTransport)({
        host: process.env.SMPT_HOST,
        // service: process.env.SMPT_SERVICE, //"gmail",
        port: process.env.SMPT_PORT,
        auth: {
            user: process.env.SMPT_USER,
            pass: process.env.SMPT_PASS, //"hkxykdsmbvtqvhnr",
        },
        // secure: trusted,
    });
    const { email, template, data, subject } = options;
    // const { email, subject, html } = options;
    const templatePath = path_1.default.join(__dirname, "../mails/", template);
    const html = yield ejs_1.default.renderFile(templatePath, data); //templatePth is file name and data is (otpcode and user name)
    const option = {
        from: process.env.SMPT_USER,
        to: email,
        subject,
        html,
        // text: text,
    };
    yield transporter
        .sendMail(option)
        .then((res) => {
        console.log("mail sent successfully");
    })
        .catch((err) => {
        console.log(err.message);
    });
});
exports.default = sendEmailEjs;
