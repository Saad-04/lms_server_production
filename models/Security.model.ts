import { Iuser } from "./user.models";
import mongoose, { Schema, Model, Document } from "mongoose";

// reporter: {
//     reporterDatail: reporter,
//     reporterMessage,
//     reportedOnComment: question.comment,
//     reportedOnUser: question.user,
//   },

export interface Report extends Document {
  reporterMessage: string;
  reportedOnComment: string;
  reporterDetail: Iuser;
  reportedOnUser: Iuser;
}

export const reportSchema: Schema<Report> = new mongoose.Schema(
  {
    reporterMessage: {
      type: String,
      required: true,
    },
    reportedOnComment: {
      type: String,
      required: true,
    },
    reporterDetail: {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      isVarified: {
        type: Boolean,
      },
      courses: [Object],
      role: {
        type: String,
        required: true,
      },
      avatar: {
        public_id: String,
        url: String,
      },
    },
    reportedOnUser: {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      isVarified: {
        type: Boolean,
      },
      courses: [Object],
      role: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      avatar: {
        public_id: String,
        url: String,
      },
    },
  },
  { timestamps: true }
);
