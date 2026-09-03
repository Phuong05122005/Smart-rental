const fs = require('fs');
let schema = fs.readFileSync('../database/prisma/schema.prisma', 'utf8');

schema = schema.replace('  STAFF\n}', '  STAFF\n  TENANT\n}');
schema = schema.replace('  STAFF\r\n}', '  STAFF\r\n  TENANT\r\n}');

schema = schema.replace('  CANCELLED\n}', '  CANCELLED\n}\n\nenum InvoiceStatus {\n  UNPAID\n  PAID\n  OVERDUE\n}\n\nenum RequestStatus {\n  PENDING\n  IN_PROGRESS\n  RESOLVED\n  REJECTED\n}');
schema = schema.replace('  CANCELLED\r\n}', '  CANCELLED\r\n}\r\n\r\nenum InvoiceStatus {\r\n  UNPAID\r\n  PAID\r\n  OVERDUE\r\n}\r\n\r\nenum RequestStatus {\r\n  PENDING\r\n  IN_PROGRESS\r\n  RESOLVED\r\n  REJECTED\r\n}');

schema = schema.replace('  audit_logs    AuditLog[]     @relation("UserAuditLogs")', '  audit_logs    AuditLog[]     @relation("UserAuditLogs")\n  tenant        Tenant?');

schema = schema.replace('  contracts Contract[]\n\n  @@map("rooms")', '  contracts Contract[]\n  maintenance_requests MaintenanceRequest[]\n\n  @@map("rooms")');
schema = schema.replace('  contracts Contract[]\r\n\r\n  @@map("rooms")', '  contracts Contract[]\r\n  maintenance_requests MaintenanceRequest[]\r\n\r\n  @@map("rooms")');

schema = schema.replace('  email           String?\n  created_at', '  email           String?\n  user_id         String?  @unique\n  created_at');
schema = schema.replace('  email           String?\r\n  created_at', '  email           String?\r\n  user_id         String?  @unique\r\n  created_at');

schema = schema.replace('  contracts Contract[]\n\n  @@map("tenants")', '  contracts Contract[]\n  maintenance_requests MaintenanceRequest[]\n  user                 User?      @relation(fields: [user_id], references: [id], onDelete: SetNull)\n\n  @@map("tenants")');
schema = schema.replace('  contracts Contract[]\r\n\r\n  @@map("tenants")', '  contracts Contract[]\r\n  maintenance_requests MaintenanceRequest[]\r\n  user                 User?      @relation(fields: [user_id], references: [id], onDelete: SetNull)\r\n\r\n  @@map("tenants")');

schema = schema.replace('  room   Room   @relation(fields: [room_id], references: [id], onDelete: Restrict)\n\n  @@index([tenant_id])', '  room   Room   @relation(fields: [room_id], references: [id], onDelete: Restrict)\n  invoices Invoice[]\n\n  @@index([tenant_id])');
schema = schema.replace('  room   Room   @relation(fields: [room_id], references: [id], onDelete: Restrict)\r\n\r\n  @@index([tenant_id])', '  room   Room   @relation(fields: [room_id], references: [id], onDelete: Restrict)\r\n  invoices Invoice[]\r\n\r\n  @@index([tenant_id])');

const additional = `
model Invoice {
  id          String        @id @default(uuid())
  contract_id String
  title       String
  amount      Decimal       @db.Decimal(10, 2)
  issue_date  DateTime      @default(now())
  due_date    DateTime
  status      InvoiceStatus @default(UNPAID)
  description String?       @db.Text
  created_at  DateTime      @default(now())
  updated_at  DateTime      @updatedAt

  contract Contract @relation(fields: [contract_id], references: [id], onDelete: Cascade)

  @@index([contract_id])
  @@map("invoices")
}

model MaintenanceRequest {
  id          String        @id @default(uuid())
  tenant_id   String
  room_id     String
  title       String
  description String        @db.Text
  status      RequestStatus @default(PENDING)
  created_at  DateTime      @default(now())
  updated_at  DateTime      @updatedAt

  tenant Tenant @relation(fields: [tenant_id], references: [id], onDelete: Cascade)
  room   Room   @relation(fields: [room_id], references: [id], onDelete: Cascade)

  @@index([tenant_id])
  @@index([room_id])
  @@map("maintenance_requests")
}
`;

schema = schema + '\n' + additional;
fs.writeFileSync('../database/prisma/schema.prisma', schema);
