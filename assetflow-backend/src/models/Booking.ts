import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  bookingId: string;
  asset: mongoose.Types.ObjectId;
  bookedBy: mongoose.Types.ObjectId;
  department?: mongoose.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  purpose?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  rejectionReason?: string;
  notes?: string;
}

const BookingSchema = new Schema<IBooking>(
  {
    bookingId: { type: String, unique: true },
    asset: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
    bookedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department' },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    purpose: { type: String },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
      default: 'pending',
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    rejectionReason: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

BookingSchema.pre('save', async function (next) {
  if (this.isNew) {
    const count = await mongoose.model('Booking').countDocuments();
    this.bookingId = `BK-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

BookingSchema.index({ asset: 1, startTime: 1, endTime: 1 });

export default mongoose.model<IBooking>('Booking', BookingSchema);
