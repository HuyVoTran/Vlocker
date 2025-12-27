import mongoose from 'mongoose';

const LockerSchema = new mongoose.Schema({
  lockerId: {
    type: String,
    unique: true,
    trim: true,
    uppercase: true,
  },
  building: {
    type: String,
    required: true,
  },
  block: {
    type: String,
    required: true,
  },
  floor: {
    type: String,
    default: '1',
  },
  size: {
    type: String,
    enum: ['S', 'M', 'L', 'XL'],
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['available', 'booked', 'maintenance', 'locked'],
    default: 'available',
  },
  isLocked: {
    type: Boolean,
    default: false,
  },
  currentBookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null,
  },
}, { timestamps: true, collection: 'lockers' });

// Add a compound index for filtering
LockerSchema.index({ building: 1, block: 1, status: 1 });

LockerSchema.pre('validate', async function() {
    if (this.isNew && !this.lockerId) {
        try {
            const prefix = `${this.building}${this.block}-`;
            const existingLockers = await this.constructor.find({
                lockerId: new RegExp(`^${prefix}`, 'i')
            }).lean();
 
            let maxNumber = 0;
            if (existingLockers.length > 0) {
                for (const locker of existingLockers) {
                    const numStr = locker.lockerId.split('-').pop();
                    if (numStr) {
                        const num = parseInt(numStr, 10);
                        if (!isNaN(num) && num > maxNumber) {
                            maxNumber = num;
                        }
                    }
                }
            }
 
            const nextNumber = maxNumber + 1;
            this.lockerId = `${prefix}${String(nextNumber).padStart(2, '0')}`;
        } catch (error) {
            // Với async pre hook, chúng ta `throw` lỗi để Mongoose xử lý, không gọi next(error)
            throw error;
        }
    }
});

export default mongoose.models.Locker || mongoose.model('Locker', LockerSchema);