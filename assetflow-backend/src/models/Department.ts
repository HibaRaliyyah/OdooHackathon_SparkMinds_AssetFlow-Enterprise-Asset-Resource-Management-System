import mongoose, { Schema, Document } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  code: string;
  description?: string;
  manager?: mongoose.Types.ObjectId;
  budget?: number;
  location?: string;
  isActive: boolean;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String },
    manager: { type: Schema.Types.ObjectId, ref: 'User' },
    budget: { type: Number, default: 0 },
    location: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

export default mongoose.model<IDepartment>('Department', DepartmentSchema);
