import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Package,
  Mail,
  Bell,
  Send,
  AlertTriangle,
  KeyRound,
  Lock,
  CreditCard,
} from "lucide-react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "./ui/dialog";
import { Card } from "./ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";

type NotificationType =
  | "admin_message"
  | "booking_created"
  | "locker_unlocked"
  | "locker_locked"
  | "payment_completed"
  | "booking_expired";

interface Notification {
  _id: string;
  recipientId?: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

interface Resident {
  _id: string;
  name: string;
  email: string;
}

function formatDateTime(date?: string) {
  if (!date) return "N/A";
  try {
    const d = new Date(date);
    return d.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return date;
  }
}

interface SessionUser {
  id?: string;
  role?: "resident" | "manager";
}

export default function Notifications() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");

  // Manager: send notification state
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [selectedResidents, setSelectedResidents] = useState<string[]>([]);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const role = session?.user?.role as "resident" | "manager" | undefined;
  const userId = session?.user?.id;

  useEffect(() => {
    // Chờ cho đến khi session được tải xong để xác định vai trò và ID người dùng.
    if (status === 'loading') {
      return;
    }

    if (!role || !userId) {
      // Trạng thái lỗi sẽ được xử lý ở phần render chính của component
      setLoading(false);
      return;
    }

    async function loadNotifications() {
      try {
        setLoading(true);
        setError(null);

        // The API route is smart enough to return notifications for the logged-in user (resident)
        // or all notifications (manager) based on the session token. No need to send userId.
        const res = await fetch("/api/notifications");

        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.");
          }
          throw new Error(`Lỗi tải thông báo từ máy chủ (mã lỗi: ${res.status})`);
        }

        const json = await res.json();

        if (!json.success) {
          throw new Error(
            json.message || `Lỗi tải thông báo (${res.status})`
          );
        }

        // API giờ trả về một đối tượng chứa notifications và residents (cho manager)
        if (json.data) {
          setNotifications(json.data.notifications || []);
          if (role === 'manager') {
            setResidents(json.data.residents || []);
          }
        }
      } catch (err) {
        if (err instanceof SyntaxError) {
          // This happens when the response is not valid JSON, often an HTML error page from a 401 redirect.
          setError("Lỗi xác thực hoặc API không hợp lệ. Vui lòng đăng nhập lại và thử lại.");
        } else {
          setError(err instanceof Error ? err.message : "Không thể tải thông báo.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadNotifications();
  }, [status, role, userId]);

  const handleSendNotification = async () => {
    if (!notificationTitle || !notificationMessage || selectedResidents.length === 0) {
      alert("Vui lòng nhập tiêu đề, nội dung và chọn người nhận.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: notificationTitle,
          message: notificationMessage,
          recipientIds: selectedResidents,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gửi thông báo thất bại.");
      }
      alert("Gửi thông báo thành công!");
      setIsSendDialogOpen(false);
      setNotificationTitle("");
      setNotificationMessage("");
      setSelectedResidents([]);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Đã xảy ra lỗi.");
    } finally {
      setSending(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    // Find the notification and check if it's already read
    const notification = notifications.find((n) => n._id === notificationId);
    if (!notification || notification.read) {
      return; // Do nothing if not found or already read
    }

    // Optimistic UI update: Mark as read immediately on the client
    setNotifications((prev) =>
      prev.map((n) =>
        n._id === notificationId ? { ...n, read: true } : n
      )
    );

    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: [notificationId] }),
      });

      if (!res.ok) {
        // If the API call fails, revert the change in the UI
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notificationId ? { ...n, read: false } : n
          )
        );
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      // Also revert on network error
      setNotifications((prev) => prev.map((n) => n._id === notificationId ? { ...n, read: false } : n));
    }
  };

  const filteredNotifications = useMemo(() => {
    const sorted = [...notifications].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (activeTab === "unread") {
      return sorted.filter((n) => !n.read);
    }
    return sorted;
  }, [notifications, activeTab]);

  const filteredResidents = useMemo(() => {
    if (!searchTerm) return residents;
    return residents.filter(
      (r) =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [residents, searchTerm]);

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "admin_message":
        return <Mail className="w-5 h-5 text-blue-500" />;
      case "booking_created":
        return <Package className="w-5 h-5 text-green-500" />;
      case "booking_expired":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "locker_unlocked":
        return <KeyRound className="w-5 h-5 text-purple-500" />;
      case "locker_locked":
        return <Lock className="w-5 h-5 text-gray-500" />;
      case "payment_completed":
        return <CreditCard className="w-5 h-5 text-teal-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  if (status === 'loading' || loading) {
    return <div className="p-6">Đang tải thông báo...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">Lỗi: {error}</div>;
  }

  // Sau khi tải xong, nếu session chưa được xác thực hoặc thiếu dữ liệu người dùng, hiển thị lỗi.
  if (status === 'unauthenticated') {
    return <div className="p-6 text-red-600">Lỗi: Bạn cần đăng nhập để xem thông báo.</div>;
  }

  if (!role || !userId) {
    return <div className="p-6 text-red-600">
      Lỗi: Không tìm thấy thông tin người dùng trong phiên làm việc. 
      Điều này có thể do cấu hình Next-Auth bị thiếu.
    </div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Thông báo</h2>
          <p className="text-gray-600">
            {role === "resident"
              ? "Các cập nhật mới nhất về hoạt động của bạn."
              : "Quản lý và gửi thông báo cho cư dân."}
          </p>
        </div>
        {role === "manager" && (
          <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Send className="w-4 h-4 mr-2" />
                Gửi thông báo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                <DialogTitle>Gửi thông báo mới</DialogTitle>
                <DialogDescription>
                  Soạn và gửi thông báo đến một hoặc nhiều cư dân.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Tiêu đề
                  </Label>
                  <Input
                    id="title"
                    value={notificationTitle}
                    onChange={(e) => setNotificationTitle(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="message" className="text-right">
                    Nội dung
                  </Label>
                  <Textarea
                    id="message"
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                    className="col-span-3"
                    rows={5}
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right pt-2">Người nhận</Label>
                  <div className="col-span-3 border rounded-md p-2 space-y-2">
                    <Input
                      placeholder="Tìm cư dân..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <ScrollArea className="h-40">
                      <div className="space-y-2 p-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="select-all"
                            checked={selectedResidents.length === residents.length}
                            onCheckedChange={(checked: boolean) =>
                              setSelectedResidents(
                                checked ? residents.map((r) => r._id) : []
                              )
                            }
                          />
                          <Label htmlFor="select-all" className="font-semibold">
                            Chọn tất cả
                          </Label>
                        </div>
                        {filteredResidents.map((resident) => (
                          <div
                            key={resident._id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={resident._id}
                              checked={selectedResidents.includes(resident._id)}
                              onCheckedChange={(checked: boolean) => {
                                setSelectedResidents((prev) =>
                                  checked
                                    ? [...prev, resident._id]
                                    : prev.filter((id) => id !== resident._id)
                                );
                              }}
                            />
                            <Label
                              htmlFor={resident._id}
                              className="font-normal flex flex-col"
                            >
                              <span>{resident.name}</span>
                              <span className="text-xs text-gray-500">
                                {resident.email}
                              </span>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsSendDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button onClick={handleSendNotification} disabled={sending}>
                  {sending ? "Đang gửi..." : "Gửi"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={(v: string) => setActiveTab(v as "all" | "unread")}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="unread">Chưa đọc</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            {filteredNotifications.length === 0 ? (
              <div className="p-10 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Không có thông báo nào.</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredNotifications.map((n) => (
                  <div
                    key={n._id}
                    className={`flex items-start gap-4 p-4 transition-colors ${
                      !n.read ? "bg-blue-50 hover:bg-blue-100 cursor-pointer" : "hover:bg-gray-50"
                    }`}
                    onClick={() => handleMarkAsRead(n._id)}
                  >
                    {!n.read && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                    )}
                    <div
                      className={`flex-shrink-0 ${n.read ? "ml-4" : ""}`}
                    >
                      {getNotificationIcon(n.type)}
                    </div>
                    <div className="flex-grow">
                      <p className="font-semibold text-gray-900">{n.title}</p>
                      <p className="text-sm text-gray-600">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDateTime(n.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
