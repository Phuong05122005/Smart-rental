import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Plus, RefreshCw, DollarSign, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getHouses, type House } from '../services/houseService';
import api from '../services/api';

const AdminInvoices = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [houses, setHouses] = useState<House[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate modal
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [genMonth, setGenMonth] = useState(new Date().getMonth() + 1);
  const [genYear, setGenYear] = useState(new Date().getFullYear());
  const [genHouse, setGenHouse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Manual modal
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [manualData, setManualData] = useState({ contract_id: '', title: '', amount: '', due_date: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const fetchFilters = async () => {
    try {
      const data = await getHouses();
      setHouses(data);
      if (data.length > 0) setGenHouse(data[0].id);

      const res = await api.get('/contracts');
      setContracts(res.data.data || res.data || []);
    } catch (err) {}
  };

  useEffect(() => {
    fetchInvoices();
    fetchFilters();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genHouse) {
      toast.error('Vui lòng chọn nhà trọ');
      return;
    }
    setIsGenerating(true);
    try {
      const res = await api.post('/invoices/generate', { house_id: genHouse, month: genMonth, year: genYear });
      toast.success(res.data.message || 'Tạo thành công');
      setIsGenerateOpen(false);
      fetchInvoices();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualData.contract_id || !manualData.amount || !manualData.title) {
      toast.error('Vui lòng điền các trường bắt buộc');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post('/invoices', {
        ...manualData,
        amount: Number(manualData.amount),
        status: 'UNPAID'
      });
      toast.success('Tạo hóa đơn thủ công thành công');
      setIsManualOpen(false);
      fetchInvoices();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> Đã thu</span>;
      case 'PARTIALLY_PAID': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"><DollarSign className="w-3.5 h-3.5" /> Thu một phần</span>;
      default: return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200"><FileText className="w-3.5 h-3.5" /> Chưa thu</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Quản lý Hóa Đơn</h1>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button variant="outline" onClick={() => setIsGenerateOpen(true)} className="flex items-center gap-2 flex-1 sm:flex-none justify-center font-medium shadow-sm bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors">
            <RefreshCw className="h-4 w-4" />
            Tạo tự động
          </Button>
          <Button onClick={() => {
            setManualData({ contract_id: '', title: '', amount: '', due_date: '', description: '' });
            setIsManualOpen(true);
          }} className="flex items-center gap-2 flex-1 sm:flex-none justify-center font-semibold bg-blue-600 hover:bg-blue-700 shadow-sm">
            <Plus className="h-4 w-4" />
            Tạo thủ công
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border-slate-100 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            Đang tải dữ liệu hóa đơn...
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            Chưa có hóa đơn nào. Hãy bắt đầu tạo hóa đơn.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="w-full text-sm text-left">
              <TableHeader className="bg-slate-50/80 border-b border-slate-100 uppercase text-xs font-semibold text-slate-500 tracking-wider">
                <TableRow>
                  <TableHead className="py-4 pl-6">Tiêu đề</TableHead>
                  <TableHead className="py-4">Phòng</TableHead>
                  <TableHead className="py-4">Khách thuê</TableHead>
                  <TableHead className="py-4 text-right">Tổng tiền</TableHead>
                  <TableHead className="py-4 text-right">Đã thu</TableHead>
                  <TableHead className="py-4 text-center">Trạng thái</TableHead>
                  <TableHead className="py-4 text-right pr-6">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => {
                  const paid = inv.receipts?.reduce((sum: number, r: any) => sum + Number(r.amount), 0) || 0;
                  return (
                    <TableRow key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="pl-6 py-4 font-semibold text-slate-800">{inv.title}</TableCell>
                      <TableCell className="py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                          {inv.contract?.room?.room_number || '-'}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 font-medium text-slate-700">{inv.contract?.tenant?.full_name || '-'}</TableCell>
                      <TableCell className="py-4 text-right font-bold text-slate-800">{Number(inv.amount).toLocaleString('vi-VN')} ₫</TableCell>
                      <TableCell className="py-4 text-right font-bold text-emerald-600">{paid.toLocaleString('vi-VN')} ₫</TableCell>
                      <TableCell className="py-4 text-center">{getStatusBadge(inv.status)}</TableCell>
                      <TableCell className="py-4 pr-6 text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className={`font-medium border-slate-200 ${inv.status === 'PAID' ? 'text-slate-400 bg-slate-50' : 'text-blue-600 hover:bg-blue-50 hover:border-blue-200'}`}
                          onClick={() => { setSelectedInvoice(inv); setPayAmount(''); setPayNote(''); setIsPaymentOpen(true); }}
                          disabled={inv.status === 'PAID'}
                        >
                          <DollarSign className="h-3.5 w-3.5 mr-1" /> Thu tiền
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
      </Card>

      {/* Modal tạo tự động */}
      <Modal isOpen={isGenerateOpen} onClose={() => setIsGenerateOpen(false)} title="Tạo hóa đơn tự động hàng loạt">
        <form onSubmit={handleGenerate} className="space-y-5">
          <div className="bg-blue-50 border border-blue-100 text-blue-800 p-4 rounded-lg flex items-start gap-3">
            <RefreshCw className="w-5 h-5 mt-0.5 text-blue-500" />
            <div className="text-sm font-medium">
              Hệ thống sẽ tự động quét các phòng đang thuê, cộng tiền phòng và tiền dịch vụ (điện nước) để xuất hóa đơn trong vài giây.
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nhà trọ <span className="text-red-500">*</span></label>
            <select className="w-full px-4 h-11 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm cursor-pointer" value={genHouse} onChange={e => setGenHouse(e.target.value)}>
              {houses.map(h => <option key={h.id} value={h.id}>🏠 {h.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Kỳ Tháng</label>
              <select className="w-full px-4 h-11 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm cursor-pointer" value={genMonth} onChange={e => setGenMonth(Number(e.target.value))}>
                {Array.from({length: 12}, (_, i) => i + 1).map(m => <option key={m} value={m}>Tháng {m}</option>)}
              </select>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Năm</label>
              <Input type="number" className="h-11 shadow-sm font-medium text-slate-700" value={genYear} onChange={e => setGenYear(Number(e.target.value))} />
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex justify-end gap-3">
            <Button type="button" variant="outline" className="h-11 px-6 font-medium" onClick={() => setIsGenerateOpen(false)}>Hủy</Button>
            <Button type="submit" disabled={isGenerating} className="h-11 px-6 font-semibold bg-blue-600 hover:bg-blue-700 shadow-sm">
              {isGenerating ? 'Đang tạo...' : 'Bắt đầu quét & tạo'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal tạo thủ công */}
      <Modal isOpen={isManualOpen} onClose={() => setIsManualOpen(false)} title="Tạo hóa đơn thủ công">
        <form onSubmit={handleManualSubmit} className="space-y-5">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Chọn Hợp Đồng / Phòng <span className="text-red-500">*</span></label>
              <select required className="w-full px-4 h-11 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm cursor-pointer" value={manualData.contract_id} onChange={e => setManualData({...manualData, contract_id: e.target.value})}>
                <option value="" disabled>-- Chọn Hợp đồng đang thuê --</option>
                {contracts.filter(c => c.status === 'ACTIVE').map(c => (
                  <option key={c.id} value={c.id}>Phòng {c.room_number} - Khách: {c.tenant_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tiêu đề hóa đơn <span className="text-red-500">*</span></label>
              <Input required className="h-11 shadow-sm font-medium" value={manualData.title} onChange={e => setManualData({...manualData, title: e.target.value})} placeholder="VD: Hóa đơn phạt vi phạm nội quy, phí sửa chữa..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tổng số tiền (VNĐ) <span className="text-red-500">*</span></label>
                <Input required type="number" min="1" className="h-11 shadow-sm font-bold text-blue-700" value={manualData.amount} onChange={e => setManualData({...manualData, amount: e.target.value})} placeholder="VD: 500000" />
                {manualData.amount && (
                  <p className="text-[11px] text-green-700 mt-1 font-bold">{Number(manualData.amount).toLocaleString('vi-VN')} ₫</p>
                )}
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Ngày hết hạn (Tùy chọn)</label>
                <Input type="date" className="h-11 shadow-sm font-medium" value={manualData.due_date} onChange={e => setManualData({...manualData, due_date: e.target.value})} />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Ghi chú chi tiết</label>
              <textarea 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-colors"
                rows={2}
                value={manualData.description}
                onChange={e => setManualData({...manualData, description: e.target.value})}
                placeholder="Mô tả các khoản thu chi tiết..."
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-end gap-3">
            <Button type="button" variant="outline" className="h-11 px-6 font-medium" onClick={() => setIsManualOpen(false)}>Hủy</Button>
            <Button type="submit" disabled={isSubmitting} className="h-11 px-6 font-semibold bg-blue-600 hover:bg-blue-700 shadow-sm">
              Tạo hóa đơn
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal thanh toán */}
      <Modal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} title="Xác nhận thu tiền Hóa đơn">
        <form onSubmit={handlePay} className="space-y-5">
          {selectedInvoice && (
            <>
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg space-y-3 shadow-sm">
                <div className="flex justify-between items-center border-b border-amber-200/60 pb-2">
                  <span className="text-amber-800/70 font-semibold text-sm">Hóa đơn:</span>
                  <span className="font-bold text-amber-900">{selectedInvoice.title}</span>
                </div>
                <div className="flex justify-between items-center border-b border-amber-200/60 pb-2">
                  <span className="text-amber-800/70 font-semibold text-sm">Tổng tiền:</span>
                  <span className="font-bold text-slate-800">{Number(selectedInvoice.amount).toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="flex justify-between items-center border-b border-amber-200/60 pb-2">
                  <span className="text-amber-800/70 font-semibold text-sm">Đã thu:</span>
                  <span className="font-bold text-emerald-600">{(selectedInvoice.receipts?.reduce((s:number,r:any)=>s+Number(r.amount),0)||0).toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-amber-900 font-bold">SỐ TIỀN CÒN NỢ:</span>
                  <span className="font-bold text-rose-600 text-lg">{(Number(selectedInvoice.amount) - (selectedInvoice.receipts?.reduce((s:number,r:any)=>s+Number(r.amount),0)||0)).toLocaleString('vi-VN')} ₫</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Số tiền khách trả <span className="text-red-500">*</span></label>
                  <Input required type="number" min="1" max={Number(selectedInvoice.amount) - (selectedInvoice.receipts?.reduce((s:number,r:any)=>s+Number(r.amount),0)||0)} className="h-11 shadow-sm font-bold text-blue-700" value={payAmount} onChange={e => setPayAmount(e.target.value)} />
                  {payAmount && (
                    <p className="text-[11px] text-green-700 mt-1 font-bold">{Number(payAmount).toLocaleString('vi-VN')} ₫</p>
                  )}
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Hình thức <span className="text-red-500">*</span></label>
                  <select className="w-full px-4 h-11 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm cursor-pointer" value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                    <option value="CASH">💵 Tiền mặt</option>
                    <option value="BANK_TRANSFER">🏦 Chuyển khoản</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Ghi chú (Tùy chọn)</label>
                <Input className="h-11 shadow-sm font-medium" value={payNote} onChange={e => setPayNote(e.target.value)} placeholder="VD: Khách chuyển khoản VCB, người nhà đóng hộ..." />
              </div>
              
              <div className="pt-2 border-t border-slate-100 flex justify-end gap-3">
                <Button type="button" variant="outline" className="h-11 px-6 font-medium" onClick={() => setIsPaymentOpen(false)}>Hủy</Button>
                <Button type="submit" className="h-11 px-6 font-semibold bg-emerald-600 hover:bg-emerald-700 shadow-sm text-white">Xác nhận Đã thu tiền</Button>
              </div>
            </>
          )}
        </form>
      </Modal>
    </div>
  );
};

export default AdminInvoices;
