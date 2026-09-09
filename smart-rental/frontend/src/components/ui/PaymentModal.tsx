import React from 'react';
import { X, CheckCircle, Copy } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: {
    id: string | number;
    room_name?: string;
    total_amount: number;
    status: string;
  };
  onConfirmPaid?: (invoiceId: string | number) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onConfirmPaid,
}) => {
  if (!isOpen) return null;

  // Cấu hình thông tin tài khoản nhận tiền
  const BANK_ID = (invoice as any).creator?.bank_name || 'MB'; 
  const ACCOUNT_NO = (invoice as any).creator?.bank_account || '0334812345'; 
  const ACCOUNT_NAME = (invoice as any).creator?.bank_owner || (invoice as any).creator?.full_name || 'NGUYEN THAI PHUONG'; 

  // Cú pháp nội dung chuyển khoản rõ ràng để dễ đối soát
  const shortId = String(invoice.id).split('-')[0].toUpperCase();
  const memo = `THANHTOAN HD ${shortId}`;

  // URL sinh mã QR trực tiếp từ VietQR
  const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${invoice.total_amount}&addInfo=${encodeURIComponent(memo)}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <h3 className="text-xl font-bold text-gray-900 text-center mb-1">
          Thanh Toán Hóa Đơn #{shortId}
        </h3>
        <p className="text-sm text-gray-500 text-center mb-4">
          Phòng: {invoice.room_name || 'Phòng trọ'}
        </p>

        {/* Khung ảnh QR */}
        <div className="flex justify-center my-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
          <img
            src={qrUrl}
            alt="Mã VietQR"
            className="w-64 h-auto object-contain rounded-md shadow-sm"
          />
        </div>

        {/* Chi tiết thanh toán */}
        <div className="mt-4 space-y-2 rounded-lg bg-blue-50/60 p-3 text-sm text-gray-700">
          <div className="flex justify-between">
            <span className="text-gray-500">Số tiền:</span>
            <span className="font-bold text-blue-600 text-base">
              {Number(invoice.total_amount).toLocaleString('vi-VN')} đ
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Nội dung CK:</span>
            <span className="font-mono font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200">
              {memo}
            </span>
          </div>
        </div>

        {/* Nút thao tác dành cho chủ trọ */}
        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            className="w-1/2 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Đóng
          </button>
          {onConfirmPaid && invoice.status !== 'PAID' && (
            <button
              onClick={() => {
                onConfirmPaid(invoice.id);
                onClose();
              }}
              className="w-1/2 rounded-lg bg-green-600 py-2.5 text-sm font-medium text-white hover:bg-green-700 flex items-center justify-center gap-1.5 shadow"
            >
              <CheckCircle size={16} />
              Xác nhận đã nhận
            </button>
          )}
        </div>
      </div>
    </div>
  );
};