"use client"
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Send, Users, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast-context';

interface Resident {
  _id: string;
  name: string;
  email: string;
  building: string;
  block: string;
}

export default function ManagerNotificationsPage() {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [residents, setResidents] = useState<Resident[]>([]);
  const [selectedResidents, setSelectedResidents] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  // Cần API lấy danh sách user có role='resident'
  // Tạm thời dùng input ID nếu chưa có API
  const [manualId, setManualId] = useState('');

  const handleSend = async () => {
    if (!title || !message) {
      showToast('Vui lòng nhập tiêu đề và nội dung', 'warning');
      return;
    }
    
    const receivers = [...selectedResidents];
    if (manualId && !receivers.includes(manualId)) receivers.push(manualId);

    if (receivers.length === 0) {
       showToast('Vui lòng chọn người nhận', 'warning');
       return;
    }

    setSending(true);
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: session?.user?.id,
          receiverIds: receivers,
          title,
          message,
          type: 'info'
        })
      });

      const json = await res.json();
      if (json.success) {
        showToast('Gửi thông báo thành công!', 'success');
        setTitle('');
        setMessage('');
        setSelectedResidents([]);
        setManualId('');
      } else {
        showToast(json.message || 'Lỗi gửi thông báo', 'error');
      }
    } catch (error) {
      showToast('Lỗi kết nối server', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Gửi Thông Báo Cư Dân</h1>
      
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded-md"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Thông báo bảo trì..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
            <textarea 
              className="w-full p-2 border rounded-md h-32"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Nhập nội dung..."
            />
          </div>
          <Button onClick={handleSend} disabled={sending} className="w-full">
            <Send className="w-4 h-4 mr-2" />
            {sending ? 'Đang gửi...' : 'Gửi Thông Báo'}
          </Button>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Users className="w-4 h-4" /> Người nhận</h3>
          <p className="text-xs text-gray-500 mb-2">Nhập ID người nhận (nếu chưa có danh sách):</p>
          <input type="text" className="w-full p-2 border rounded mb-4" placeholder="User ID..." value={manualId} onChange={e => setManualId(e.target.value)} />
        </Card>
      </div>
    </div>
  );
}