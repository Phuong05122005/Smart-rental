import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { Search, Eye } from 'lucide-react';
import { getAuditLogs, type AuditLog } from '../services/auditService';

const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await getAuditLogs({ page, limit: 15, search, action: actionFilter, target_type: typeFilter });
      setLogs(res.data);
      setTotalPages(res.meta.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, typeFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const getActionBadge = (action: string) => {
    if (action.includes('CREATE')) return <Badge status="success">{action}</Badge>;
    if (action.includes('DELETE') || action.includes('LOCK')) return <Badge status="danger">{action}</Badge>;
    if (action.includes('UPDATE')) return <Badge status="warning">{action}</Badge>;
    return <Badge>{action}</Badge>;
  };

  const openView = (log: AuditLog) => {
    setSelectedLog(log);
    setIsViewOpen(true);
  };

  const formatJSON = (val: string | null) => {
    if (!val) return 'Không có';
    try {
      return JSON.stringify(JSON.parse(val), null, 2);
    } catch {
      return val;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Lịch sử hoạt động (Audit Logs)</h2>
          <p className="text-sm text-slate-500 mt-1">Theo dõi và kiểm toán các thay đổi trong hệ thống</p>
        </div>
      </div>

      <Card className="shadow-sm border-slate-100 overflow-hidden rounded-xl">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <form onSubmit={handleSearch} className="relative md:col-span-2">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              className="pl-10 h-10 w-full border-slate-200 focus:border-blue-500 shadow-sm rounded-lg" 
              placeholder="Tìm tên người dùng, ID đối tượng..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </form>
          <select 
            className="px-4 h-10 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full shadow-sm cursor-pointer transition-colors" 
            value={actionFilter} 
            onChange={e => { setActionFilter(e.target.value); setPage(1); }}
          >
            <option value="">Tất cả hành động</option>
            <option value="LOGIN">Đăng nhập (LOGIN)</option>
            <option value="CREATE_ROOM">Tạo phòng</option>
            <option value="UPDATE_ROOM">Sửa phòng</option>
            <option value="DELETE_ROOM">Xóa phòng</option>
            <option value="CREATE_TENANT">Tạo khách thuê</option>
            <option value="UPDATE_TENANT">Sửa khách thuê</option>
            <option value="DELETE_TENANT">Xóa khách thuê</option>
            <option value="CREATE_CONTRACT">Tạo hợp đồng</option>
            <option value="UPDATE_CONTRACT">Sửa hợp đồng</option>
            <option value="LOCK_USER">Khóa tài khoản</option>
          </select>
          <select 
            className="px-4 h-10 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full shadow-sm cursor-pointer transition-colors" 
            value={typeFilter} 
            onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
          >
            <option value="">Tất cả đối tượng</option>
            <option value="USER">Người dùng (USER)</option>
            <option value="ROOM">Phòng (ROOM)</option>
            <option value="TENANT">Khách thuê (TENANT)</option>
            <option value="CONTRACT">Hợp đồng (CONTRACT)</option>
          </select>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            Đang tải dữ liệu lịch sử...
          </div>
        ) : logs.length === 0 ? (
          <EmptyState title="Không có dữ liệu" description="Chưa có log hoạt động nào hoặc không khớp với tìm kiếm." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table className="w-full text-sm text-left">
                <TableHeader className="bg-slate-50/80 border-b border-slate-100 uppercase text-xs font-semibold text-slate-500 tracking-wider">
                  <TableRow>
                    <TableHead className="py-4 pl-6">Thời gian</TableHead>
                    <TableHead className="py-4">Người thực hiện</TableHead>
                    <TableHead className="py-4">Hành động</TableHead>
                    <TableHead className="py-4 text-center">Đối tượng</TableHead>
                    <TableHead className="py-4">ID Đối tượng</TableHead>
                    <TableHead className="py-4 text-right pr-6">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                      <TableCell className="pl-6 py-4">
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-md">
                          {new Date(log.created_at).toLocaleString('vi-VN')}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 font-semibold text-slate-800">{log.actor_name}</TableCell>
                      <TableCell className="py-4">{getActionBadge(log.action)}</TableCell>
                      <TableCell className="py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                          {log.target_type}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="font-mono text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2 py-1 rounded">
                          {log.target_id.substring(0, 10)}...
                        </span>
                      </TableCell>
                      <TableCell className="py-4 pr-6 text-right">
                        <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openView(log)} className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Xem chi tiết">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </tbody>
              </Table>
            </div>
            
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-white rounded-b-xl">
                <span className="text-sm font-medium text-slate-500">Trang {page} / {totalPages}</span>
                <div className="flex gap-2">
                  <Button variant="outline" className="h-9 px-4 text-sm font-medium" disabled={page === 1} onClick={() => setPage(page - 1)}>Trước</Button>
                  <Button variant="outline" className="h-9 px-4 text-sm font-medium" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Sau</Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Chi tiết Audit Log">
        {selectedLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">
              <div><span className="text-xs text-slate-500 block">Thời gian:</span><span className="text-sm font-medium">{new Date(selectedLog.created_at).toLocaleString('vi-VN')}</span></div>
              <div><span className="text-xs text-slate-500 block">Người thực hiện:</span><span className="text-sm font-medium">{selectedLog.actor_name}</span></div>
              <div><span className="text-xs text-slate-500 block">Hành động:</span><span className="text-sm font-medium">{selectedLog.action}</span></div>
              <div><span className="text-xs text-slate-500 block">Đối tượng:</span><span className="text-sm font-medium">{selectedLog.target_type} ({selectedLog.target_id})</span></div>
            </div>
            
            <div>
              <span className="text-xs text-slate-500 block mb-1">Old Value:</span>
              <pre className="bg-slate-50 p-2 rounded-md text-xs font-mono overflow-auto max-h-32 text-slate-600 border border-slate-100">
                {formatJSON(selectedLog.old_value)}
              </pre>
            </div>
            <div>
              <span className="text-xs text-slate-500 block mb-1">New Value:</span>
              <pre className="bg-slate-50 p-2 rounded-md text-xs font-mono overflow-auto max-h-32 text-slate-600 border border-slate-100">
                {formatJSON(selectedLog.new_value)}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AuditLogs;
