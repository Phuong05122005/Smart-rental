import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { getInvoices, type Invoice } from '../services/invoiceService';
import { ErrorState } from '../components/ui/ErrorState';
import { QrCode } from 'lucide-react';

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

  const getVietQRUrl = (inv: Invoice) => {
    const bankId = 'MB'; // MBBank
    const accountNo = '1010105122005';
    const accountName = 'NGUYEN THAI PHUONG';
    const amount = Number(inv.amount);
    const addInfo = encodeURIComponent(`Thanh toan HD ${inv.title}`);
    return `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${addInfo}&accountName=${encodeURIComponent(accountName)}`;
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Đang tải...</div>;
  if (error) return <div className="p-4"><ErrorState message={error} /></div>;

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <h2 className="text-xl font-bold text-slate-800">Hóa đơn của tôi</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {invoices.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-500 bg-white rounded-lg border border-slate-200">
            Bạn chưa có hóa đơn nào
          </div>
        ) : (
          invoices.map(inv => (
            <Card key={inv.id} className={inv.status !== 'PAID' ? 'border-amber-200 shadow-sm' : ''}>
              <CardHeader className="border-b bg-slate-50">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{inv.title}</CardTitle>
                  {getStatusBadge(inv.status)}
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Phòng:</span>
                  <span className="font-semibold">{inv.contract?.room?.room_number || '102'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tổng tiền:</span>
                  <span className="font-bold text-rose-600 text-lg">
                    {Number(inv.amount).toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Hạn chót:</span>
                  <span>{new Date(inv.due_date).toLocaleDateString('vi-VN')}</span>
                </div>
                {inv.description && (
                  <div className="pt-2 border-t mt-2">
                    <span className="text-slate-500 text-sm block mb-1">Chi tiết:</span>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{inv.description}</p>
                  </div>
                )}

                {/* Cho phép hiển thị nút thanh toán cho cả PENDING và UNPAID */}
                {inv.status !== 'PAID' && (
                  <div className="pt-4">
                    <button 
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-sm" 
                      onClick={() => setPayingInvoice(inv)}
                    >
                      <QrCode size={18} />
                      Thanh toán ngay (VietQR)
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal hiển thị mã quét QR thanh toán */}
      <Modal isOpen={!!payingInvoice} onClose={() => setPayingInvoice(null)} title="Thanh toán Hóa đơn">
        {payingInvoice && (
          <div className="space-y-4 text-center">
            <p className="text-slate-600 text-sm">
              Quét mã QR qua ứng dụng ngân hàng hoặc ví điện tử để chuyển khoản tự động.
            </p>
            <div className="flex justify-center p-3 bg-slate-50 rounded-xl border border-slate-100">
              <img 
                src={getVietQRUrl(payingInvoice)} 
                alt="QR Code VietQR" 
                className="max-w-[240px] rounded-lg shadow-sm" 
              />
            </div>
            <div className="text-left bg-slate-50 p-4 rounded-lg text-sm space-y-2 border border-slate-100">
              <div className="flex justify-between border-b pb-1">
                <span className="text-slate-500">Ngân hàng:</span> 
                <span className="font-semibold text-slate-800">MB Bank</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-slate-500">Số tài khoản:</span> 
                <span className="font-mono font-bold text-slate-800">1010105122005</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-slate-500">Chủ tài khoản:</span> 
                <span className="font-semibold text-slate-800">NGUYEN THAI PHUONG</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-slate-500">Số tiền:</span> 
                <span className="font-bold text-rose-600 text-base">
                  {Number(payingInvoice.amount).toLocaleString('vi-VN')} đ
                </span>
              </div>
              <div className="flex justify-between pt-1 items-center">
                <span className="text-slate-500">Nội dung CK:</span> 
                <span className="font-mono font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                  Thanh toan HD {payingInvoice.title}
                </span>
              </div>
            </div>
            <button 
              className="w-full py-2.5 mt-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-medium transition-colors" 
              onClick={() => setPayingInvoice(null)}
            >
              Đóng
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TenantInvoices;