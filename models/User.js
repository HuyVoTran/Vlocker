import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  //Thông tin chính của user
  username: { type: String }, 
  
  name: {
    type: String,
    required: [true, 'Vui lòng nhập họ và tên đầy đủ'],
  },

  phone: {
    type: String,
    // Trường này là bắt buộc, nhưng không phải lúc đăng ký qua Google
    required: function() {
      return this.isProfileComplete;
    },
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

  image: {
    type: String,
  },

  isProfileComplete: {
    type: Boolean,
    default: false,
  },

  //Thông tin địa chỉ cụ thể
  //Tòa A - Block 1 - Tầng 2 - Phòng 3
  building: {
    type: String,
    required: function() {
      return this.isProfileComplete;
    },
  },

  block: {
    type: String,
    required: function() {
      return this.isProfileComplete;
    },
  },

  floor: {
    type: String,
    required: function() {
      return this.isProfileComplete;
    },
  },

  unit: {
    type: String,
    required: function() {
      return this.isProfileComplete;
    },
  },
  
  //Vai trò - Dân cư - Quản lý
  role: {
    type: String,
    enum: ['resident', 'manager'],
    default: 'resident',
  },

  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
}, { timestamps: true, collection: 'users' });

// Cách export chuẩn trong Next.js (ngăn tạo lại model khi hot reload)
export default mongoose.models.User || mongoose.model('User', UserSchema);