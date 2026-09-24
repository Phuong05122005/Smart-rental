import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import toast from 'react-hot-toast';
import { getMeterReadings, saveMeterReading, type MeterReading } from '../services/meterReadingService';
import { getRooms, type Room } from '../services/roomService';
import { getHouses, type House } from '../services/houseService';
import { Save, Zap, Droplets, Filter } from 'lucide-react';

const MeterReadings = () => {
  const [houses, setHouses] = useState<House[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [readings, setReadings] = useState<MeterReading[]>([]);
  
  const [selectedHouse, setSelectedHouse] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [type, setType] = useState('ELECTRICITY'); // ELECTRICITY or WATER

  const [loading, setLoading] = useState(true);

  const [inputData, setInputData] = useState<Record<string, { old_index: string, new_index: string }>>({});

  const fetchFilters = async () => {
    try {
      const housesData = await getHouses();
      setHouses(housesData);
      if (housesData.length > 0) setSelectedHouse(housesData[0].id);
    } catch (err) {
      toast.error('Lỗi khi tải nhà trọ');
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  const fetchData = async () => {
    if (!selectedHouse) return;
    setLoading(true);
    try {
      const roomsRes = await getRooms({ limit: 100 });
      const filteredRooms = roomsRes.data.filter(r => r.house_id === selectedHouse);
      setRooms(filteredRooms);

      const readingsData = await getMeterReadings(selectedHouse, month, year, type);
      setReadings(readingsData);

      const initialInput: Record<string, { old_index: string, new_index: string }> = {};
      filteredRooms.forEach(r => {
        const existing = readingsData.find(rd => rd.room_id === r.id);
        initialInput[r.id] = {
          old_index: existing ? existing.old_index.toString() : '',
          new_index: existing ? existing.new_index.toString() : ''
        };
      });
      setInputData(initialInput);
    } catch (err) {
      toast.error('Lỗi khi tải dữ liệu phòng/chỉ số');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedHouse) {
      fetchData();
    }
  }, [selectedHouse, month, year, type]);

  const handleInputChange = (roomId: string, field: 'old_index' | 'new_index', value: string) => {
    setInputData(prev => ({
      ...prev,
      [roomId]: { ...prev[roomId], [field]: value }
    }));
  };

  const handleSave = async (roomId: string) => {
    const data = inputData[roomId];
    if (data.old_index === '' || data.new_index === '') {
      toast.error('Vui lòng nhập đầy đủ chỉ số cho phòng này');
      return;
    }

    try {
      await saveMeterReading({
        room_id: roomId,
        type,
        month,
        year,
        old_index: Number(data.old_index),
        new_index: Number(data.new_index)
      });
      toast.success('Lưu thành công');
      fetchData(); // refresh
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Có lỗi xảy ra');
    }
  };

  const handleSaveAll = async () => {
    let success = 0;
    for (const room of rooms) {
      const data = inputData[room.id];
      if (data && data.old_index !== '' && data.new_index !== '') {
        try {
          await saveMeterReading({
            room_id: room.id,
            type,
            month,
            year,
            old_index: Number(data.old_index),
            new_index: Number(data.new_index)
          });
          success++;
        } catch (err) {
          console.error('Error saving room', room.id, err);
        }
      }
    }
    if (success > 0) {
      toast.success(`Đã lưu thành công ${success} phòng`);
      fetchData();
    } else {
      toast.error('Không có dữ liệu hợp lệ nào để lưu');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          Ghi chỉ số Điện & Nước
        </h1>
        <Button onClick={handleSaveAll} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
          <Save className="w-4 h-4" /> Lưu tất cả
        </Button>
      </div>

      <Card className="shadow-sm border-slate-100 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-wrap gap-4 items-end">
          <div className="flex items-center gap-2 text-slate-500 mr-2">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Bộ lọc:</span>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nhà trọ</label>
            <select 
              className="w-full px-4 h-10 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm cursor-pointer transition-colors"
              value={selectedHouse} 
              onChange={e => setSelectedHouse(e.target.value)}
            >
              <option value="" disabled>-- Chọn nhà trọ --</option>
              {houses.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
          </div>
          
          <div className="w-[120px]">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tháng</label>
            <select 
              className="w-full px-4 h-10 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm cursor-pointer transition-colors"
              value={month} 
              onChange={e => setMonth(Number(e.target.value))}
            >
              {Array.from({length: 12}, (_, i) => i + 1).map(m => <option key={m} value={m}>Tháng {m}</option>)}
            </select>
          </div>
          
          <div className="w-[120px]">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Năm</label>
            <Input 
              type="number" 
              className="h-10 text-sm font-medium shadow-sm"
              value={year} 
              onChange={e => setYear(Number(e.target.value))} 
            />
          </div>
          
          <div className="w-[160px]">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Loại chỉ số</label>
            <select 
              className="w-full px-4 h-10 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm cursor-pointer transition-colors"
              value={type} 
              onChange={e => setType(e.target.value)}
            >
              <option value="ELECTRICITY">⚡ Chỉ số Điện</option>
              <option value="WATER">💧 Chỉ số Nước</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            Đang tải danh sách phòng...
          </div>
        ) : rooms.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            Không tìm thấy phòng nào trong nhà trọ này.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="w-full text-sm text-left">
              <TableHeader className="bg-slate-50/80 border-b border-slate-100 uppercase text-xs font-semibold text-slate-500 tracking-wider">
                <TableRow>
                  <TableHead className="py-4 pl-6">Phòng</TableHead>
                  <TableHead className="py-4 text-center">Chỉ số cũ</TableHead>
                  <TableHead className="py-4 text-center">Chỉ số mới</TableHead>
                  <TableHead className="py-4 text-center">Tiêu thụ</TableHead>
                  <TableHead className="py-4 text-right pr-6">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <tbody>
                {rooms.map(room => {
                  const data = inputData[room.id] || { old_index: '', new_index: '' };
                  const oldNum = Number(data.old_index) || 0;
                  const newNum = Number(data.new_index) || 0;
                  const consumption = (data.old_index && data.new_index) ? Math.max(0, newNum - oldNum) : 0;
                  const hasSaved = readings.some(r => r.room_id === room.id);

                  return (
                    <TableRow key={room.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="py-3 pl-6 font-medium text-slate-700">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded flex items-center justify-center font-bold ${type === 'ELECTRICITY' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                            {room.room_number}
                          </div>
                          {hasSaved && <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-green-100 text-green-700">Đã chốt</span>}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-2">
                        <Input
                          type="number"
                          placeholder="Nhập số cũ..."
                          className="w-full text-center border-slate-200 focus:border-blue-500"
                          value={data.old_index}
                          onChange={(e) => handleInputChange(room.id, 'old_index', e.target.value)}
                        />
                      </TableCell>
                      <TableCell className="py-3 px-2">
                        <Input
                          type="number"
                          placeholder="Nhập số mới..."
                          className="w-full text-center border-slate-200 focus:border-blue-500"
                          value={data.new_index}
                          onChange={(e) => handleInputChange(room.id, 'new_index', e.target.value)}
                        />
                      </TableCell>
                      <TableCell className="py-3 text-center">
                        <div className="font-bold text-slate-700 bg-slate-100 py-2 px-3 rounded-md">
                          {consumption} {type === 'ELECTRICITY' ? 'kWh' : 'khối'}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 pr-6 text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-blue-200 text-blue-600 hover:bg-blue-50"
                          onClick={() => handleSave(room.id)}
                        >
                          Lưu phòng này
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
    </div>
  );
};

export default MeterReadings;
