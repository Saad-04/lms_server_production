"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const error_1 = require("./middleware/error");
const user_routs_1 = __importDefault(require("./routes/user.routs"));
const course_routs_1 = __importDefault(require("./routes/course.routs"));
const order_routs_1 = __importDefault(require("./routes/order.routs"));
const notification_routs_1 = __importDefault(require("./routes/notification.routs"));
const analytics_routs_1 = __importDefault(require("./routes/analytics.routs"));
const layouts_routs_1 = __importDefault(require("./routes/layouts.routs"));
const company_rout_1 = __importDefault(require("./routes/company.rout"));
exports.app = (0, express_1.default)();
require("dotenv").config();
// body-parser
exports.app.use(express_1.default.json({ limit: "50mb" }));
// cookie-parser
exports.app.use((0, cookie_parser_1.default)());
// add-cors
exports.app.use((0, cors_1.default)({
    origin: "http://localhost:3000",
    credentials: true,
}));
// userRouter;
exports.app.use("/api/v1", user_routs_1.default, course_routs_1.default, order_routs_1.default, company_rout_1.default, notification_routs_1.default, analytics_routs_1.default, layouts_routs_1.default);
// rout for not found routs
exports.app.all("*", (req, res, next) => {
    const err = new Error(`your page ${req.originalUrl} was not found !`);
    err.statusCode - 404;
    next(err);
});
exports.app.use(error_1.errorMiddleWare);
