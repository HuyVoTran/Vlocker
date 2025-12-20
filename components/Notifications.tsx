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

export default function Notifications() {
  // =================================================================
  // Phần State (Trạng thái) của Component
  // =================================================================

  // State chính
  const { data: session, status } = useSession(); // Lấy session từ NextAuth
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");

  // State dành cho chức năng gửi thông báo của Manager
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [selectedResidents, setSelectedResidents] = useState<string[]>([]);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Lấy thông tin người dùng từ session một cách an toàn
  const role = session?.user?.role;
  const userId = session?.user?.id;

  // =================================================================
  // Phần Effects (Xử lý Tác vụ Phụ)
  // =================================================================

  // useEffect chính để tải dữ liệu thông báo khi component được render hoặc session thay đổi
  useEffect(() => {
    // Chờ cho đến khi session được tải xong để có thông tin người dùng.
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

        // API đã được thiết kế để tự nhận diện vai trò người dùng qua session token.
        // Manager sẽ nhận tất cả thông báo, resident chỉ nhận thông báo của mình.
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

        // API trả về một đối tượng chứa `notifications` và `residents` (nếu là manager)
        if (json.data) {
          setNotifications(json.data.notifications || []);
          if (role === 'manager') {
            setResidents(json.data.residents || []);
          }
        }
      } catch (err) {
        if (err instanceof SyntaxError) {
          // Lỗi này xảy ra khi phản hồi không phải là JSON hợp lệ (thường là trang lỗi HTML do chuyển hướng).
          setError("Lỗi xác thực hoặc API không hợp lệ. Vui lòng đăng nhập lại và thử lại.");
        } else {
          // Xử lý trường hợp `err` không phải là một đối tượng Error
          setError(err instanceof Error ? err.message : "Đã xảy ra một lỗi không xác định.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadNotifications();
  }, [status, role, userId]);

  // =================================================================
  // Phần Handlers (Hàm Xử lý Sự kiện)
  // =================================================================

  /**
   * Xử lý việc gửi thông báo từ manager đến các cư dân đã chọn.
   * Gợi ý: Có thể thay thế `alert` bằng một thư viện thông báo (toast) để đẹp hơn.
   */
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

  /**
   * Đánh dấu một thông báo là đã đọc khi người dùng nhấp vào.
   * Sử dụng kỹ thuật "Optimistic UI Update" để cải thiện trải nghiệm người dùng.
   * @param notificationId - ID của thông báo cần đánh dấu.
   */
  const handleMarkAsRead = async (notificationId: string) => {
    // Tìm thông báo và kiểm tra xem nó đã được đọc chưa.
    const notification = notifications.find((n) => n._id === notificationId);
    if (!notification || notification.read) {
      return; // Không làm gì nếu không tìm thấy hoặc đã đọc.
    }

    // Cập nhật giao diện ngay lập tức, giả định rằng yêu cầu API sẽ thành công.
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
        // Nếu API thất bại, khôi phục lại trạng thái giao diện về như cũ.
        console.error("API Error: Không thể đánh dấu đã đọc.");
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notificationId ? { ...n, read: false } : n
          )
        );
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      // Khôi phục lại trạng thái nếu có lỗi mạng.
      setNotifications((prev) => prev.map((n) => n._id === notificationId ? { ...n, read: false } : n));
    }
  };

  // =================================================================
  // Phần Memoization (Tối ưu hóa Render)
  // =================================================================

  /**
   * Lọc và sắp xếp danh sách thông báo dựa trên tab đang hoạt động ('all' hoặc 'unread').
   * `useMemo` giúp tránh việc tính toán lại không cần thiết mỗi khi component re-render.
   */
  const filteredNotifications = useMemo(() => {
    const sorted = [...notifications].sort(
      // Sắp xếp thông báo mới nhất lên đầu
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (activeTab === "unread") {
      return sorted.filter((n) => !n.read);
    }
    return sorted;
  }, [notifications, activeTab]);

  /**
   * Lọc danh sách cư dân dựa trên từ khóa tìm kiếm.
   */
  const filteredResidents = useMemo(() => {
    if (!searchTerm) return residents;
    return residents.filter(
      (r) =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [residents, searchTerm]);

  // =================================================================
  // Phần Render Logic (Hàm và Giao diện)
  // =================================================================

  /**
   * Trả về icon tương ứng với từng loại thông báo.
   * @param type - Loại thông báo.
   * @returns JSX.Element
   */
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

  // Xử lý các trạng thái tải dữ liệu và lỗi
  if (status === 'loading' || loading) {
    return <div className="p-6">Đang tải thông báo...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600 font-medium">Lỗi: {error}</div>;
  }

  // Sau khi tải xong, nếu session không hợp lệ hoặc thiếu dữ liệu, hiển thị lỗi.
  if (status === 'unauthenticated') {
    return <div className="p-6 text-red-600 font-medium">Lỗi: Bạn cần đăng nhập để xem thông báo.</div>;
  }

  if (!role || !userId) {
    return <div className="p-6 text-red-600 font-medium">
      Lỗi: Không tìm thấy thông tin người dùng trong phiên làm việc.
      <br />
      Vui lòng kiểm tra lại cấu hình `callbacks` trong file `app/api/auth/[...nextauth]/route.js`.
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
