import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { DoorOpen, Users, DollarSign, AlertTriangle, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { getDashboardData } from '../services/dashboardService';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-xl border border-slate-100">
        <p className="font-semibold text-slate-800">{label || payload[0].name}</p>
        <p className="text-primary font-bold">
          {payload[0].value} {payload[0].payload.unit || ''}
        </p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardData().then(res => {
      setData(res);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading || !data) return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  const statCards = [
    { title: 'Tổng phòng', value: data.totalRooms, icon: DoorOpen, color: 'text-blue-600', bg: 'bg-blue-100', trend: '+2', trendIcon: TrendingUp, trendColor: 'text-green-500' },
    { title: 'Đang thuê', value: data.rentedRooms, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-100', trend: '+1', trendIcon: TrendingUp, trendColor: 'text-green-500' },
    { title: 'Doanh thu (VNĐ)', value: data.revenue.toLocaleString('vi-VN'), icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-100', trend: '+5%', trendIcon: TrendingUp, trendColor: 'text-green-500' },
    { title: 'Sắp hết hạn', value: data.expiringContracts, icon: Clock, color: 'text-rose-600', bg: 'bg-rose-100', trend: 'Lưu ý', trendIcon: AlertTriangle, trendColor: 'text-rose-500' },
  ];

  const occupancyData = [
    { name: 'Đã thuê', value: data.rentedRooms, color: '#10b981' },
    { name: 'Trống', value: data.availableRooms, color: '#3b82f6' },
    { name: 'Bảo trì', value: data.maintenanceRooms, color: '#f59e0b' }
  ];

  const contractData = [
    { name: 'Đang hoạt động', value: data.activeContracts, fill: '#3b82f6' },
    { name: 'Sắp hết hạn', value: data.expiringContracts, fill: '#ef4444' }
  ];

  return (
    <div className="space-y-8 p-2 lg:p-6 bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Tổng quan hệ thống</h2>
          <p className="text-slate-500 text-sm mt-1">Cập nhật dữ liệu mới nhất về tình hình kinh doanh</p>
        </div>
        <div className="flex items-center gap-3 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <div className="text-sm text-slate-600">Tỷ lệ lấp đầy: <span className="font-bold text-emerald-700 text-lg ml-1">{data.occupancyRate}%</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-300">
              <stat.icon className={`w-24 h-24 ${stat.color} -mr-8 -mt-8`} />
            </div>
            
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">{stat.title}</p>
                <h3 className="text-3xl font-extrabold text-slate-800">{stat.value}</h3>
                <div className={`flex items-center gap-1 mt-3 text-sm font-medium ${stat.trendColor}`}>
                  <stat.trendIcon className="w-4 h-4" />
                  <span>{stat.trend}</span>
                </div>
              </div>
              <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center shadow-inner`}>
                <stat.icon className={`w-7 h-7 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl shadow-sm border-slate-100 overflow-hidden">
          <CardHeader className="bg-white border-b border-slate-50 pb-4">
            <CardTitle className="text-lg font-bold text-slate-800">Tỷ lệ lấp đầy phòng</CardTitle>
          </CardHeader>
          <CardContent className="h-[360px] flex items-center justify-center bg-white p-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={occupancyData} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={80} 
                  outerRadius={110} 
                  paddingAngle={8} 
                  dataKey="value"
                  stroke="none"
                >
                  {occupancyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border-slate-100 overflow-hidden">
          <CardHeader className="bg-white border-b border-slate-50 pb-4">
            <CardTitle className="text-lg font-bold text-slate-800">Tổng quan Hợp đồng</CardTitle>
          </CardHeader>
          <CardContent className="h-[360px] flex items-center justify-center bg-white p-6 pt-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contractData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={60}>
                  {contractData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
