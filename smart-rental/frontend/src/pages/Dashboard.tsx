import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { DoorOpen, Users, DollarSign, AlertTriangle } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { getDashboardData } from '../services/dashboardService';

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

  if (loading || !data) return <div className="p-8 text-slate-500">Đang tải dữ liệu Dashboard...</div>;

  const statCards = [
    { title: 'Tổng phòng', value: data.totalRooms, icon: DoorOpen, color: 'text-primary', bg: 'bg-primary-light/10' },
    { title: 'Đang thuê', value: data.rentedRooms, icon: Users, color: 'text-success', bg: 'bg-success/10' },
    { title: 'Doanh thu (VNĐ)', value: data.revenue.toLocaleString('vi-VN'), icon: DollarSign, color: 'text-warning', bg: 'bg-warning/10' },
    { title: 'Sắp hết hạn', value: data.expiringContracts, icon: AlertTriangle, color: 'text-danger', bg: 'bg-danger/10' },
  ];

  const occupancyData = [
    { name: 'Đã thuê', value: data.rentedRooms, color: '#10b981' },
    { name: 'Trống', value: data.availableRooms, color: '#3b82f6' },
    { name: 'Bảo trì', value: data.maintenanceRooms, color: '#f59e0b' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Tổng quan hệ thống</h2>
        <div className="text-sm text-slate-500">Tỷ lệ lấp đầy: <span className="font-bold text-success">{data.occupancyRate}%</span></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
                <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-full ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tỷ lệ lấp đầy phòng</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={occupancyData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {occupancyData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tổng quan Hợp đồng</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Đang hoạt động', value: data.activeContracts, fill: '#3b82f6' },
                { name: 'Sắp hết hạn', value: data.expiringContracts, fill: '#ef4444' }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
