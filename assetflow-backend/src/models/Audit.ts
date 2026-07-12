import mongoose, { Schema, Document } from 'mongoose';

export interface IAudit extends Document {
  auditId: string;
  title: string;
  department?: mongoose.Types.ObjectId;
  conductedBy: mongoose.Types.ObjectId;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDate?: Date;
  startedAt?: Date;
  completedAt?: Date;
  totalAssets: number;
  scannedAssets: number;
  matchedAssets: number;
  discrepancies: Array<{
    asset: mongoose.Types.ObjectId;
    issue: string;
    expectedValue?: string;
    actualValue?: string;
  }>;
  notes?: string;
}

const AuditSchema = new Schema<IAudit>(
  {
    auditId: { type: String, unique: true },
    title: { type: String, required: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department' },
    conductedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['planned', 'in_progress', 'completed', 'cancelled'], default: 'planned' },
    scheduledDate: { type: Date },
    startedAt: { type: Date },
    completedAt: { type: Date },
    totalAssets: { type: Number, default: 0 },
    scannedAssets: { type: Number, default: 0 },
    matchedAssets: { type: Number, default: 0 },
    discrepancies: [
      {
        asset: { type: Schema.Types.ObjectId, ref: 'Asset' },
        issue: { type: String },
        expectedValue: { type: String },
        actualValue: { type: String },
      },
    ],
    notes: { type: String },
  },
  { timestamps: true }
);

AuditSchema.pre('save', async function (next) {
  if (this.isNew) {
    const count = await mongoose.model('Audit').countDocuments();
    this.auditId = `AUD-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

export default mongoose.model<IAudit>('Audit', AuditSchema);
