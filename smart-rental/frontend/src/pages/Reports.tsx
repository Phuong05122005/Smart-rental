import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { getRevenueReport, getOccupancyReport } from '../services/reportService';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const Reports = () => {
  const [revenue, setRevenue] = useState<any>(null);
  const [occupancy, setOccupancy] = useState<any>(null);

  useEffect(() => {
    getRevenueReport().then(setRevenue);
    getOccupancyReport().then(setOccupancy);
  }, []);

  if (!revenue || !occupancy) return <div className="p-8 text-slate-500">Đang tải báo cáo...</div>;

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b'];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800">Báo cáo & Phân tích</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Báo cáo Doanh thu</CardTitle>
            <p className="text-sm text-slate-500">Tổng doanh thu hiện tại: <strong className="text-primary">{revenue.totalRevenue.toLocaleString()} đ</strong></p>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenue.timeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: any) => Number(value || 0).toLocaleString('vi-VN') + ' đ'} />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Báo cáo Tỷ lệ lấp đầy</CardTitle>
            <p className="text-sm text-slate-500">Tỷ lệ trống: <strong className="text-danger">{100 - occupancy.occupancyRate}%</strong></p>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={occupancy.chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} ${(Number(percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {occupancy.chartData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
