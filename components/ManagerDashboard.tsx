import { Package, PackageCheck, PackageX, TrendingUp } from 'lucide-react';
import { Card } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function ManagerDashboard() {
  const stats = [
    {
      label: 'Tủ trống',
      value: '45',
      icon: <Package className="w-6 h-6 text-blue-600" />,
      bgColor: 'bg-blue-100',
      change: '+5',
      changeType: 'increase'
    },
    {
      label: 'Tủ đã đặt',
      value: '12',
      icon: <PackageX className="w-6 h-6 text-yellow-600" />,
      bgColor: 'bg-yellow-100',
      change: '+3',
      changeType: 'increase'
    },
    {
      label: 'Tủ đang dùng',
      value: '83',
      icon: <PackageCheck className="w-6 h-6 text-green-600" />,
      bgColor: 'bg-green-100',
      change: '-2',
      changeType: 'decrease'
    },
    {
      label: 'Tổng số tủ',
      value: '140',
      icon: <TrendingUp className="w-6 h-6 text-purple-600" />,
      bgColor: 'bg-purple-100',
      change: '100%',
      changeType: 'neutral'
    }
  ];

  const usageData = [
    { month: 'T1', lockers: 65 },
    { month: 'T2', lockers: 72 },
    { month: 'T3', lockers: 68 },
    { month: 'T4', lockers: 78 },
    { month: 'T5', lockers: 81 },
    { month: 'T6', lockers: 83 },
    { month: 'T7', lockers: 79 },
    { month: 'T8', lockers: 85 },
    { month: 'T9', lockers: 88 },
    { month: 'T10', lockers: 86 },
    { month: 'T11', lockers: 83 }
  ];

  const pieData = [
    { name: 'Tủ đang dùng', value: 83, color: '#22c55e' },
    { name: 'Tủ đã đặt', value: 12, color: '#eab308' },
    { name: 'Tủ trống', value: 45, color: '#3b82f6' }
  ];

  const blockData = [
    { block: 'Tòa A', total: 50, used: 35, reserved: 5, empty: 10 },
    { block: 'Tòa B', total: 45, used: 28, reserved: 4, empty: 13 },
    { block: 'Tòa C', total: 45, used: 20, reserved: 3, empty: 22 }
  ];

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
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                {stat.icon}
              </div>
              <div className={`text-sm px-2 py-1 rounded ${
                stat.changeType === 'increase' ? 'bg-green-100 text-green-700' :
                stat.changeType === 'decrease' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {stat.change}
              </div>
            </div>
            <p className="text-gray-500 text-sm mb-1">{stat.label}</p>
            <p className="text-gray-900">{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Usage Trend Chart */}
        <Card className="p-6">
          <h3 className="text-gray-900 mb-6">Xu hướng sử dụng tủ theo tháng</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={usageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="lockers" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Status Distribution */}
        <Card className="p-6">
          <h3 className="text-gray-900 mb-6">Phân bổ trạng thái tủ</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
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
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Block Statistics */}
      <Card className="p-6">
        <h3 className="text-gray-900 mb-6">Thống kê theo block/tòa</h3>
        <div className="space-y-4">
          {blockData.map((block, index) => (
            <div key={index} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-gray-900">{block.block}</h4>
                <span className="text-sm text-gray-500">Tổng: {block.total} tủ</span>
              </div>
              <div className="flex gap-2 mb-2">
                <div className="flex-1 h-8 bg-green-500 rounded flex items-center justify-center text-white text-sm" style={{ flexBasis: `${(block.used / block.total) * 100}%` }}>
                  {block.used} đang dùng
                </div>
                <div className="flex-1 h-8 bg-yellow-500 rounded flex items-center justify-center text-white text-sm" style={{ flexBasis: `${(block.reserved / block.total) * 100}%` }}>
                  {block.reserved} đã đặt
                </div>
                <div className="flex-1 h-8 bg-blue-500 rounded flex items-center justify-center text-white text-sm" style={{ flexBasis: `${(block.empty / block.total) * 100}%` }}>
                  {block.empty} trống
                </div>
              </div>
              <div className="flex gap-4 text-sm text-gray-600">
                <span>Tỷ lệ sử dụng: {((block.used / block.total) * 100).toFixed(1)}%</span>
                <span>Tỷ lệ trống: {((block.empty / block.total) * 100).toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
