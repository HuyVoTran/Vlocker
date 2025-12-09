import mongoose from 'mongoose';

const LockerSchema = new mongoose.Schema({
  lockerId: { type: String, required: true, unique: true },

  //Tòa A - Block 1 - [Default: Tầng 1]
  building: {
    type: String,
    required: true,
  },

  block: {
    type: String,
    required: true,
  },

  //Trạng thái tủ
  status: { 
    type: String, 
    enum: ['available', 'booked', 'maintenance'], // Trống, Đang đặt, Bảo trì
    default: 'available' 
  },

  //Trạng thái khóa
  isLocked: { type: Boolean, default: true }, // Trạng thái vật lý: Đang khóa hay mở
  currentBookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' } // Link nhanh đến đơn hàng hiện tại
}, { timestamps: true });

//Hook lockerId Locker
LockerSchema.pre("save", async function (next) {
  if (this.lockerId) return next();

  const prefix = `${this.building}${this.block}-`;

  const lastLocker = await mongoose.models.Locker
    .findOne({ lockerId: new RegExp(`^${prefix}`) })
    .sort({ lockerId: -1 })
    .lean();

  let nextNumber = 1;

  if (lastLocker) {
    const lastNumber = parseInt(lastLocker.lockerId.replace(prefix, ""), 10);
    nextNumber = lastNumber + 1;
  }

  this.lockerId = `${prefix}${String(nextNumber).padStart(3, "0")}`;

  next();
});

export default mongoose.models.Locker || mongoose.model('Locker', LockerSchema);