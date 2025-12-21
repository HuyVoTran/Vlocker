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
    enum: ['pending', 'processing', 'completed', 'cancelled'], // Chờ xử lý, Đang xử lý, Đã xử lý, Đã hủy
    default: 'pending' 
  },

  images: [{ type: String }], // Mảng chứa URL của các ảnh minh họa

  adminResponse: { type: String } // Quản lý trả lời
}, { timestamps: true, collection: 'reports' });

// Hook để tự động tạo reportId trước khi lưu
ReportSchema.pre("save", async function () {
  // Chỉ chạy khi tạo mới và reportId chưa được gán
  if (this.isNew && !this.reportId) {
    const Model = this.constructor;
    const prefix = 'RP';

    // Tìm báo cáo cuối cùng của tháng hiện tại để xác định số thứ tự tiếp theo
    const lastReport = await Model.findOne({
      reportId: { $regex: `^${prefix}` },
    }).sort({ reportId: -1 });

    let nextNumber = 1;
    if (lastReport && lastReport.reportId) {
      try {
        const lastNumber = parseInt(lastReport.reportId.replace(prefix, ''), 10);
        if (!isNaN(lastNumber)) {
          nextNumber = lastNumber + 1;
        }
      } catch (e) {
        console.error('Không thể phân tích số thứ tự từ reportId:', lastReport.reportId , e);
        // Bỏ qua và sử dụng số thứ tự 1 nếu có lỗi
      }
    }
    
    // Tạo reportId mới, ví dụ: RP0001, RP0002
    this.reportId = `${prefix}${String(nextNumber).padStart(4, '0')}`;
  }
});

export default mongoose.models.Report || mongoose.model('Report', ReportSchema);