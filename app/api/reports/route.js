import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Report from "@/models/Report";
import Locker from "@/models/Locker";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * GET: Lấy danh sách báo cáo dựa trên vai trò người dùng.
 */
export async function GET() {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ success: false, message: "Không có quyền truy cập" }, { status: 401 });
        }

        const { id, role } = session.user;
        let reports;

        if (role === 'manager') {
            // Manager lấy tất cả báo cáo, populate thông tin người gửi
            reports = await Report.find({})
                .populate('userId', 'name email')
                .sort({ createdAt: -1 })
                .lean();
        } else {
            // Resident chỉ lấy báo cáo của mình
            reports = await Report.find({ userId: id })
                .sort({ createdAt: -1 })
                .lean();
        }

        return NextResponse.json({ success: true, data: reports });

    } catch (error) {
        console.error("Lỗi tại GET /api/reports:", error);
        return NextResponse.json({ success: false, message: "Lỗi máy chủ" }, { status: 500 });
    }
}

/**
 * POST: Tạo báo cáo mới (cho Resident).
 */
export async function POST(req) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ success: false, message: "Không có quyền truy cập" }, { status: 401 });
        }

        const body = await req.json();
        const { title, description, category, lockerId, priority } = body;

        if (!title || !description || !category) {
            return NextResponse.json({ success: false, message: "Vui lòng điền đầy đủ các trường bắt buộc." }, { status: 400 });
        }

        let lockerObjectId = null;
        // Nếu người dùng cung cấp mã tủ (ví dụ: "L001"), tìm _id tương ứng.
        if (lockerId) {
            const locker = await Locker.findOne({ lockerId: lockerId.trim() });
            if (locker) {
                lockerObjectId = locker._id;
            }
        }

        const newReport = new Report({
            userId: session.user.id,
            title,
            description,
            category,
            lockerId: lockerObjectId, // Lưu ObjectId của tủ, không phải chuỗi string
            priority: priority || 'medium'
        });

        await newReport.save();

        return NextResponse.json({ success: true, message: "Gửi báo cáo thành công!", data: newReport });

    } catch (error) {
        console.error("Lỗi tại POST /api/reports:", error);
        return NextResponse.json({ success: false, message: "Lỗi máy chủ" }, { status: 500 });
    }
}

/**
 * PATCH: Cập nhật trạng thái báo cáo (cho Manager).
 */
export async function PATCH(req) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'manager') {
            return NextResponse.json({ success: false, message: "Không có quyền thực hiện hành động này" }, { status: 403 });
        }

        const { reportId, status } = await req.json();

        if (!reportId || !status) {
            return NextResponse.json({ success: false, message: "Thiếu thông tin cần thiết." }, { status: 400 });
        }

        const updatedReport = await Report.findByIdAndUpdate(
            reportId,
            { status },
            { new: true } // Trả về document đã được cập nhật
        );

        if (!updatedReport) {
            return NextResponse.json({ success: false, message: "Không tìm thấy báo cáo." }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Cập nhật trạng thái thành công", data: updatedReport });

    } catch (error) {
        console.error("Lỗi tại PATCH /api/reports:", error);
        return NextResponse.json({ success: false, message: "Lỗi máy chủ" }, { status: 500 });
    }
}