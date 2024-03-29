import { notificationSchema } from "./notificaton.model";
import mongoose, { Schema, Model, Document } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const emailRegexPattern: RegExp =
  /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

interface User extends Document {
  name: string;
  avatar: string;
  role?: string;
  userId: string;
}

export interface INotification extends Document {
  title: string;
  message: string;
  status: string;
  section: string;
  user: User;
}

export interface Iuser extends Document {
  name: string;
  email: string;
  password: string;
  country?: string;

  isVarified: boolean;
  courses: Array<{ courseId: string }>;
  wishList: object[];
  avatar: {
    public_id: string;
    url: string;
  };
  role: string;
  ban: boolean;
  notification: object[];
  SIGN_ACCESS_TOKEN: () => string;
  SIGN_REFRESH_TOKEN: () => string;
  comparePassword: (password: string) => Promise<boolean>;
}
export const userSchema: Schema<Iuser> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (value: string) {
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
    notification: [notificationSchema],
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
  },
  { timestamps: true }
);

// hashed password before save
userSchema.pre<Iuser>("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// compare password
userSchema.methods.comparePassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};
// create access token when user login
userSchema.methods.SIGN_ACCESS_TOKEN = function () {
  return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN as string);
};
// create refresh token when user refresh the page
userSchema.methods.SIGN_REFRESH_TOKEN = function () {
  return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN as string);
};

const userModel: Model<Iuser> = mongoose.model("user", userSchema);
export default userModel;
