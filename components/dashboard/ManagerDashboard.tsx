'use client';

import { Package, PackageCheck, PackageX, TrendingUp, AlertCircle } from 'lucide-react';
import { Card } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import useSWR from 'swr';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(errorData.message);
  }
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.message || 'Failed to fetch data');
  }
  return json.data;
};

interface BlockStats {
  block: string;
  total: number;
  used: number;
  reserved: number;
  empty: number;
}

interface DashboardData {
  stats: {
    available?: number;
    reserved?: number;
    inUse?: number;
    total?: number;
  };
  usageData: { month: string; lockers: number }[];
  blockData: BlockStats[];
}

export default function ManagerDashboard() {
  const { data, error, isLoading } = useSWR<DashboardData>('/api/lockers/manager/dashboard', fetcher, {
    revalidateOnFocus: false,
  });

  if (isLoading) {
    return <div className="p-6">Đang tải dữ liệu dashboard...</div>;
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex items-center gap-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <div>
              <h3 className="text-red-800 font-semibold">Không thể tải dữ liệu</h3>
              <p className="text-red-700">{error.message}</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const { stats: statsData, usageData, blockData } = data || { stats: {}, usageData: [], blockData: [] };

  const stats = [
    {
      label: 'Tủ trống',
      value: statsData.available || 0,
      icon: <Package className="w-6 h-6 text-blue-600" />,
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Tủ đã đặt',
      value: statsData.reserved || 0,
      icon: <PackageX className="w-6 h-6 text-yellow-600" />,
      bgColor: 'bg-yellow-100',
    },
    {
      label: 'Tủ đang dùng',
      value: statsData.inUse || 0,
      icon: <PackageCheck className="w-6 h-6 text-green-600" />,
      bgColor: 'bg-green-100',
    },
    {
      label: 'Tổng số tủ',
      value: statsData.total || 0,
      icon: <TrendingUp className="w-6 h-6 text-purple-600" />,
      bgColor: 'bg-purple-100',
    }
  ];

  const pieData = [
    { name: 'Tủ đang dùng', value: statsData.inUse || 0, color: '#22c55e' },
    { name: 'Tủ đã đặt', value: statsData.reserved || 0, color: '#eab308' },
    { name: 'Tủ trống', value: statsData.available || 0, color: '#3b82f6' }
  ].filter(item => item.value > 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Dashboard Quản lý</h1>
        <p className="text-gray-600">Tổng quan hệ thống tủ thông minh</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                {stat.icon}
              </div>
            </div>
            <p className="text-gray-500 text-sm mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Usage Trend Chart */}
        <Card className="p-6">
          <h3 className="text-gray-900 mb-6">Lượt hoàn tất theo tháng (12 tháng qua)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={usageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="lockers" name="Lượt hoàn tất" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Status Distribution */}
        <Card className="p-6">
          <h3 className="text-gray-900 mb-6">Phân bổ trạng thái tủ</h3>
          {pieData.length > 0 ? (<ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">Không có dữ liệu để hiển thị.</div>
          )}
        </Card>
      </div>

      {/* Block Statistics */}
      <Card className="p-6">
        <h3 className="text-gray-900 font-medium text-[1.125rem]">Thống kê theo Block / Tòa</h3>
        <div className="space-y-4">
          {blockData.length > 0 ? blockData.map((block, index) => (
            <div key={index} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-gray-900">{block.block}</h4>
                <span className="text-sm text-gray-500">Tổng: {block.total} tủ</span>
              </div>
              <div className="flex w-full h-8 rounded overflow-hidden bg-gray-200 mb-2" title="Thanh trạng thái tủ">
                <div className="h-full bg-green-500 flex items-center justify-center text-white text-sm transition-all duration-300" title={`Đang dùng: ${block.used}`} style={{ width: `${(block.used / block.total) * 100}%` }}>
                  {block.used > 0 && block.used}
                </div>
                <div className="h-full bg-yellow-500 flex items-center justify-center text-white text-sm transition-all duration-300" title={`Đã đặt: ${block.reserved}`} style={{ width: `${(block.reserved / block.total) * 100}%` }}>
                  {block.reserved > 0 && block.reserved}
                </div>
                <div className="h-full bg-blue-500 flex items-center justify-center text-white text-sm transition-all duration-300" title={`Trống: ${block.empty}`} style={{ width: `${(block.empty / block.total) * 100}%` }}>
                  {block.empty > 0 && block.empty}
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-600 mt-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-green-500"></div>
                  <span>Đang dùng ({((block.used / block.total) * 100).toFixed(0)}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-yellow-500"></div>
                  <span>Đã đặt ({((block.reserved / block.total) * 100).toFixed(0)}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-blue-500"></div>
                  <span>Trống ({((block.empty / block.total) * 100).toFixed(0)}%)</span>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center text-gray-500 py-8">Không có dữ liệu thống kê theo tòa.</div>
          )}
        </div>
      </Card>
    </div>
  );
}
