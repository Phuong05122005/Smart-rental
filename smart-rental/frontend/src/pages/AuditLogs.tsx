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
      <h2 className="text-xl font-bold text-slate-800">Lịch sử hoạt động (Audit Logs)</h2>

      <Card>
        <div className="p-4 border-b border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <form onSubmit={handleSearch} className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input className="pl-9 w-full" placeholder="Tìm tên người dùng, Target ID..." value={search} onChange={e => setSearch(e.target.value)} />
          </form>
          <select className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-light" value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1); }}>
            <option value="">Tất cả Hành động</option>
            <option value="LOGIN">LOGIN</option>
            <option value="CREATE_ROOM">CREATE_ROOM</option>
            <option value="UPDATE_ROOM">UPDATE_ROOM</option>
            <option value="DELETE_ROOM">DELETE_ROOM</option>
            <option value="CREATE_TENANT">CREATE_TENANT</option>
            <option value="UPDATE_TENANT">UPDATE_TENANT</option>
            <option value="DELETE_TENANT">DELETE_TENANT</option>
            <option value="CREATE_CONTRACT">CREATE_CONTRACT</option>
            <option value="UPDATE_CONTRACT">UPDATE_CONTRACT</option>
            <option value="LOCK_USER">LOCK_USER</option>
          </select>
          <select className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-light" value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}>
            <option value="">Tất cả Đối tượng</option>
            <option value="USER">USER</option>
            <option value="ROOM">ROOM</option>
            <option value="TENANT">TENANT</option>
            <option value="CONTRACT">CONTRACT</option>
          </select>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-slate-500">Đang tải lịch sử...</div>
        ) : logs.length === 0 ? (
          <EmptyState title="Không có dữ liệu" description="Chưa có log hoạt động nào." />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Người thực hiện</TableHead>
                  <TableHead>Hành động</TableHead>
                  <TableHead>Đối tượng</TableHead>
                  <TableHead>ID Đối tượng</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <tbody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs text-slate-500">{new Date(log.created_at).toLocaleString('vi-VN')}</TableCell>
                    <TableCell className="font-medium text-slate-900">{log.actor_name}</TableCell>
                    <TableCell>{getActionBadge(log.action)}</TableCell>
                    <TableCell className="font-semibold text-primary">{log.target_type}</TableCell>
                    <TableCell className="font-mono text-xs">{log.target_id.substring(0, 10)}...</TableCell>
                    <TableCell>
                      <button onClick={() => openView(log)} className="text-slate-400 hover:text-primary transition-colors"><Eye className="w-4 h-4" /></button>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
            
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm text-slate-500">Trang {page} / {totalPages}</span>
                <div className="flex gap-2">
                  <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>Trước</Button>
                  <Button variant="outline" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Sau</Button>
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
