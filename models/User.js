import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  //Thông tin chính của user
  username: { type: String }, 
  
  name: {
    type: String,
    required: [true, 'Vui lòng nhập họ và tên đầy đủ'],
  },

  phone: {
    type: Number,
    required: [true, 'Vui lòng nhập số điện thoại'], 
  },

  email: {
    type: String,
    required: [true, 'Vui lòng nhập email'],
    unique: true,
  },
  
  password: {
    type: String,
    required: false, 
  },

  //Thông tin địa chỉ cụ thể
  //Tòa A - Block 1 - Tầng 2 - Phòng 3
  building: {
    type: String,
    required: [true, 'Vui lòng nhập tòa nhà'],
  },

  block: {
    type: String,
    required: [true, 'Vui lòng nhập block'],
  },

  floor: {
    type: String,
    required: [true, 'Vui lòng nhập tầng'],
  },

  unit: {
    type: String,
    required: [true, 'Vui lòng nhập số nhà'],
  },
  
  //Vai trò - Dân cư - Quản lý
  role: {
    type: String,
    enum: ['resident', 'manager'],
    default: 'resident',
  },

  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
}, { timestamps: true });

// Cách export chuẩn trong Next.js (ngăn tạo lại model khi hot reload)
export default mongoose.models.User || mongoose.model('User', UserSchema);