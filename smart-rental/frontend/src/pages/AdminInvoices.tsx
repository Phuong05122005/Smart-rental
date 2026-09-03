import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Plus, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { getInvoices, createInvoice, updateInvoiceStatus, type Invoice } from '../services/invoiceService';
import api from '../services/api';
import * as XLSX from 'xlsx';

const AdminInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [contracts, setContracts] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    contract_id: '',
    title: '',
    amount: '',
    due_date: '',
    description: ''
  });

  const fetchInvoices = () => {
    setLoading(true);
    getInvoices()
      .then(res => setInvoices(res))
      .catch(() => toast.error('Lỗi tải hóa đơn'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInvoices();
    api.get('/contracts').then(res => setContracts(res.data.data)).catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createInvoice({
        ...formData,
        amount: Number(formData.amount)
      });
      toast.success('Tạo hóa đơn thành công');
      setIsFormOpen(false);
      fetchInvoices();
    } catch {
      toast.error('Lỗi khi tạo hóa đơn');
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateInvoiceStatus(id, status);
      toast.success('Cập nhật trạng thái thành công');
      fetchInvoices();
    } catch {
      toast.error('Lỗi cập nhật trạng thái');
    }
  };

  const exportToExcel = () => {
    const data = invoices.map(inv => ({
      'Mã HĐ': inv.id,
      'Tiêu đề': inv.title,
      'Phòng': inv.contract?.room?.room_number || '-',
      'Số tiền': `${Number(inv.amount).toLocaleString('vi-VN')} đ`,
      'Hạn chót': new Date(inv.due_date).toLocaleDateString('vi-VN'),
      'Trạng thái': inv.status === 'PAID' ? 'Đã thanh toán' : inv.status === 'UNPAID' ? 'Chưa thanh toán' : 'Quá hạn',
      'Chi tiết': inv.description || ''
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "HoaDon");
    XLSX.writeFile(wb, "DanhSachHoaDon.xlsx");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-slate-800">Quản lý Hóa đơn</h2>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={exportToExcel}><Download className="w-4 h-4" /> Xuất Excel</Button>
          <Button className="gap-2" onClick={() => setIsFormOpen(true)}><Plus className="w-4 h-4" /> Tạo hóa đơn</Button>
        </div>
      </div>

      <Card className="shadow-sm border-slate-100 overflow-hidden rounded-xl">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-semibold text-slate-800">Danh sách Hóa đơn</h3>
          <p className="text-sm text-slate-500">Quản lý các khoản thu và trạng thái thanh toán của khách thuê</p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            Đang tải dữ liệu hóa đơn...
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <p className="text-slate-400">Chưa có hóa đơn nào trong hệ thống.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="w-full text-sm text-left">
              <TableHeader className="bg-slate-50/80 border-b border-slate-100 uppercase text-xs font-semibold text-slate-500 tracking-wider">
                <TableRow>
                  <TableHead className="py-4 pl-6">Mã HĐ</TableHead>
                  <TableHead className="py-4">Tiêu đề</TableHead>
                  <TableHead className="py-4 text-center">Phòng</TableHead>
                  <TableHead className="py-4 text-right">Số tiền</TableHead>
                  <TableHead className="py-4 text-center">Hạn chót</TableHead>
                  <TableHead className="py-4 text-center">Trạng thái</TableHead>
                  <TableHead className="py-4 text-right pr-6">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <tbody className="divide-y divide-slate-100">
                {invoices.map(inv => (
                  <TableRow key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                    <TableCell className="pl-6 py-4 text-xs font-mono text-slate-400 font-medium">#{inv.id.split('-')[0].toUpperCase()}</TableCell>
                    <TableCell className="py-4 font-semibold text-slate-800">{inv.title}</TableCell>
                    <TableCell className="py-4 text-center">
                      {inv.contract?.room?.room_number ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                          {inv.contract.room.room_number}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell className="py-4 text-right font-bold text-rose-600">{Number(inv.amount).toLocaleString('vi-VN')} đ</TableCell>
                    <TableCell className="py-4 text-center text-slate-600 font-medium">{new Date(inv.due_date).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell className="py-4 text-center">
                      {inv.status === 'PAID' ? <Badge status="success">Đã thanh toán</Badge> : 
                       inv.status === 'UNPAID' ? <Badge status="danger">Chưa thanh toán</Badge> : 
                       <Badge status="default">{inv.status}</Badge>}
                    </TableCell>
                    <TableCell className="py-4 pr-6 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {inv.status === 'UNPAID' && (
                          <Button variant="outline" className="h-8 px-3 text-xs border-emerald-500 text-emerald-600 hover:bg-emerald-50 transition-colors" onClick={() => handleUpdateStatus(inv.id, 'PAID')}>
                            Xác nhận thu
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

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Tạo hóa đơn mới">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Phòng / Hợp đồng</label>
            <select required className="w-full border-slate-200 rounded-md mt-1 p-2" onChange={e => setFormData({...formData, contract_id: e.target.value})}>
              <option value="">Chọn phòng...</option>
              {contracts.filter(c => c.status === 'ACTIVE').map(c => (
                <option key={c.id} value={c.id}>Phòng {c.room.room_number} - {c.tenant.full_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Tiêu đề hóa đơn</label>
            <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="VD: Hóa đơn tháng 9/2026" />
          </div>
          <div>
            <label className="text-sm font-medium">Tổng tiền (VNĐ)</label>
            <Input required type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="Nhập số tiền..." />
            {formData.amount && <p className="text-sm text-green-600 mt-1 font-medium">Hiển thị: {Number(formData.amount).toLocaleString('vi-VN')} đ</p>}
          </div>
          <div>
            <label className="text-sm font-medium">Hạn thanh toán</label>
            <Input required type="date" value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} />
          </div>
          <div>
            <label className="text-sm font-medium">Ghi chú / Chi tiết (Tiền phòng, điện, nước...)</label>
            <textarea className="w-full border-slate-200 rounded-md mt-1 p-2" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
          </div>
          <Button type="submit" className="w-full">Tạo hóa đơn</Button>
        </form>
      </Modal>
    </div>
  );
};

export default AdminInvoices;
