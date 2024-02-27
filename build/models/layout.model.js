"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.layoutsSchema = exports.ContactImageSchema = exports.ImageBannerSchema = exports.categorySchema = exports.aboutSchema = exports.privacyPolicySchema = exports.faqSchema = void 0;
const mongoose_1 = __importStar(require("mongoose"));
exports.faqSchema = new mongoose_1.Schema({
    answer: { type: String },
    question: { type: String },
});
exports.privacyPolicySchema = new mongoose_1.Schema({
    title: { type: String },
});
exports.aboutSchema = new mongoose_1.Schema({
    title: { type: String },
});
exports.categorySchema = new mongoose_1.Schema({
    title: { type: String },
});
exports.ImageBannerSchema = new mongoose_1.Schema({
    public_id: { type: String },
    url: { type: String },
});
exports.ContactImageSchema = new mongoose_1.Schema({
    public_id: { type: String },
    url: { type: String },
});
exports.layoutsSchema = new mongoose_1.Schema({
    type: { type: String },
    faq: [exports.faqSchema],
    category: [exports.categorySchema],
    privacyPolicy: [exports.privacyPolicySchema],
    about: [exports.aboutSchema],
    contactImage: exports.ContactImageSchema,
    banner: {
        image: exports.ImageBannerSchema,
        title: { type: String },
        subtitle: { type: String },
    },
});
const LayoutModel = mongoose_1.default.model("Layouts", exports.layoutsSchema);
exports.default = LayoutModel;
