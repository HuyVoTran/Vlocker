import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lockerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Locker' },
  description: { type: String, required: true }, // VD: "Tủ không mở được", "Tủ bị hư"
  status: { 
    type: String, 
    enum: ['pending', 'resolved'], // Chờ xử lý, Đã xong
    default: 'pending' 
  },
  adminResponse: { type: String } // Quản lý trả lời
}, { timestamps: true });

export default mongoose.models.Report || mongoose.model('Report', ReportSchema);