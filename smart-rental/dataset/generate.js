const fs = require('fs');
const path = require('path');
const crypto = require('crypto'); const uuidv4 = () => crypto.randomUUID();

const generateData = () => {
  const users = [
    { id: uuidv4(), username: 'admin', full_name: 'Quản trị viên', role: 'ADMIN', status: 'ACTIVE' },
    { id: uuidv4(), username: 'landlord1', full_name: 'Trần Thị Mai', role: 'LANDLORD', status: 'ACTIVE' },
    { id: uuidv4(), username: 'landlord2', full_name: 'Lê Hoàng Nam', role: 'LANDLORD', status: 'ACTIVE' },
    { id: uuidv4(), username: 'staff1', full_name: 'Nguyễn Văn An', role: 'STAFF', status: 'ACTIVE' },
    { id: uuidv4(), username: 'staff2', full_name: 'Phạm Thanh Bình', role: 'STAFF', status: 'LOCKED' },
  ];

  const rooms = [];
  const roomTypes = ['Phòng Đơn', 'Phòng Đôi', 'Studio', 'Căn Hộ Mini'];
  let roomNumber = 101;
  for (let i = 0; i < 50; i++) {
    let status = 'RENTED';
    if (i < 10) status = 'AVAILABLE';
    else if (i >= 45) status = 'MAINTENANCE';

    rooms.push({
      id: uuidv4(),
      room_number: `${roomNumber++}`,
      room_type: roomTypes[Math.floor(Math.random() * roomTypes.length)],
      price: (Math.floor(Math.random() * 5) + 3) * 1000000,
      area: Math.floor(Math.random() * 20) + 15,
      status,
      description: 'Phòng đầy đủ nội thất cơ bản'
    });
  }

  const tenants = [];
  const firstNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng'];
  const midNames = ['Văn', 'Thị', 'Hoàng', 'Thanh', 'Minh', 'Ngọc', 'Hữu', 'Bảo', 'Thảo', 'Gia'];
  const lastNames = ['An', 'Bình', 'Cường', 'Dương', 'Hải', 'Hưng', 'Linh', 'Mai', 'Nam', 'Nhi', 'Phương', 'Quân', 'Thành', 'Thủy', 'Trang'];
  for (let i = 0; i < 30; i++) {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const mn = midNames[Math.floor(Math.random() * midNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    tenants.push({
      id: uuidv4(),
      full_name: `${fn} ${mn} ${ln}`,
      identity_number: `00${Math.floor(Math.random() * 10000000000).toString().padStart(10, '0')}`,
      phone: `09${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
      email: `tenant${i}@example.com`
    });
  }

  const contracts = [];
  // We have 35 RENTED rooms, we need 30 contracts (maybe some rented rooms share contracts or something, but let's just make 30 ACTIVE contracts for 30 RENTED rooms)
  const rentedRooms = rooms.filter(r => r.status === 'RENTED');
  for (let i = 0; i < 30; i++) {
    const room = rentedRooms[i];
    const tenant = tenants[i];
    
    // Some expiring soon
    let status = 'ACTIVE';
    const now = new Date();
    const start = new Date();
    start.setMonth(now.getMonth() - Math.floor(Math.random() * 6) - 1);
    
    const end = new Date(start);
    end.setMonth(start.getMonth() + 6); // 6 months contract
    
    // Make 5 contracts expire soon (within next 15 days)
    if (i < 5) {
      end.setTime(now.getTime() + (Math.floor(Math.random() * 15) + 1) * 86400000);
    }
    // Make 2 EXPIRED
    if (i >= 28) {
      status = 'EXPIRED';
      end.setTime(now.getTime() - 86400000 * 10);
      room.status = 'AVAILABLE'; // Fix room status if expired
    }

    contracts.push({
      id: uuidv4(),
      tenant_id: tenant.id,
      room_id: room.id,
      start_date: start.toISOString(),
      end_date: end.toISOString(),
      rent_price: room.price,
      deposit: room.price,
      status
    });
  }

  // Write CSV helper
  const writeCSV = (filename, data) => {
    if (data.length === 0) return;
    const header = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).map(v => `"${v}"`).join(','));
    fs.writeFileSync(path.join(__dirname, filename), [header, ...rows].join('\n'));
  };

  writeCSV('users.csv', users);
  writeCSV('rooms.csv', rooms);
  writeCSV('tenants.csv', tenants);
  writeCSV('contracts.csv', contracts);

  // Generate fake Audit Logs (50)
  const auditLogs = [];
  const actions = ['CREATE_ROOM', 'UPDATE_ROOM', 'CREATE_TENANT', 'CREATE_CONTRACT', 'LOGIN', 'LOCK_USER'];
  for(let i=0; i<50; i++) {
    const action = actions[Math.floor(Math.random() * actions.length)];
    const u = users[Math.floor(Math.random() * users.length)];
    auditLogs.push({
      id: uuidv4(),
      actor_id: u.id,
      action: action,
      target_type: action.includes('ROOM') ? 'ROOM' : action.includes('TENANT') ? 'TENANT' : 'USER',
      target_id: uuidv4(),
      old_value: '{}',
      new_value: '{"status": "test"}',
      created_at: new Date(Date.now() - Math.random() * 10000000000).toISOString()
    });
  }
  writeCSV('audit_logs.csv', auditLogs);

  // Notifications (20)
  const notifs = [];
  for(let i=0; i<20; i++) {
    const u = users[Math.floor(Math.random() * users.length)];
    notifs.push({
      id: uuidv4(),
      user_id: u.id,
      title: 'Thông báo hệ thống',
      content: 'Hợp đồng sắp hết hạn...',
      type: 'SYSTEM',
      is_read: Math.random() > 0.5 ? 'true' : 'false',
      created_at: new Date().toISOString()
    });
  }
  writeCSV('notifications.csv', notifs);

  fs.writeFileSync(path.join(__dirname, 'README.md'), '# Smart Rental Dataset\n\nThis dataset provides a realistic simulation of a rental management system in Vietnam.\n- 5 Users\n- 50 Rooms\n- 30 Tenants\n- 30 Contracts\n- 50 Audit Logs\n- 20 Notifications\n');
  
  console.log('Dataset generated successfully in dataset/ directory.');
};

generateData();
