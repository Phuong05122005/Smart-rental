import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { getRevenueReport, getOccupancyReport } from '../services/reportService';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts';

const CustomTooltip = ({ active, payload, label, unit = 'đ' }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-xl border border-slate-100">
        <p className="font-semibold text-slate-800">{label || payload[0].name}</p>
        <p className="text-primary font-bold">
          {Number(payload[0].value).toLocaleString('vi-VN')} {unit}
        </p>
      </div>
    );
  }
  return null;
};

const Reports = () => {
  const [revenue, setRevenue] = useState<any>(null);
  const [occupancy, setOccupancy] = useState<any>(null);

  useEffect(() => {
    getRevenueReport().then(setRevenue);
    getOccupancyReport().then(setOccupancy);
  }, []);

  if (!revenue || !occupancy) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Báo cáo & Phân tích</h2>
          <p className="text-sm text-slate-500 mt-1">Biểu đồ thống kê doanh thu và tỷ lệ lấp đầy</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl shadow-sm border-slate-100 overflow-hidden">
          <CardHeader className="bg-white border-b border-slate-50 flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-bold text-slate-800">Báo cáo Doanh thu</CardTitle>
            <div className="text-right">
              <span className="text-sm font-medium text-slate-500">Tổng doanh thu</span>
              <p className="text-xl font-extrabold text-blue-600">{revenue.totalRevenue.toLocaleString('vi-VN')} đ</p>
            </div>
          </CardHeader>
          <CardContent className="h-[360px] p-6 pt-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenue.timeline} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `${value / 1000000}M`} />
                <Tooltip content={<CustomTooltip unit="đ" />} />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border-slate-100 overflow-hidden">
          <CardHeader className="bg-white border-b border-slate-50 flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-bold text-slate-800">Tỷ lệ lấp đầy</CardTitle>
            <div className="text-right">
              <span className="text-sm font-medium text-slate-500">Tỷ lệ trống</span>
              <p className="text-xl font-extrabold text-rose-500">{100 - occupancy.occupancyRate}%</p>
            </div>
          </CardHeader>
          <CardContent className="h-[360px] flex items-center justify-center p-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={occupancy.chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={90}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {occupancy.chartData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip unit="phòng" />} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
