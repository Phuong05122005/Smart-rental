import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isDestructive?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ isOpen, onClose, onConfirm, title, message, isDestructive = false }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col items-center text-center p-4">
        {isDestructive && <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />}
        <p className="text-slate-600 mb-6">{message}</p>
        <div className="flex gap-4 w-full">
          <Button variant="outline" className="flex-1" onClick={onClose}>Hủy</Button>
          <Button variant={isDestructive ? 'danger' : 'primary'} className="flex-1" onClick={() => { onConfirm(); onClose(); }}>Xác nhận</Button>
        </div>
      </div>
    </Modal>
  );
};
