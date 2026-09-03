import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';
import { getMaintenanceRequests, updateMaintenanceStatus, type MaintenanceRequest } from '../services/maintenanceService';

const AdminMaintenance = () => {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = () => {
    setLoading(true);
    getMaintenanceRequests()
      .then(res => setRequests(res))
      .catch(() => toast.error('Lỗi tải danh sách sự cố'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateMaintenanceStatus(id, status);
      toast.success('Cập nhật trạng thái thành công');
      fetchRequests();
    } catch {
      toast.error('Lỗi cập nhật trạng thái');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Quản lý Sự cố & Sửa chữa</h2>
      </div>

      <Card className="shadow-sm border-slate-100 overflow-hidden rounded-xl">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-semibold text-slate-800">Danh sách báo cáo</h3>
          <p className="text-sm text-slate-500">Quản lý và cập nhật tiến độ xử lý sự cố từ khách thuê</p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            Đang tải dữ liệu sự cố...
          </div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <p className="text-slate-400">Chưa có báo cáo sự cố nào trong hệ thống.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="w-full text-sm text-left">
              <TableHeader className="bg-slate-50/80 border-b border-slate-100 uppercase text-xs font-semibold text-slate-500 tracking-wider">
                <TableRow>
                  <TableHead className="py-4 pl-6">Ngày gửi</TableHead>
                  <TableHead className="py-4 text-center">Phòng</TableHead>
                  <TableHead className="py-4">Khách báo</TableHead>
                  <TableHead className="py-4 w-48">Tiêu đề</TableHead>
                  <TableHead className="py-4">Mô tả</TableHead>
                  <TableHead className="py-4 text-center">Trạng thái</TableHead>
                  <TableHead className="py-4 text-right pr-6">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <tbody className="divide-y divide-slate-100">
                {requests.map(req => (
                  <TableRow key={req.id} className="hover:bg-slate-50/50 transition-colors group">
                    <TableCell className="pl-6 py-4 text-slate-600 font-medium">
                      {new Date(req.created_at).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell className="py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                        {req.room?.room_number || '-'}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 font-semibold text-slate-800">{req.tenant?.full_name}</TableCell>
                    <TableCell className="py-4 font-medium text-slate-700">{req.title}</TableCell>
                    <TableCell className="py-4">
                      <p className="text-sm text-slate-500 max-w-xs truncate" title={req.description}>
                        {req.description}
                      </p>
                    </TableCell>
                    <TableCell className="py-4 text-center">
                      {req.status === 'PENDING' ? <Badge status="warning">Chờ xử lý</Badge> : 
                       req.status === 'IN_PROGRESS' ? <Badge status="info">Đang sửa</Badge> : 
                       req.status === 'RESOLVED' ? <Badge status="success">Đã xong</Badge> : 
                       <Badge status="danger">Từ chối</Badge>}
                    </TableCell>
                    <TableCell className="py-4 pr-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {req.status === 'PENDING' && (
                          <Button variant="outline" className="h-8 px-3 text-xs border-blue-500 text-blue-600 hover:bg-blue-50" onClick={() => handleUpdateStatus(req.id, 'IN_PROGRESS')}>
                            Đang xử lý
                          </Button>
                        )}
                        {req.status === 'IN_PROGRESS' && (
                          <Button className="h-8 px-3 text-xs bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => handleUpdateStatus(req.id, 'RESOLVED')}>
                            Hoàn tất
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminMaintenance;
