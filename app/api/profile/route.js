import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Booking from "@/models/Booking"; // Giả định bạn có model Booking
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from "bcryptjs";

/**
 * GET: Lấy thông tin profile, thống kê và hoạt động gần đây của người dùng.
 */
export async function GET() {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ success: false, message: "Không có quyền truy cập" }, { status: 401 });
        }

        const userId = session.user.id;

        // Lấy thông tin chi tiết của người dùng, loại bỏ mật khẩu
        const userProfile = await User.findById(userId).select('-password').lean();

        if (!userProfile) {
            return NextResponse.json({ success: false, message: "Không tìm thấy người dùng" }, { status: 404 });
        }

        // Lấy thống kê (ví dụ: số lượng đơn đặt tủ)
        const totalBookings = await Booking.countDocuments({ userId: userId });
        const activeBookings = await Booking.countDocuments({ userId: userId, status: { $in: ['active', 'stored'] } });

        // Lấy các hoạt động gần đây (5 đơn đặt tủ cuối cùng)
        const recentActivities = await Booking.find({ userId: userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('lockerId', 'lockerId') // Giả định `lockerId` là một tham chiếu đến model Locker
            .lean();

        return NextResponse.json({
            success: true,
            data: {
                profile: userProfile,
                stats: { totalBookings, activeBookings },
                activities: recentActivities,
            }
        });

    } catch (error) {
        console.error("Lỗi tại GET /api/profile:", error);
        return NextResponse.json({ success: false, message: "Lỗi máy chủ" }, { status: 500 });
    }
}

/**
 * PATCH: Cập nhật thông tin profile của người dùng.
 */
export async function PATCH(req) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ success: false, message: "Không có quyền truy cập" }, { status: 401 });
        }

        const userId = session.user.id;
        const body = await req.json();
        const { name, phone, address, currentPassword, newPassword } = body;

        const userToUpdate = await User.findById(userId);

        if (!userToUpdate) {
            return NextResponse.json({ success: false, message: "Không tìm thấy người dùng" }, { status: 404 });
        }

        // Cập nhật thông tin cơ bản
        if (name) {
            const nameRegex = /^[a-zA-Zàáâãèéêìíòóôõùúăđĩũơưăạảấầẩẫậắằẳẵặẹẻẽềềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ\s]+$/;
            if (!nameRegex.test(name)) {
                return NextResponse.json({ success: false, message: "Tên không hợp lệ." }, { status: 400 });
            }
            userToUpdate.name = name;
        }
        if (phone) {
            // Cho phép số, khoảng trắng và một số ký tự phổ biến trong SĐT
            const phoneRegex = /^[0-9\s+()-]+$/;
            if (!phoneRegex.test(phone)) {
                return NextResponse.json({ success: false, message: "Số điện thoại không hợp lệ." }, { status: 400 });
            }
            userToUpdate.phone = phone;
        }

        // Cập nhật mật khẩu nếu được cung cấp
        if (newPassword) {
            // Validate new password length
            if (newPassword.length < 8 || newPassword.length > 30) {
                return NextResponse.json({ success: false, message: "Mật khẩu mới phải có từ 8 đến 30 ký tự" }, { status: 400 });
            }

            // If user already has a password (not a Google-only account), require current password
            if (userToUpdate.password) {
                if (!currentPassword) {
                    return NextResponse.json({ success: false, message: "Vui lòng nhập mật khẩu hiện tại" }, { status: 400 });
                }
                const passwordsMatch = await bcrypt.compare(currentPassword, userToUpdate.password);
                if (!passwordsMatch) {
                    return NextResponse.json({ success: false, message: "Mật khẩu hiện tại không đúng" }, { status: 400 });
                }
            }
            userToUpdate.password = await bcrypt.hash(newPassword, 10);
        }

        await userToUpdate.save();

        const updatedUser = userToUpdate.toObject();
        delete updatedUser.password;

        return NextResponse.json({ success: true, message: "Cập nhật thông tin thành công", data: updatedUser });

    } catch (error) {
        console.error("Lỗi tại PATCH /api/profile:", error);
        return NextResponse.json({ success: false, message: "Lỗi máy chủ" }, { status: 500 });
    }
}