import { Schema, model, models, type Model, type Document, type Types } from 'mongoose';
import {
  ISSUE_CATEGORIES,
  ISSUE_PRIORITIES,
  ISSUE_STATUSES,
  type IssueCategory,
  type IssuePriority,
  type IssueStatus,
} from '@/lib/constants';

export interface IMedia {
  url: string;
  type: 'image' | 'video';
  publicId?: string;
  filename?: string;
}

export interface IComment {
  _id?: Types.ObjectId;
  text: string;
  authorId: Types.ObjectId;
  authorName: string;
  createdAt: Date;
}

export interface IIssue extends Document {
  _id: Types.ObjectId;
  issueCode: string; // human-friendly id e.g. ISS-2026-0001
  title: string;
  description: string;
  category: IssueCategory;
  building: string;
  floor: string;
  roomNumber: string;
  priority: IssuePriority;
  status: IssueStatus;
  media: IMedia[];
  reportedBy: Types.ObjectId;
  reportedByName: string;
  assignedStaff?: Types.ObjectId | null;
  assignedStaffName?: string | null;
  estimatedResolutionDate?: Date | null;
  resolvedAt?: Date | null;
  resolutionNotes?: string;
  comments: IComment[];
  schoolId: string;
  createdAt: Date;
  updatedAt: Date;
}

const mediaSchema = new Schema<IMedia>(
  {
    url: { type: String, required: true },
    type: { type: String, enum: ['image', 'video'], required: true },
    publicId: String,
    filename: String,
  },
  { _id: false },
);

const commentSchema = new Schema<IComment>(
  {
    text: { type: String, required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const issueSchema = new Schema<IIssue>(
  {
    issueCode: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, required: true, maxlength: 4000 },
    category: { type: String, enum: ISSUE_CATEGORIES, required: true, index: true },
    building: { type: String, required: true },
    floor: { type: String, required: true },
    roomNumber: { type: String, required: true },
    priority: { type: String, enum: ISSUE_PRIORITIES, default: 'Medium', index: true },
    status: { type: String, enum: ISSUE_STATUSES, default: 'Pending', index: true },
    media: { type: [mediaSchema], default: [] },
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reportedByName: { type: String, required: true },
    assignedStaff: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    assignedStaffName: { type: String, default: null },
    estimatedResolutionDate: { type: Date, default: null },
    resolvedAt: { type: Date, default: null },
    resolutionNotes: { type: String, default: '' },
    comments: { type: [commentSchema], default: [] },
    schoolId: { type: String, default: 'SCH-001', index: true },
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

issueSchema.index({ title: 'text', description: 'text', issueCode: 'text' });

export const Issue: Model<IIssue> =
  (models.Issue as Model<IIssue>) || model<IIssue>('Issue', issueSchema);
export default Issue;
