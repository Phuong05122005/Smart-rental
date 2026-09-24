import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Plus, Download, RefreshCw, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import { getHouses, type House } from '../services/houseService';
import api from '../services/api';

const AdminInvoices = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate modal
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [genMonth, setGenMonth] = useState(new Date().getMonth() + 1);
  const [genYear, setGenYear] = useState(new Date().getFullYear());
  const [genHouse, setGenHouse] = useState('');

  // Payment modal
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('CASH');
  const [payNote, setPayNote] = useState('');

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/invoices');
      setInvoices(res.data);
    } catch (err) {
      toast.error('Lỗi tải hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  const fetchHouses = async () => {
    try {
      const data = await getHouses();
      setHouses(data);
      if (data.length > 0) setGenHouse(data[0].id);
    } catch (err) {}
  };

  useEffect(() => {
    fetchInvoices();
    fetchHouses();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genHouse) {
      toast.error('Vui lòng chọn nhà trọ');
      return;
    }
    try {
      const res = await api.post('/invoices/generate', { house_id: genHouse, month: genMonth, year: genYear });
      toast.success(res.data.message || 'Thành công');
      setIsGenerateOpen(false);
      fetchInvoices();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || !payAmount) return;
    try {
      await api.post(`/invoices/${selectedInvoice.id}/pay`, {
        amount: Number(payAmount),
        payment_method: payMethod,
        note: payNote
      });
      toast.success('Thanh toán thành công');
      setIsPaymentOpen(false);
      fetchInvoices();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi thanh toán');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Hóa Đơn</h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsGenerateOpen(true)} className="flex items-center gap-2" variant="outline">
            <RefreshCw className="h-4 w-4" />
            Tạo tự động
          </Button>
          <Button onClick={() => {}} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Tạo thủ công
          </Button>
        </div>
      </div>

      <Card className="p-4 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Phòng</TableHead>
              <TableHead>Khách thuê</TableHead>
              <TableHead>Tổng tiền</TableHead>
              <TableHead>Đã thu</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <tbody>
            {invoices.map((inv) => {
              const paid = inv.receipts?.reduce((sum: number, r: any) => sum + Number(r.amount), 0) || 0;
              return (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.title}</TableCell>
                  <TableCell>{inv.contract?.room?.room_number}</TableCell>
                  <TableCell>{inv.contract?.tenant?.full_name}</TableCell>
                  <TableCell>{Number(inv.amount).toLocaleString()} ₫</TableCell>
                  <TableCell className="text-green-600">{paid.toLocaleString()} ₫</TableCell>
                  <TableCell>
                    <Badge variant={inv.status === 'PAID' ? 'success' : inv.status === 'PARTIALLY_PAID' ? 'warning' : 'danger'}>
                      {inv.status === 'PAID' ? 'Đã thu' : inv.status === 'PARTIALLY_PAID' ? 'Thu một phần' : 'Chưa thu'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => { setSelectedInvoice(inv); setPayAmount(''); setPayNote(''); setIsPaymentOpen(true); }}
                      disabled={inv.status === 'PAID'}
                    >
                      <DollarSign className="h-4 w-4 mr-1" /> Thu tiền
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </tbody>
        </Table>
      </Card>

      {/* Modal tạo tự động */}
      <Modal isOpen={isGenerateOpen} onClose={() => setIsGenerateOpen(false)} title="Tạo hóa đơn hàng loạt">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Nhà trọ</label>
            <select className="w-full border-gray-300 rounded-md p-2" value={genHouse} onChange={e => setGenHouse(e.target.value)}>
              {houses.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm mb-1">Tháng</label>
              <select className="w-full border-gray-300 rounded-md p-2" value={genMonth} onChange={e => setGenMonth(Number(e.target.value))}>
                {Array.from({length: 12}, (_, i) => i + 1).map(m => <option key={m} value={m}>Tháng {m}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm mb-1">Năm</label>
              <Input type="number" value={genYear} onChange={e => setGenYear(Number(e.target.value))} />
            </div>
          </div>
          <p className="text-xs text-gray-500">Hệ thống sẽ tự động quét các phòng đang thuê, cộng tiền phòng và tiền điện nước (nếu đã chốt chỉ số) để xuất hóa đơn.</p>
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsGenerateOpen(false)}>Hủy</Button>
            <Button type="submit">Bắt đầu tạo</Button>
          </div>
        </form>
      </Modal>

      {/* Modal thanh toán */}
      <Modal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} title="Thu tiền hóa đơn">
        <form onSubmit={handlePay} className="space-y-4">
          {selectedInvoice && (
            <>
              <div className="bg-gray-50 p-3 rounded-md mb-4">
                <p><strong>Hóa đơn:</strong> {selectedInvoice.title}</p>
                <p><strong>Phòng:</strong> {selectedInvoice.contract?.room?.room_number}</p>
                <p><strong>Tổng tiền:</strong> {Number(selectedInvoice.amount).toLocaleString()} ₫</p>
                <p><strong>Đã thu:</strong> {(selectedInvoice.receipts?.reduce((s:number,r:any)=>s+Number(r.amount),0)||0).toLocaleString()} ₫</p>
                <p className="text-red-600 font-bold"><strong>Còn nợ:</strong> {(Number(selectedInvoice.amount) - (selectedInvoice.receipts?.reduce((s:number,r:any)=>s+Number(r.amount),0)||0)).toLocaleString()} ₫</p>
              </div>
              
              <div>
                <label className="block text-sm mb-1">Số tiền khách trả đợt này</label>
                <Input required type="number" min="1" max={Number(selectedInvoice.amount) - (selectedInvoice.receipts?.reduce((s:number,r:any)=>s+Number(r.amount),0)||0)} value={payAmount} onChange={e => setPayAmount(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm mb-1">Hình thức thanh toán</label>
                <select className="w-full border-gray-300 rounded-md p-2" value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                  <option value="CASH">Tiền mặt</option>
                  <option value="BANK_TRANSFER">Chuyển khoản</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Ghi chú (Tùy chọn)</label>
                <Input value={payNote} onChange={e => setPayNote(e.target.value)} placeholder="VD: Khách chuyển khoản..." />
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="outline" onClick={() => setIsPaymentOpen(false)}>Hủy</Button>
                <Button type="submit">Xác nhận thu tiền</Button>
              </div>
            </>
          )}
        </form>
      </Modal>
    </div>
  );
};

export default AdminInvoices;