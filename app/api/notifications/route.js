import { connectDB } from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function GET(request) {
  await connectDB();
  
  try {
    // const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    // if (!token) {
    //   return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    // }

    // const { searchParams } = new URL(request.url);
    // const userId = searchParams.get('userId');

    // let query = {};

    // if (userId) {
    //   // Security check: resident chỉ có thể lấy thông báo của mình. Manager có thể lấy của bất kỳ ai.
    //   if (token.role !== 'manager' && token.id !== userId) {
    //     return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    //   }
    //   query = { recipientId: userId };
    // } else if (token.role !== 'manager') {
    //   // Nếu không có userId, chỉ manager mới có quyền truy cập (để lấy tất cả thông báo).
    //   return NextResponse.json({ success: false, message: 'Forbidden: User ID is required for residents.' }, { status: 403 });
    // }

    // const notifications = await Notification.find(query).sort({ createdAt: -1 });
    // return NextResponse.json({ success: true, data: notifications });
  } catch (error) {
    console.error('API /api/notifications Error:', error);
    return NextResponse.json({ success: false, message: 'An error occurred while fetching notifications.' }, { status: 500 });
  }
}

export async function POST(request) {
  await connectDB();
  
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'Authentication failed' }, { status: 401 });
    }

    // Chỉ manager mới có quyền gửi thông báo
    if (token.role !== 'manager') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const { title, message, recipientIds } = await request.json();

    if (!title || !message || !Array.isArray(recipientIds) || recipientIds.length === 0) {
      return NextResponse.json({ success: false, message: 'Missing required fields: title, message, and recipientIds are required.' }, { status: 400 });
    }

    const notificationsToCreate = recipientIds.map(id => ({
      recipientId: id,
      title,
      message,
      type: 'admin_message',
      read: false,
    }));

    await Notification.insertMany(notificationsToCreate);

    return NextResponse.json({ success: true, message: 'Notifications sent successfully.' });
  } catch (error) {
    console.error('API /api/notifications POST Error:', error);
    return NextResponse.json({ success: false, message: 'An error occurred while sending notifications.' }, { status: 500 });
  }
}