import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Package, Clock, User, Phone, Mail, MapPin} from "lucide-react";
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
import { FilterBar, FilterConfig } from "../ui/FilterBar";

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

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export default function History() {
  const { data: session } = useSession();
  const currentUser = session?.user as SessionUser | undefined;
  const role: "resident" | "manager" = currentUser?.role || "resident";
  const userId = currentUser?.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<HistoryBooking[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    searchTerm: "",
    period: "all" as PeriodFilter,
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    quarter: 1,
    activeTab: "all" as BookingStatus | "all",
  });
  const debouncedSearchTerm = useDebounce(filters.searchTerm, 500);

  const loadHistory = useCallback(async (loadMore = false) => {
    if (!loadMore) {
      setLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);

    try {
      const currentPage = loadMore ? page + 1 : 1;
      let url = "";
      const params = new URLSearchParams();
      params.set("page", String(currentPage));
      params.set("limit", String(ITEMS_PER_PAGE));
      params.set("status", filters.activeTab);
      params.set("searchTerm", debouncedSearchTerm);

      if (role === "resident") {
        if (!userId) {
          setError("Không tìm thấy thông tin người dùng.");
          setLoading(false);
          return;
        }
        url = `/api/history/resident?${params.toString()}`;
      } else { // manager
        params.set("period", filters.period);
        params.set("year", String(filters.year));
        if (filters.period === "month") {
          params.set("month", String(filters.month));
        }
        if (filters.period === "quarter") {
          params.set("quarter", String(filters.quarter));
        }
        url = `/api/history/manager?${params.toString()}`;
      }

      const res = await fetch(url);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || `Lỗi tải lịch sử (${res.status})`);
      }

      if (loadMore) {
        setBookings(prev => [...prev, ...(json.data || [])]);
        setPage(currentPage);
      } else {
        setBookings(json.data || []);
        setPage(1);
      }
      setHasMore(json.pagination.hasMore);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể tải lịch sử hoạt động."
      );
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [page, role, userId, filters.activeTab, debouncedSearchTerm, filters.period, filters.year, filters.month, filters.quarter]);

  useEffect(() => {
    // Fetch data when filters change
    if ((role === "resident" && userId) || role === "manager") {
      loadHistory(false);
    }
  }, [role, userId, filters.period, filters.year, filters.month, filters.quarter, filters.activeTab, debouncedSearchTerm]);

  // State for lazy loading
  const ITEMS_PER_PAGE = 10;

  // Function to load the next page of items
  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    loadHistory(true);
  }, [isLoadingMore, hasMore, loadHistory]);

  // Scroll listener to trigger loading more items
  useEffect(() => {
    const handleScroll = () => {
      // Load more when 300px from the bottom
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 300) {
        loadMore();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMore]);

  if (loading && page === 1) {
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
  const handleFilterChange = (id: string, value: string) => {
    setFilters(prev => {
      let processedValue: string | number = value;
      if (id === 'year' || id === 'month' || id === 'quarter') {
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue)) {
          processedValue = numValue;
        }
      }
      return { ...prev, [id]: processedValue };
    });
  };

  const handleTabChange = (v: string) => {
    setFilters(prev => ({ ...prev, activeTab: v as BookingStatus | "all" }));
  };

  const managerFilterConfig: FilterConfig[] = [
    {
      id: 'searchTerm',
      type: 'search',
      label: 'Tìm kiếm',
      placeholder: 'Mã tủ, tên, email, SĐT...',
      className: 'md:col-span-2',
    },
    {
      id: 'period',
      type: 'select',
      label: 'Khoảng thời gian',
      placeholder: 'Chọn khoảng thời gian',
      options: [
        { value: 'all', label: 'Tất cả' },
        { value: 'month', label: 'Theo tháng' },
        { value: 'quarter', label: 'Theo quý' },
        { value: 'year', label: 'Theo năm' },
      ],
    },
    {
      id: 'year',
      type: 'select',
      label: 'Năm',
      placeholder: 'Chọn năm',
      shouldRender: filters.period !== 'all',
      options: years.map(y => ({ value: y, label: String(y) })),
    },
    {
      id: 'month',
      type: 'select',
      label: 'Tháng',
      placeholder: 'Chọn tháng',
      shouldRender: filters.period === 'month',
      options: Array.from({ length: 12 }).map((_, i) => ({ value: i + 1, label: `Tháng ${i + 1}` })),
    },
    {
      id: 'quarter',
      type: 'select',
      label: 'Quý',
      placeholder: 'Chọn quý',
      shouldRender: filters.period === 'quarter',
      options: [
        { value: 1, label: 'Quý 1' },
        { value: 2, label: 'Quý 2' },
        { value: 3, label: 'Quý 3' },
        { value: 4, label: 'Quý 4' },
      ],
    },
  ];

  const residentFilterConfig: FilterConfig[] = [{ id: 'searchTerm', type: 'search', label: 'Tìm kiếm', placeholder: 'Tìm theo mã tủ...' }];

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
        <FilterBar
          filters={managerFilterConfig}
          filterValues={filters}
          onFilterChange={handleFilterChange}
          gridClass="grid md:grid-cols-5 gap-4 items-end"
          className="p-4"
        />
      )}

      {role === "resident" && (
        <FilterBar
          filters={residentFilterConfig}
          filterValues={filters}
          onFilterChange={handleFilterChange}
          gridClass="max-w-sm"
          className="p-4"
        />
      )}

      <Tabs
        defaultValue="all"
        value={filters.activeTab}
        onValueChange={handleTabChange}
        className="space-y-4"
      >
        <TabsList className="grid w-full max-w-xl grid-cols-5">
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="active">Đã đặt tủ</TabsTrigger>
          <TabsTrigger value="stored">Đã lưu đồ</TabsTrigger>
          <TabsTrigger value="completed">Hoàn tất</TabsTrigger>
          <TabsTrigger value="cancelled">Đã hủy</TabsTrigger>
        </TabsList>

        <TabsContent value={filters.activeTab}>
          <Card className="p-4 md:p-6">
            {bookings.length === 0 && !loading ? (
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
                    {bookings.map((b) => {
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
              {!hasMore && bookings.length > 0 && (
                <div className="text-center py-4 text-sm text-gray-400">
                  Đã tải hết lịch sử.
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
