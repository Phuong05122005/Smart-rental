import React from 'react';
import { X, CheckCircle2, Copy } from 'lucide-react';

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

import { Modal } from './Modal';
import { toast } from 'react-hot-toast';

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onConfirmPaid,
}) => {
  if (!isOpen) return null;

  // Cấu hình thông tin tài khoản nhận tiền
  const BANK_ID = (invoice as any).creator?.bank_name || 'MB'; 
  const ACCOUNT_NO = (invoice as any).creator?.bank_account || '1010105122005'; 
  const ACCOUNT_NAME = (invoice as any).creator?.bank_owner || (invoice as any).creator?.full_name || 'NGUYEN THAI PHUONG'; 

  // Cú pháp nội dung chuyển khoản rõ ràng để dễ đối soát
  const shortId = String(invoice.id).split('-')[0].toUpperCase();
  const memo = `HD ${shortId}`;

  // URL sinh mã QR trực tiếp từ VietQR
  const amount = Number(invoice.total_amount);
  const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(memo)}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã copy ${label}`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Thanh Toán Hóa Đơn #${shortId}`}>
      <div className="space-y-5 text-center px-2">
        <p className="text-slate-600 text-sm">
          Phòng: {invoice.room_name || 'Phòng trọ'}
        </p>
        
        <div className="flex justify-center">
          <div className="p-4 bg-white rounded-2xl border-2 border-blue-100 shadow-sm inline-block">
            <img 
              src={qrUrl} 
              alt="QR Code VietQR" 
              className="max-w-[220px] rounded-lg" 
            />
          </div>
        </div>

        <div className="text-left bg-slate-50 p-5 rounded-xl text-sm space-y-3 border border-slate-200 shadow-inner">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <span className="text-slate-500">Ngân hàng thụ hưởng:</span> 
            <span className="font-semibold text-slate-800">{BANK_ID}</span>
          </div>
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <span className="text-slate-500">Số tài khoản:</span> 
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-slate-800 text-base">{ACCOUNT_NO}</span>
              <button onClick={() => copyToClipboard(ACCOUNT_NO, 'Số tài khoản')} className="text-slate-400 hover:text-blue-600"><Copy size={14}/></button>
            </div>
          </div>
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <span className="text-slate-500">Chủ tài khoản:</span> 
            <span className="font-semibold text-slate-800 uppercase">{ACCOUNT_NAME}</span>
          </div>
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <span className="text-slate-500">Số tiền chuyển:</span> 
            <div className="flex items-center gap-2">
              <span className="font-bold text-rose-600 text-lg">
                {amount.toLocaleString('vi-VN')} đ
              </span>
              <button onClick={() => copyToClipboard(amount.toString(), 'Số tiền')} className="text-slate-400 hover:text-blue-600"><Copy size={14}/></button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-1 gap-2">
            <span className="text-slate-500">Nội dung chuyển khoản:</span> 
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-md border border-blue-100">
                {memo}
              </span>
              <button onClick={() => copyToClipboard(memo, 'Nội dung CK')} className="text-slate-400 hover:text-blue-600"><Copy size={14}/></button>
            </div>
          </div>
        </div>

        {/* Nút thao tác dành cho chủ trọ/Admin */}
        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Đóng
          </button>
          {onConfirmPaid && invoice.status !== 'PAID' && (
            <button
              onClick={() => {
                onConfirmPaid(invoice.id);
                onClose();
              }}
              className="flex-1 rounded-lg bg-green-600 py-2.5 text-sm font-medium text-white hover:bg-green-700 flex items-center justify-center gap-1.5 shadow"
            >
              <CheckCircle2 size={16} />
              Xác nhận đã nhận
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};