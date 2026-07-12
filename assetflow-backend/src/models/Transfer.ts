import mongoose, { Schema, Document } from 'mongoose';

export interface ITransfer extends Document {
  transferId: string;
  asset: mongoose.Types.ObjectId;
  fromDepartment?: mongoose.Types.ObjectId;
  toDepartment?: mongoose.Types.ObjectId;
  fromUser?: mongoose.Types.ObjectId;
  toUser?: mongoose.Types.ObjectId;
  requestedBy: mongoose.Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  reason?: string;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  completedAt?: Date;
  notes?: string;
}

const TransferSchema = new Schema<ITransfer>(
  {
    transferId: { type: String, unique: true },
    asset: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
    fromDepartment: { type: Schema.Types.ObjectId, ref: 'Department' },
    toDepartment: { type: Schema.Types.ObjectId, ref: 'Department' },
    fromUser: { type: Schema.Types.ObjectId, ref: 'User' },
    toUser: { type: Schema.Types.ObjectId, ref: 'User' },
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'completed'], default: 'pending' },
    reason: { type: String },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    completedAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

TransferSchema.pre('save', async function (next) {
  if (this.isNew) {
    const count = await mongoose.model('Transfer').countDocuments();
    this.transferId = `TRF-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

export default mongoose.model<ITransfer>('Transfer', TransferSchema);
