// app/api/test-db/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb'; // Import hàm kết nối Mongoose đã tối ưu
import TestModel from '@/models/TestModel'; // Giả sử bạn có file Model này

// Route Handler cho GET request tại đường dẫn /api/test-db
export async function GET(request) { // Xóa type ': Request'
  try {
    // 1. Thực hiện kết nối Mongoose
    await connectDB();
    
    // 2. Thực hiện một truy vấn hoặc tạo bản ghi test
    // LƯU Ý: Đảm bảo Model này tồn tại và được định nghĩa bằng JS
    const newTest = await TestModel.create({ 
        name: "Test API Connect",
        timestamp: new Date()
    });

    // 3. Trả về phản hồi thành công
    return NextResponse.json({ 
        success: true,
        message: "Kết nối Mongoose thành công và tạo bản ghi test!", 
        data: newTest 
    }, { status: 200 });
  } catch (error) {
    console.error("LỖI KẾT NỐI DB:", error);
    // 4. Trả về lỗi server 500
    return NextResponse.json(
      { success: false, message: "Kết nối database thất bại!", error: error.message },
      { status: 500 }
    );
  }
}