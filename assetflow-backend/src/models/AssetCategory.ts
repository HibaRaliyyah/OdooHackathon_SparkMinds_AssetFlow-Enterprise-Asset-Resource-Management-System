import mongoose, { Schema, Document } from 'mongoose';

export interface IAssetCategory extends Document {
  name: string;
  code: string;
  description?: string;
  icon?: string;
  color?: string;
  depreciationRate?: number;
  maintenanceInterval?: number;
  isActive: boolean;
}

const AssetCategorySchema = new Schema<IAssetCategory>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    description: { type: String },
    icon: { type: String, default: 'Package' },
    color: { type: String, default: '#4F46E5' },
    depreciationRate: { type: Number, default: 20 },
    maintenanceInterval: { type: Number, default: 180 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IAssetCategory>('AssetCategory', AssetCategorySchema);
