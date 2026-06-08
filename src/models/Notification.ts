import { Schema, model, models, type Model, type Document, type Types } from 'mongoose';

export type NotificationType =
  | 'status_update'
  | 'assignment'
  | 'resolution'
  | 'reminder'
  | 'comment'
  | 'system';

export interface INotification extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  issueId?: Types.ObjectId | null;
  issueCode?: string | null;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['status_update', 'assignment', 'resolution', 'reminder', 'comment', 'system'],
      default: 'system',
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    issueId: { type: Schema.Types.ObjectId, ref: 'Issue', default: null },
    issueCode: { type: String, default: null },
    isRead: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const Notification: Model<INotification> =
  (models.Notification as Model<INotification>) ||
  model<INotification>('Notification', notificationSchema);
export default Notification;
