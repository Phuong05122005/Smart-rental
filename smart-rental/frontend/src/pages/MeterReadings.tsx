import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import toast from 'react-hot-toast';
import { getMeterReadings, saveMeterReading, type MeterReading } from '../services/meterReadingService';
import { getRooms, type Room } from '../services/roomService';
import { getHouses, type House } from '../services/houseService';

const MeterReadings = () => {
  const [houses, setHouses] = useState<House[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [readings, setReadings] = useState<MeterReading[]>([]);
  
  const [selectedHouse, setSelectedHouse] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [type, setType] = useState('ELECTRICITY'); // ELECTRICITY or WATER

  const [loading, setLoading] = useState(true);

  // Form input state for multiple rooms: roomId -> { old_index, new_index }
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
    try {
      setLoading(true);
      const [roomsData, readingsData] = await Promise.all([
        getRooms({ limit: 1000 }), // In a real app, filter by house_id
        getMeterReadings({ month, year, house_id: selectedHouse })
      ]);
      
      const houseRooms = roomsData.data.filter((r: any) => r.house_id === selectedHouse);
      setRooms(houseRooms);
      setReadings(readingsData);

      // Pre-fill inputs
      const newData: Record<string, { old_index: string, new_index: string }> = {};
      houseRooms.forEach(room => {
        const existing = readingsData.find(r => r.room_id === room.id && r.type === type);
        newData[room.id] = {
          old_index: existing ? existing.old_index.toString() : '',
          new_index: existing ? existing.new_index.toString() : ''
        };
      });
      setInputData(newData);
    } catch (err) {
      toast.error('Lỗi tải dữ liệu chỉ số');
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
      toast.error('Vui lòng nhập đầy đủ chỉ số');
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
    toast.success(`Đã lưu thành công ${success} phòng`);
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Ghi chỉ số Điện / Nước</h1>
        <Button onClick={handleSaveAll}>Lưu tất cả</Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap gap-4 mb-6 items-end">
          <div>
            <label className="block text-sm mb-1">Nhà trọ</label>
            <select className="border-gray-300 rounded-md" value={selectedHouse} onChange={e => setSelectedHouse(e.target.value)}>
              {houses.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Tháng</label>
            <select className="border-gray-300 rounded-md" value={month} onChange={e => setMonth(Number(e.target.value))}>
              {Array.from({length: 12}, (_, i) => i + 1).map(m => <option key={m} value={m}>Tháng {m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Năm</label>
            <Input type="number" className="w-24" value={year} onChange={e => setYear(Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm mb-1">Loại chỉ số</label>
            <select className="border-gray-300 rounded-md" value={type} onChange={e => setType(e.target.value)}>
              <option value="ELECTRICITY">Điện</option>
              <option value="WATER">Nước</option>
            </select>
          </div>
        </div>

        {!loading && rooms.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Phòng</TableHead>
                <TableHead>Chỉ số cũ</TableHead>
                <TableHead>Chỉ số mới</TableHead>
                <TableHead>Tiêu thụ</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <tbody>
              {rooms.map(room => {
                const data = inputData[room.id] || { old_index: '', new_index: '' };
                const consumption = (Number(data.new_index) || 0) - (Number(data.old_index) || 0);
                
                return (
                  <TableRow key={room.id}>
                    <TableCell className="font-bold">{room.room_number}</TableCell>
                    <TableCell>
                      <Input type="number" className="w-24" value={data.old_index} onChange={e => handleInputChange(room.id, 'old_index', e.target.value)} />
                    </TableCell>
                    <TableCell>
                      <Input type="number" className="w-24" value={data.new_index} onChange={e => handleInputChange(room.id, 'new_index', e.target.value)} />
                    </TableCell>
                    <TableCell>
                      <span className={consumption < 0 ? 'text-red-500 font-bold' : ''}>{consumption}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" onClick={() => handleSave(room.id)}>Lưu</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
};

export default MeterReadings;
