import { connectDB } from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  await connectDB();
  const { id } = params;
  
  try {
    const notification = await Notification.findByIdAndUpdate(
      id, 
      { isRead: true }, 
      { new: true }
    );
    return NextResponse.json({ success: true, data: notification });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}