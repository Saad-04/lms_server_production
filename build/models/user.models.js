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
exports.userSchema = void 0;
const notificaton_model_1 = require("./notificaton.model");
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const emailRegexPattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
exports.userSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (value) {
                return emailRegexPattern.test(value);
            },
            message: "please entered a valid email !",
        },
    },
    password: {
        type: String,
        minlength: [6, "password must be greater than 6 digits"],
        select: false,
    },
    notification: [notificaton_model_1.notificationSchema],
    country: {
        type: String,
    },
    isVarified: {
        type: Boolean,
        default: false,
    },
    ban: {
        type: Boolean,
        default: false,
        required: true,
    },
    courses: [{ courseId: String }],
    wishList: [Object],
    role: {
        type: String,
        default: "user",
    },
    avatar: {
        public_id: String,
        url: String,
    },
}, { timestamps: true });
// hashed password before save
exports.userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified("password")) {
            next();
        }
        this.password = yield bcryptjs_1.default.hash(this.password, 10);
    });
});
// compare password
exports.userSchema.methods.comparePassword = function (enteredPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcryptjs_1.default.compare(enteredPassword, this.password);
    });
};
// create access token when user login
exports.userSchema.methods.SIGN_ACCESS_TOKEN = function () {
    return jsonwebtoken_1.default.sign({ id: this._id }, process.env.ACCESS_TOKEN);
};
// create refresh token when user refresh the page
exports.userSchema.methods.SIGN_REFRESH_TOKEN = function () {
    return jsonwebtoken_1.default.sign({ id: this._id }, process.env.REFRESH_TOKEN);
};
const userModel = mongoose_1.default.model("user", exports.userSchema);
exports.default = userModel;
