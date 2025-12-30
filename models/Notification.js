import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  // ID người gửi (manager) cho loại 'mailsend'
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // ID người nhận (resident) cho loại 'mailreceive' và 'notice'
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  // ID của thông báo gốc, dùng cho 'mailreceive' để liên kết với 'mailsend'
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Notification' },
  // Mảng ID của những người nhận, dùng cho 'mailsend'
  recipientIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  type: {
    type: String,
    enum: [
      'mailsend',    // Thư manager gửi đi (chỉ manager thấy)
      'mailreceive', // Thư user nhận
      'notice',      // Thông báo từ hệ thống (cảnh báo, cập nhật,...)
    ],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  link: {
    type: String,
  },
}, {
  timestamps: true, // Tự động thêm createdAt và updatedAt
});

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);