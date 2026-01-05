import { useEffect, useMemo, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Package, Clock, User, Phone, Mail, MapPin, Search } from "lucide-react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";

type BookingStatus = "active" | "stored" | "completed" | "cancelled";

interface HistoryLocker {
  _id: string;
  lockerId: string;
  building: string;
  block: string;
}

interface HistoryUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  building?: string;
  block?: string;
  floor?: string;
  unit?: string;
}

interface HistoryBooking {
  _id: string;
  userId: HistoryUser | string;
  lockerId: HistoryLocker | string;
  startTime?: string;
  endTime?: string;
  status: BookingStatus;
  cost?: number;
  paymentStatus?: "pending" | "paid";
}

type PeriodFilter = "all" | "month" | "quarter" | "year";

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

function formatMoney(value?: number) {
  if (!value) return "0 đ";
  return `${value.toLocaleString("vi-VN")} đ`;
}

interface SessionUser {
  id?: string;
  role?: "resident" | "manager";
}

export default function History() {
  const { data: session } = useSession();
  const currentUser = session?.user as SessionUser | undefined;
  const role: "resident" | "manager" = currentUser?.role || "resident";
  const userId = currentUser?.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<HistoryBooking[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Manager filters
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [quarter, setQuarter] = useState<number>(1);

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);
        setError(null);

        let url = "";

        if (role === "resident") {
          if (!userId) {
            setError("Không tìm thấy thông tin người dùng.");
            setLoading(false);
            return;
          }
          url = `/api/history/resident`;
        } else {
          const params = new URLSearchParams();
          params.set("period", period);
          params.set("year", String(year));
          if (period === "month") {
            params.set("month", String(month));
          }
          if (period === "quarter") {
            params.set("quarter", String(quarter));
          }
          url = `/api/history/manager?${params.toString()}`;
        }

        const res = await fetch(url);
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || `Lỗi tải lịch sử (${res.status})`);
        }

        setBookings(json.data || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Không thể tải lịch sử hoạt động."
        );
      } finally {
        setLoading(false);
      }
    }

    // For manager, reload when period filter changes; for resident, just once when session ready
    if (role === "resident") {
      if (userId) {
        loadHistory();
      }
    } else {
      loadHistory();
    }
  }, [role, userId, period, year, month, quarter]);

  const [activeTab, setActiveTab] = useState<BookingStatus | "all">("all");

  const filtered = useMemo(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();

    return bookings.filter((b) => {
      // Filter by tab first
      if (activeTab !== "all" && b.status !== activeTab) {
        return false;
      }

      // Then filter by search term
      if (!lowercasedSearchTerm) {
        return true; // No search term, so don't filter out
      }

      const locker = typeof b.lockerId === "string" ? undefined : b.lockerId;
      const user = typeof b.userId === "string" ? undefined : b.userId;

      if (role === "resident") {
        return locker?.lockerId.toLowerCase().includes(lowercasedSearchTerm) ?? false;
      }

      // For manager
      const matchesLocker = locker?.lockerId.toLowerCase().includes(lowercasedSearchTerm) ?? false;
      const matchesUser =
        user?.name.toLowerCase().includes(lowercasedSearchTerm) ||
        user?.email.toLowerCase().includes(lowercasedSearchTerm) ||
        user?.phone?.includes(lowercasedSearchTerm);

      return matchesLocker || matchesUser;
    });
  }, [bookings, activeTab, searchTerm, role]);

  // State for lazy loading
  const ITEMS_PER_PAGE = 10;
  const [displayedItems, setDisplayedItems] = useState<HistoryBooking[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
    const initialItems = filtered.slice(0, ITEMS_PER_PAGE);
    setDisplayedItems(initialItems);
    setHasMore(filtered.length > ITEMS_PER_PAGE);
  }, [filtered]);

  // Function to load the next page of items
  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    setTimeout(() => {
      const nextPage = page + 1;
      const newItems = filtered.slice(page * ITEMS_PER_PAGE, nextPage * ITEMS_PER_PAGE);
      setDisplayedItems(prev => [...prev, ...newItems]);
      setPage(nextPage);
      setHasMore(filtered.length > nextPage * ITEMS_PER_PAGE);
      setIsLoadingMore(false);
    }, 300); // Small delay for better UX
  }, [page, hasMore, isLoadingMore, filtered]);

  // Scroll listener to trigger loading more items
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 200) {
        loadMore();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMore]);

  if (loading) {
    return <div className="p-6">Đang tải lịch sử hoạt động...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        Lỗi: {error}
      </div>
    );
  }

  const years = Array.from({ length: 5 }).map((_, i) => new Date().getFullYear() - i);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-gray-900 mb-2">
          {role === "resident" ? "Lịch sử hoạt động của tôi" : "Thống kê lịch sử hoạt động"}
        </h2>
        <p className="text-gray-600">
          {role === "resident"
            ? "Xem lại các lần sử dụng tủ gửi đồ của bạn."
            : "Theo dõi tất cả đơn hàng theo thời gian."}
        </p>
      </div>

      {role === "manager" && (
        <Card className="p-4">
          <div className="grid md:grid-cols-5 gap-4 items-end">
            <div className="md:col-span-2">
              <p className="text-xs text-gray-500 mb-1">Tìm kiếm</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Mã tủ, tên, email, SĐT..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Khoảng thời gian</p>
              <Select
                value={period}
                onValueChange={(val: PeriodFilter) => setPeriod(val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn khoảng thời gian" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="month">Theo tháng</SelectItem>
                  <SelectItem value="quarter">Theo quý</SelectItem>
                  <SelectItem value="year">Theo năm</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {period !== "all" && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Năm</p>
                <Select
                  value={String(year)}
                  onValueChange={(val: string) => setYear(parseInt(val, 10))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn năm" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {period === "month" && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Tháng</p>
                <Select
                  value={String(month)}
                  onValueChange={(val: string) => setMonth(parseInt(val, 10))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn tháng" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }).map((_, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>
                        Tháng {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {period === "quarter" && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Quý</p>
                <Select
                  value={String(quarter)}
                  onValueChange={(val: string) => setQuarter(parseInt(val, 10))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn quý" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Quý 1</SelectItem>
                    <SelectItem value="2">Quý 2</SelectItem>
                    <SelectItem value="3">Quý 3</SelectItem>
                    <SelectItem value="4">Quý 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </Card>
      )}

      {role === "resident" && (
        <Card className="p-4">
          <div className="max-w-sm">
            <p className="text-xs text-gray-500 mb-1">Tìm kiếm</p>
            <Input placeholder="Tìm theo mã tủ..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </Card>
      )}

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={(v: string) =>
          setActiveTab(v as BookingStatus | "all")
        }
        className="space-y-4"
      >
        <TabsList className="grid w-full max-w-xl grid-cols-5">
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="active">Đã đặt tủ</TabsTrigger>
          <TabsTrigger value="stored">Đã lưu đồ</TabsTrigger>
          <TabsTrigger value="completed">Hoàn tất</TabsTrigger>
          <TabsTrigger value="cancelled">Đã hủy</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card className="p-4 md:p-6">
            {filtered.length === 0 ? (
              <p className="text-gray-500 text-sm">
                Không có lịch sử cho bộ lọc hiện tại.
              </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã tủ</TableHead>
                      {role === "manager" && <TableHead>Người dùng</TableHead>}
                      <TableHead>Vị trí</TableHead>
                      <TableHead>Bắt đầu</TableHead>
                      <TableHead>Kết thúc</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Số tiền</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedItems.map((b) => {
                      const locker =
                        typeof b.lockerId === "string" ? undefined : b.lockerId;
                      const user =
                        typeof b.userId === "string" ? undefined : b.userId;

                      return (
                        <TableRow key={b._id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center">
                                <Package className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-sm text-gray-900">
                                  {locker?.lockerId || "N/A"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  ID đơn: {b._id.slice(-6)}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          {role === "manager" && (
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-sm text-gray-900">
                                  <User className="w-3 h-3 text-gray-400" />
                                  <span>{user?.name || "N/A"}</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Mail className="w-3 h-3" />
                                  <span>{user?.email || "-"}</span>
                                </div>
                                {user?.phone && (
                                  <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Phone className="w-3 h-3" />
                                    <span>{user.phone}</span>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          )}

                          <TableCell>
                            {locker ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-sm text-gray-900">
                                  <MapPin className="w-3 h-3 text-gray-400" />
                                  <span>
                                    Tòa {locker.building} - Block {locker.block}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-500">N/A</span>
                            )}
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-gray-900">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span>{formatDateTime(b.startTime)}</span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-gray-900">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span>{formatDateTime(b.endTime)}</span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Badge
                                className={
                                  b.status === "completed"
                                    ? "bg-green-100 text-green-700"
                                    : b.status === "cancelled"
                                    ? "bg-red-100 text-red-700"
                                    : b.status === "stored"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-blue-100 text-blue-700"
                                }
                              >
                                {b.status === "active" && "Đã đặt tủ"}
                                {b.status === "stored" && "Đã lưu đồ"}
                                {b.status === "completed" && "Hoàn tất"}
                                {b.status === "cancelled" && "Đã hủy"}
                              </Badge>
                              {b.paymentStatus && (
                                <span className="text-xs text-gray-500">
                                  Thanh toán:{" "}
                                  {b.paymentStatus === "paid"
                                    ? "Đã thanh toán"
                                    : "Chưa thanh toán"}
                                </span>
                              )}
                            </div>
                          </TableCell>

                          <TableCell>
                            <span className="text-sm text-blue-600">
                              {formatMoney(b.cost)}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              {isLoadingMore && (
                <div className="text-center py-4 text-sm text-gray-500">
                  Đang tải thêm...
                </div>
              )}
            </>
          )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
