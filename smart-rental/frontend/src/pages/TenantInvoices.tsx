import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { getInvoices, type Invoice } from '../services/invoiceService';
import { ErrorState } from '../components/ui/ErrorState';
import { QrCode, Copy, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const TenantInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    getInvoices()
      .then(res => setInvoices(res))
      .catch(err => setError(err.response?.data?.message || 'Lỗi tải hóa đơn'))
      .finally(() => setLoading(false));
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge status="success">Đã thanh toán</Badge>;
      case 'UNPAID':
      case 'PENDING':
        return <Badge status="warning">Chờ thanh toán</Badge>;
      case 'OVERDUE':
        return <Badge status="danger">Quá hạn</Badge>;
      default:
        return <Badge status="default">{status}</Badge>;
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã copy ${label}`);
  };

  const getVietQRUrl = (inv: Invoice, shortId: string) => {
    const bankId = inv.creator?.bank_name || 'MB';
    const accountNo = inv.creator?.bank_account || '1010105122005';
    const accountName = inv.creator?.bank_owner || inv.creator?.full_name || 'NGUYEN THAI PHUONG';
    const amount = Number(inv.amount);
    const addInfo = encodeURIComponent(`HD ${shortId}`);
    return `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${addInfo}&accountName=${encodeURIComponent(accountName)}`;
  };

  if (loading) return <div className="p-8 text-center text-slate-500 flex justify-center items-center h-64">Đang tải hóa đơn...</div>;
  if (error) return <div className="p-4"><ErrorState message={error} /></div>;

  return (
    <div className="p-4 lg:p-8 space-y-8 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Quản lý hóa đơn</h2>
          <p className="text-slate-500 mt-1">Xem chi tiết và thanh toán các khoản phí của bạn</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {invoices.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200 border-dashed">
            Bạn chưa có hóa đơn nào
          </div>
        ) : (
          invoices.map(inv => {
            const shortId = inv.id.split('-')[0].toUpperCase();
            
            return (
              <Card key={inv.id} className={`overflow-hidden transition-all duration-200 ${inv.status !== 'PAID' ? 'border-amber-200 shadow-md ring-1 ring-amber-100 hover:shadow-lg' : 'hover:shadow-md'}`}>
                {/* Header: Trạng thái & Tiêu đề */}
                <div className={`px-6 py-4 border-b flex justify-between items-start ${inv.status === 'PAID' ? 'bg-slate-50' : inv.status === 'OVERDUE' ? 'bg-rose-50' : 'bg-amber-50'}`}>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">{inv.title}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs font-mono bg-white/60 px-2 py-1 rounded text-slate-600 border border-slate-200">
                        #{shortId}
                      </span>
                      <button 
                        onClick={() => copyToClipboard(shortId, 'Mã HĐ')}
                        className="text-slate-400 hover:text-slate-700 transition-colors"
                        title="Copy Mã Hóa Đơn"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                  {getStatusBadge(inv.status)}
                </div>

                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* Cột 1: Thông tin định danh */}
                    <div className="p-6 border-b md:border-b-0 md:border-r border-slate-100 space-y-4">
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Thông tin định danh</h4>
                      
                      <div>
                        <span className="text-slate-500 text-sm block mb-0.5">Phòng trọ</span>
                        <span className="font-medium text-slate-900">{inv.contract?.room?.room_number || '---'}</span>
                      </div>
                      
                      <div>
                        <span className="text-slate-500 text-sm block mb-0.5">Khách thuê</span>
                        <span className="font-medium text-slate-900">{inv.contract?.tenant?.full_name || '---'}</span>
                      </div>
                      
                      <div>
                        <span className="text-slate-500 text-sm block mb-0.5">Ngày phát hành</span>
                        <span className="font-medium text-slate-900">{new Date(inv.issue_date).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>

                    {/* Cột 2: Chi tiết tài chính */}
                    <div className="p-6 space-y-4 bg-slate-50/50">
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Chi tiết tài chính</h4>
                      
                      <div>
                        <span className="text-slate-500 text-sm block mb-0.5">Tổng tiền cần thanh toán</span>
                        <span className="font-bold text-rose-600 text-2xl tracking-tight">
                          {Number(inv.amount).toLocaleString('vi-VN')} <span className="text-lg">đ</span>
                        </span>
                      </div>
                      
                      <div>
                        <span className="text-slate-500 text-sm block mb-0.5">Hạn thanh toán</span>
                        <span className={`font-medium ${inv.status === 'OVERDUE' ? 'text-rose-600 font-bold' : 'text-slate-900'}`}>
                          {new Date(inv.due_date).toLocaleDateString('vi-VN')}
                          {inv.status === 'OVERDUE' && ' (Đã quá hạn)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Phần Ghi chú / Chi tiết phân rã */}
                  {inv.description && (
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
                      <span className="text-slate-500 text-sm block mb-2 font-medium">Chi tiết phân rã các khoản:</span>
                      <div className="bg-white p-3 rounded-lg border border-slate-200 text-sm text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">
                        {inv.description}
                      </div>
                    </div>
                  )}
                </CardContent>

                {/* Footer: Hành động */}
                <CardFooter className="p-6 border-t bg-white flex justify-end">
                  {inv.status === 'PAID' ? (
                    <div className="flex items-center gap-2 text-emerald-600 font-medium">
                      <CheckCircle2 size={20} />
                      Đã hoàn tất thanh toán
                    </div>
                  ) : (
                    <div className="w-full flex flex-col sm:flex-row items-center gap-3">
                      {inv.status === 'OVERDUE' && (
                        <div className="flex items-center gap-2 text-rose-600 text-sm flex-1">
                          <AlertCircle size={16} />
                          Vui lòng thanh toán gấp
                        </div>
                      )}
                      <button 
                        className={`w-full sm:w-auto px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-sm ${
                          inv.status === 'OVERDUE' 
                            ? 'bg-rose-600 hover:bg-rose-700 text-white' 
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                        onClick={() => setPayingInvoice(inv)}
                      >
                        <QrCode size={18} />
                        Thanh toán QR
                      </button>
                    </div>
                  )}
                </CardFooter>
              </Card>
            );
          })
        )}
      </div>

      {/* Modal hiển thị mã quét QR thanh toán */}
      <Modal isOpen={!!payingInvoice} onClose={() => setPayingInvoice(null)} title="Thanh toán Hóa đơn">
        {payingInvoice && (
          <div className="space-y-5 text-center px-2">
            <p className="text-slate-600 text-sm">
              Sử dụng ứng dụng ngân hàng hoặc ví điện tử quét mã dưới đây để thanh toán nhanh.
            </p>
            
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-2xl border-2 border-blue-100 shadow-sm inline-block">
                <img 
                  src={getVietQRUrl(payingInvoice, payingInvoice.id.split('-')[0].toUpperCase())} 
                  alt="QR Code VietQR" 
                  className="max-w-[220px] rounded-lg" 
                />
              </div>
            </div>

            <div className="text-left bg-slate-50 p-5 rounded-xl text-sm space-y-3 border border-slate-200 shadow-inner">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-slate-500">Ngân hàng thụ hưởng:</span> 
                <span className="font-semibold text-slate-800">{payingInvoice.creator?.bank_name || 'MB'}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-slate-500">Số tài khoản:</span> 
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-800 text-base">{payingInvoice.creator?.bank_account || '1010105122005'}</span>
                  <button onClick={() => copyToClipboard(payingInvoice.creator?.bank_account || '1010105122005', 'Số tài khoản')} className="text-slate-400 hover:text-blue-600"><Copy size={14}/></button>
                </div>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-slate-500">Chủ tài khoản:</span> 
                <span className="font-semibold text-slate-800 uppercase">{payingInvoice.creator?.bank_owner || payingInvoice.creator?.full_name || 'NGUYEN THAI PHUONG'}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-slate-500">Số tiền chuyển:</span> 
                <div className="flex items-center gap-2">
                  <span className="font-bold text-rose-600 text-lg">
                    {Number(payingInvoice.amount).toLocaleString('vi-VN')} đ
                  </span>
                  <button onClick={() => copyToClipboard(payingInvoice.amount.toString(), 'Số tiền')} className="text-slate-400 hover:text-blue-600"><Copy size={14}/></button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-1 gap-2">
                <span className="text-slate-500">Nội dung chuyển khoản:</span> 
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-md border border-blue-100">
                    HD {payingInvoice.id.split('-')[0].toUpperCase()}
                  </span>
                  <button onClick={() => copyToClipboard(`HD ${payingInvoice.id.split('-')[0].toUpperCase()}`, 'Nội dung CK')} className="text-slate-400 hover:text-blue-600"><Copy size={14}/></button>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 italic mt-4">
              * Lưu ý: Ghi đúng nội dung chuyển khoản để hệ thống tự động gạch nợ.
            </p>

            <button 
              className="w-full py-3 mt-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-all shadow-sm" 
              onClick={() => setPayingInvoice(null)}
            >
              Đóng cửa sổ
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TenantInvoices;