import mongoose, { Schema, Document } from 'mongoose';

export interface IAsset extends Document {
  assetId: string;
  qrCode?: string;
  name: string;
  description?: string;
  category: mongoose.Types.ObjectId;
  department?: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  status: 'available' | 'allocated' | 'under_maintenance' | 'disposed' | 'lost';
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';
  location?: string;
  serialNumber?: string;
  brand?: string;
  model?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
  currentValue?: number;
  vendor?: string;
  warrantyExpiry?: Date;
  images: string[];
  tags: string[];
  healthScore: number;
  lastAuditDate?: Date;
  disposedAt?: Date;
  disposalReason?: string;
  createdBy?: mongoose.Types.ObjectId;
}

const AssetSchema = new Schema<IAsset>(
  {
    assetId: { type: String, unique: true },
    qrCode: { type: String },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    category: { type: Schema.Types.ObjectId, ref: 'AssetCategory', required: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department' },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['available', 'allocated', 'under_maintenance', 'disposed', 'lost'],
      default: 'available',
    },
    condition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor', 'damaged'],
      default: 'good',
    },
    location: { type: String },
    serialNumber: { type: String, sparse: true },
    brand: { type: String },
    model: { type: String },
    purchaseDate: { type: Date },
    purchasePrice: { type: Number },
    currentValue: { type: Number },
    vendor: { type: String },
    warrantyExpiry: { type: Date },
    images: [{ type: String }],
    tags: [{ type: String }],
    healthScore: { type: Number, default: 100, min: 0, max: 100 },
    lastAuditDate: { type: Date },
    disposedAt: { type: Date },
    disposalReason: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

AssetSchema.pre('save', async function (next) {
  if (this.isNew && !this.assetId) {
    const count = await mongoose.model('Asset').countDocuments();
    this.assetId = `AST-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

AssetSchema.index({ name: 'text', description: 'text', brand: 'text', serialNumber: 'text' });
AssetSchema.index({ status: 1, department: 1 });
AssetSchema.index({ warrantyExpiry: 1 });
AssetSchema.index({ assignedTo: 1 });

export default mongoose.model<IAsset>('Asset', AssetSchema);
