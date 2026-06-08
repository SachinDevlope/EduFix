import { Schema, model, models, type Model, type Document, type Types } from 'mongoose';
import { ROLES, USER_STATUSES, STAFF_SPECIALIZATIONS, type Role, type UserStatus, type StaffSpecialization } from '@/lib/constants';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: Role;
  schoolId: string;
  profileImage?: string;
  phone?: string;
  status: UserStatus;
  // Staff-only fields
  specialization?: StaffSpecialization;
  activeAssignments?: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, required: true, default: 'parent', index: true },
    schoolId: { type: String, default: 'SCH-001', index: true },
    profileImage: { type: String },
    phone: { type: String },
    status: { type: String, enum: USER_STATUSES, default: 'active', index: true },
    specialization: { type: String, enum: STAFF_SPECIALIZATIONS },
    activeAssignments: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const User: Model<IUser> = (models.User as Model<IUser>) || model<IUser>('User', userSchema);
export default User;
