import mongoose, { Document, Model, Schema } from "mongoose";

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

export const notificationSchema = new Schema<INotification>(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "unread",
    },
    section: {
      type: String,
      required: true,
    },
    user: {
      userId: {
        type: String,
      },
      name: {
        type: String,
      },
      role: {
        type: String,
      },
      avatar: {
        type: String,
      },
    },
  },
  { timestamps: true }
);

const NotificationModel: Model<INotification> = mongoose.model(
  "Notification",
  notificationSchema
);

export default NotificationModel;
