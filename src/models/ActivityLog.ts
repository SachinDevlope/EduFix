import { Schema, model, models, type Model, type Document, type Types } from 'mongoose';
import { ACTIVITY_ACTIONS, type ActivityAction } from '@/lib/constants';

export interface IActivityLog extends Document {
  _id: Types.ObjectId;
  issueId: Types.ObjectId;
  issueCode: string;
  action: ActivityAction;
  message: string;
  performedBy: Types.ObjectId;
  performedByName: string;
  meta?: Record<string, unknown>;
  createdAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    issueId: { type: Schema.Types.ObjectId, ref: 'Issue', required: true, index: true },
    issueCode: { type: String, required: true },
    action: { type: String, enum: ACTIVITY_ACTIONS, required: true },
    message: { type: String, required: true },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    performedByName: { type: String, required: true },
    meta: { type: Schema.Types.Mixed },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const ActivityLog: Model<IActivityLog> =
  (models.ActivityLog as Model<IActivityLog>) ||
  model<IActivityLog>('ActivityLog', activityLogSchema);
export default ActivityLog;
