import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema({
  reportId: { type: String, unique: true }, // Mã báo cáo, ví dụ: RP001
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lockerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Locker' }, // Mã tủ (nếu có)
  
  title: { type: String, required: true }, // Tiêu đề báo cáo
  description: { type: String, required: true }, // VD: "Tủ không mở được", "Tủ bị hư"

  category: { // Loại báo cáo
    type: String,
    enum: ['locker_error', 'incident', 'service_feedback', 'other'],
    required: true,
  },

  priority: { // Độ ưu tiên
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium',
  },

  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed'], // Chờ xử lý, Đang xử lý, Đã xử lý
    default: 'pending' 
  },

  images: [{ type: String }], // Mảng chứa URL của các ảnh minh họa

  adminResponse: { type: String } // Quản lý trả lời
}, { timestamps: true, collection: 'reports' });

// Hook để tự động tạo reportId trước khi lưu
ReportSchema.pre("save", async function (next) {
  // Chỉ chạy nếu reportId chưa được tạo
  if (this.reportId) return next();

  const Model = this.constructor;
  const prefix = 'RP';
  // Tìm báo cáo cuối cùng để xác định số thứ tự tiếp theo
  const lastReport = await Model
    .findOne({ reportId: new RegExp(`^${prefix}`) })
    .sort({ reportId: -1 })
    .lean();

  let nextNumber = 1;
  if (lastReport) {
    const lastNumber = parseInt(lastReport.reportId.replace(prefix, ""), 10);
    nextNumber = lastNumber + 1;
  }

  // Tạo reportId mới, ví dụ: RP001, RP002
  this.reportId = `${prefix}${String(nextNumber).padStart(3, "0")}`;
  next();
});

export default mongoose.models.Report || mongoose.model('Report', ReportSchema);