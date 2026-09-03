import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { getMaintenanceRequests, createMaintenanceRequest, type MaintenanceRequest } from '../services/maintenanceService';
import { ErrorState } from '../components/ui/ErrorState';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const TenantMaintenance = () => {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '' });

  const fetchRequests = () => {
    setLoading(true);
    getMaintenanceRequests()
      .then(res => setRequests(res))
      .catch(err => setError(err.response?.data?.message || 'Lỗi tải danh sách báo cáo'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;
    try {
      await createMaintenanceRequest(formData);
      toast.success('Gửi báo cáo sự cố thành công');
      setIsOpen(false);
      setFormData({ title: '', description: '' });
      fetchRequests();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <Badge status="warning">Đang chờ</Badge>;
      case 'IN_PROGRESS': return <Badge status="info">Đang xử lý</Badge>;
      case 'RESOLVED': return <Badge status="success">Đã giải quyết</Badge>;
      case 'REJECTED': return <Badge status="danger">Bị từ chối</Badge>;
      default: return <Badge status="default">{status}</Badge>;
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Báo cáo sự cố</h2>
        <Button className="gap-2" onClick={() => setIsOpen(true)}><Plus className="w-4 h-4" /> Báo sự cố</Button>
      </div>

      {loading ? <div className="p-8 text-center">Đang tải...</div> :
       error ? <div className="p-4"><ErrorState message={error} /></div> :
       requests.length === 0 ? (
         <div className="p-8 text-center text-slate-500 bg-white rounded-lg border border-slate-200">
           Bạn chưa gửi báo cáo sự cố nào
         </div>
       ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map(req => (
            <Card key={req.id}>
              <CardHeader className="border-b bg-slate-50">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{req.title}</CardTitle>
                  {getStatusBadge(req.status)}
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Ngày gửi:</span>
                  <span>{new Date(req.created_at).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="pt-2 border-t mt-2">
                  <span className="text-slate-500 text-sm block mb-1">Mô tả chi tiết:</span>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{req.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
       )
      }

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Gửi báo cáo sự cố">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Tiêu đề (VD: Hỏng điều hòa)</label>
            <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Nhập tiêu đề ngắn gọn" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Mô tả chi tiết</label>
            <textarea 
              required 
              className="w-full border-slate-200 rounded-md mt-1 p-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
              rows={4} 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              placeholder="Mô tả rõ hơn về sự cố..."
            />
          </div>
          <Button type="submit" className="w-full">Gửi Báo Cáo</Button>
        </form>
      </Modal>
    </div>
  );
};

export default TenantMaintenance;
