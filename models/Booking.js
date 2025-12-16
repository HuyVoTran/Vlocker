import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lockerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Locker', required: true },
  
  // Thời gian
  startTime: { type: Date, default: Date.now }, // Lúc bấm "Đăng ký"
  endTime: { type: Date }, // Lúc thanh toán xong và lấy đồ
  pickupExpiryTime: { type: Date }, // Thời gian hết hạn để lấy đồ (30 phút sau khi thanh toán)
  
  // Trạng thái quy trình
  status: { 
    type: String, 
    enum: [
      'active',    // Mới đăng ký, shipper chưa bỏ đồ (có thể mở ra mở vô)
      'stored',    // Đã xác nhận shipper bỏ đồ xong -> KHÓA CỨNG (tính tiền)
      'completed', // Đã thanh toán và kết thúc
      'cancelled'  // Hủy đăng ký
    ], 
    default: 'active' 
  },

  // Thanh toán
  cost: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' }

}, { timestamps: true, collection: 'bookings' });

export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema);