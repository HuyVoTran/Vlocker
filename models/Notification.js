import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: [
      "admin_message",
      "booking_created",
      "locker_unlocked",
      "locker_locked",
      "payment_completed",
      "booking_expired"
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