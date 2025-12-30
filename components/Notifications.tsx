import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Package,
  Mail,
  Bell,
  Send,
  AlertTriangle,
  KeyRound,
  Trash2,
  BookOpen,
  Book,
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
import { useToast } from "./ui/toast-context";

type NotificationType =
  | 'mailsend'    // Thư manager gửi đi
  | 'mailreceive' // Thư user nhận
  | 'notice';     // Thông báo từ hệ thống

interface Notification {
  _id: string;
  recipientId?: string; // For mailreceive, notice
  senderInfo?: { // For mailreceive, from manager
    name: string;
  };
  recipientsInfo?: { // For mailsend, to residents
    name: string;
    email: string;
  }[];
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

  // State cho việc chọn nhiều thông báo
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // State cho việc xem chi tiết thông báo trong Dialog
  const [viewingNotification, setViewingNotification] = useState<Notification | null>(null);

  const { showToast } = useToast();
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

  // Xóa lựa chọn khi chuyển tab
  useEffect(() => {
    setSelectedNotifications([]);
  }, [activeTab]);

  // =================================================================
  // Phần Handlers (Hàm Xử lý Sự kiện)
  // =================================================================

  /**
   * Xử lý việc gửi thông báo từ manager đến các cư dân đã chọn.
   * Gợi ý: Có thể thay thế `alert` bằng một thư viện thông báo (toast) để đẹp hơn.
   */
  const handleSendNotification = async () => {
    if (!notificationTitle || !notificationMessage || selectedResidents.length === 0) {
      showToast("Vui lòng nhập tiêu đề, nội dung và chọn người nhận.", "warning");
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
      showToast("Gửi thông báo thành công!", "success");
      setIsSendDialogOpen(false);
      setNotificationTitle("");
      setNotificationMessage("");
      setSelectedResidents([]);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Đã xảy ra lỗi.", "error");
    } finally {
      setSending(false);
    }
  };

  /**
   * Đánh dấu một thông báo là đã đọc.
   * @param notificationId - ID của thông báo cần đánh dấu.
   */
  const handleMarkAsRead = async (notificationId: string) => {
    const notification = notifications.find((n) => n._id === notificationId);
    if (role !== 'resident' || !notification || notification.read) {
      return; // Không làm gì nếu không tìm thấy hoặc đã đọc.
    }

    const originalNotifications = [...notifications];
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
        body: JSON.stringify({ notificationIds: [notificationId], read: true }),
      });

      if (!res.ok) {
        throw new Error("Không thể đánh dấu thông báo là đã đọc.");
      }
    } catch (error) {
      console.error("Lỗi khi đánh dấu đã đọc:", error);
      showToast("Lỗi khi đánh dấu đã đọc.", "error");
      setNotifications(originalNotifications); // Hoàn tác lại nếu có lỗi
    }
  };

  /**
   * Cập nhật trạng thái đã đọc/chưa đọc cho các thông báo đã chọn.
   * @param read - `true` để đánh dấu đã đọc, `false` để đánh dấu chưa đọc.
   */
  const handleBulkUpdateReadStatus = async (read: boolean) => {
    if (selectedNotifications.length === 0) return;

    const originalNotifications = [...notifications];
    // Cập nhật giao diện trước để tạo cảm giác nhanh chóng (Optimistic UI)
    setNotifications((prev) =>
      prev.map((n) =>
        selectedNotifications.includes(n._id) ? { ...n, read } : n
      )
    );

    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: selectedNotifications, read }),
      });

      if (!res.ok) {
        throw new Error("Không thể cập nhật trạng thái thông báo.");
      }
      // Xóa lựa chọn sau khi thành công
      setSelectedNotifications([]);
    } catch (error) {
      console.error("Lỗi khi cập nhật thông báo:", error);
      // Hoàn tác lại nếu có lỗi
      setNotifications(originalNotifications);
      showToast(error instanceof Error ? error.message : "Đã xảy ra lỗi.", "error");
    }
  };

  /**
   * Xóa các thông báo đã chọn.
   */
  const confirmBulkDelete = async () => {
    if (selectedNotifications.length === 0) return;

    const originalNotifications = [...notifications];
    // Cập nhật giao diện trước
    setNotifications((prev) =>
      prev.filter((n) => !selectedNotifications.includes(n._id))
    );

    setIsDeleteDialogOpen(false);
    try {
      const res = await fetch("/api/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: selectedNotifications }),
      });

      if (!res.ok) {
        throw new Error("Không thể xóa thông báo.");
      }
      showToast(`Đã xóa ${selectedNotifications.length} thông báo đã chọn.`, "success");
      // Xóa lựa chọn sau khi thành công
      setSelectedNotifications([]);
    } catch (error) {
      console.error("Lỗi khi xóa thông báo:", error);
      // Hoàn tác lại nếu có lỗi
      setNotifications(originalNotifications);
      showToast(error instanceof Error ? error.message : "Đã xảy ra lỗi.", "error");
    }
  };

  const handleToggleSelection = (notificationId: string) => {
    setSelectedNotifications((prev) =>
      prev.includes(notificationId)
        ? prev.filter((id) => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  /**
   * Mở dialog để xem chi tiết và đánh dấu là đã đọc.
   * @param notification - Thông báo được chọn để xem.
   */
  const handleViewNotification = (notification: Notification) => {
    setViewingNotification(notification);
    handleMarkAsRead(notification._id);
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

  const handleToggleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map((n) => n._id));
    }
  };

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
      case "mailsend":
        return <Send className="w-5 h-5 text-gray-700" />;
      case "mailreceive":
        return <Mail className="w-5 h-5 text-blue-500" />;
      case "notice":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
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
                              className="font-normal flex flex-row justify-between items-center space-x-2"
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

        {/* Thanh hành động khi có mục được chọn */}
        {selectedNotifications.length > 0 && (
          <Card className="p-3 mb-4 flex flex-row items-center justify-between bg-gray-50 animate-in fade-in-50">
            <div className="flex items-center gap-4">
              <Checkbox
                checked={
                  filteredNotifications.length > 0 &&
                  selectedNotifications.length === filteredNotifications.length
                }
                onCheckedChange={handleToggleSelectAll}
                aria-label="Chọn tất cả"
              />
              <span className="text-sm font-medium text-gray-700">
                Đã chọn {selectedNotifications.length} mục
              </span>
            </div>
            <div className="flex items-center gap-2">
              {role === 'resident' && (
                <>
                  <Button variant="outline" size="sm" onClick={() => handleBulkUpdateReadStatus(true)}>
                    <BookOpen className="w-4 h-4 mr-2" />
                    Đánh dấu đã đọc
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleBulkUpdateReadStatus(false)}>
                    <Book className="w-4 h-4 mr-2" />
                    Đánh dấu chưa đọc
                  </Button>
                </>
              )}
              <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
                <Trash2 className="w-4 h-4 mr-2" />
                {role === 'manager' ? 'Thu hồi' : 'Xóa'}
              </Button>
            </div>
          </Card>
        )}

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
                    className={`flex items-start gap-4 p-4 transition-colors cursor-pointer ${selectedNotifications.includes(n._id)
                        ? "bg-blue-100"
                        : !n.read
                          ? "bg-blue-50 hover:bg-blue-100"
                          : "hover:bg-gray-50"
                    }`}
                    onClick={() => handleViewNotification(n)}
                  >
                    <div className="flex items-center h-full pt-1">
                      <Checkbox
                        checked={selectedNotifications.includes(n._id)}
                        onCheckedChange={() => handleToggleSelection(n._id)}
                        onClick={(e) => e.stopPropagation()} // Ngăn sự kiện click của div cha
                      />
                    </div>
                    {!n.read && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                    )}
                    <div
                      className="flex-shrink-0"
                    >
                      {getNotificationIcon(n.type)}
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="font-semibold text-gray-900 truncate pr-4">
                        {n.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1 truncate pr-4">
                        {n.message}
                      </p>
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

      {/* Dialog xem chi tiết thông báo */}
      <Dialog open={!!viewingNotification} onOpenChange={(isOpen) => !isOpen && setViewingNotification(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="break-all">{viewingNotification?.title}</DialogTitle>
            {viewingNotification && (
              <DialogDescription asChild>
                <div className="flex justify-between items-center text-sm text-gray-500 pt-1">
                  <span
                    className="min-w-0 break-all pr-4 line-clamp-2"
                    title={
                      role === "manager" && viewingNotification?.recipientsInfo?.length
                        ? `Đến: ${viewingNotification.recipientsInfo.map((r) => r.name).join(", ")}`
                        : undefined
                    }
                  >
                  {(() => {
                    if (!viewingNotification) return null;
                    const { type, senderInfo, recipientsInfo } = viewingNotification;

                    // Dành cho Manager
                    if (role === 'manager') {
                      // Nếu có thông tin người nhận, đây là thông báo về thư đã gửi đi.
                      if (recipientsInfo && recipientsInfo.length > 0) {
                        const recipientNames = recipientsInfo
                          .map(r => r.name)
                          .join(', ');
                        return `Đến: ${recipientNames}`;
                      }
                      return 'Từ: Hệ thống'; // Các trường hợp khác là thông báo hệ thống.
                    }

                    // Dành cho Cư dân
                    if (role === 'resident') {
                      // Chỉ cần có thông tin người gửi là hiển thị, không cần phụ thuộc vào 'type'
                      if (senderInfo && senderInfo.name) {
                        return `Từ: ${senderInfo.name} - Quản lý`; 
                      }
                      return 'Từ: Hệ thống'; // Các loại khác cho cư dân đều từ hệ thống
                    }

                    return 'Từ: Hệ thống'; // Fallback
                  })()}
                  </span>
                  <span>
                    {formatDateTime(viewingNotification.createdAt)}
                  </span>
                </div>
              </DialogDescription>
            )}
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="py-4 whitespace-pre-wrap text-sm text-gray-700 break-all">
              {viewingNotification?.message}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button onClick={() => setViewingNotification(null)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog xác nhận xóa */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {role === 'manager' ? 'Xác nhận thu hồi thông báo' : 'Xác nhận xóa'}
            </DialogTitle>
            {role === 'manager' ? (
              <DialogDescription>
                Bạn có chắc chắn muốn thu hồi {selectedNotifications.length} thông báo đã chọn không? Hành động này sẽ xóa thông báo khỏi hộp thư của tất cả người nhận và không thể hoàn tác.
              </DialogDescription>
            ) : (
              <DialogDescription>
                Bạn có chắc chắn muốn xóa {selectedNotifications.length} thông báo đã chọn không? Hành động này không thể hoàn tác.
              </DialogDescription>
            )}
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Hủy</Button>
            <Button variant="destructive" onClick={confirmBulkDelete}>{role === 'manager' ? 'Thu hồi' : 'Xóa'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
