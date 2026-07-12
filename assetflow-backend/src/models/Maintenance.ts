import mongoose, { Schema, Document } from 'mongoose';

export interface IMaintenance extends Document {
  maintenanceId: string;
  asset: mongoose.Types.ObjectId;
  reportedBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  type: 'corrective' | 'preventive' | 'inspection';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
  description: string;
  diagnosis?: string;
  resolution?: string;
  estimatedCost?: number;
  actualCost?: number;
  images: string[];
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  nextMaintenanceDate?: Date;
}

const MaintenanceSchema = new Schema<IMaintenance>(
  {
    maintenanceId: { type: String, unique: true },
    asset: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['corrective', 'preventive', 'inspection'], default: 'corrective' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    description: { type: String, required: true },
    diagnosis: { type: String },
    resolution: { type: String },
    estimatedCost: { type: Number },
    actualCost: { type: Number },
    images: [{ type: String }],
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    startedAt: { type: Date },
    completedAt: { type: Date },
    nextMaintenanceDate: { type: Date },
  },
  { timestamps: true }
);

MaintenanceSchema.pre('save', async function (next) {
  if (this.isNew) {
    const count = await mongoose.model('Maintenance').countDocuments();
    this.maintenanceId = `MNT-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

export default mongoose.model<IMaintenance>('Maintenance', MaintenanceSchema);
