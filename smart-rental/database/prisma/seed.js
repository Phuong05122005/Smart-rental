"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var csv_parser_1 = __importDefault(require("csv-parser"));
var prisma = new client_1.PrismaClient();
var parseCSV = function (filePath) {
    return new Promise(function (resolve, reject) {
        var results = [];
        fs_1.default.createReadStream(filePath)
            .pipe((0, csv_parser_1.default)())
            .on('data', function (data) { return results.push(data); })
            .on('end', function () { return resolve(results); })
            .on('error', function (error) { return reject(error); });
    });
};
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var datasetPath, users, rooms, tenants, contracts, notifications, auditLogs, _i, users_1, u, password_hash, _a, rooms_1, r, _b, tenants_1, t, _c, contracts_1, c, _d, notifications_1, n, _e, auditLogs_1, a;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    console.log('Bắt đầu đọc dữ liệu từ Dataset...');
                    datasetPath = path_1.default.join(__dirname, '../../dataset');
                    return [4 /*yield*/, parseCSV(path_1.default.join(datasetPath, 'users.csv'))];
                case 1:
                    users = _f.sent();
                    return [4 /*yield*/, parseCSV(path_1.default.join(datasetPath, 'rooms.csv'))];
                case 2:
                    rooms = _f.sent();
                    return [4 /*yield*/, parseCSV(path_1.default.join(datasetPath, 'tenants.csv'))];
                case 3:
                    tenants = _f.sent();
                    return [4 /*yield*/, parseCSV(path_1.default.join(datasetPath, 'contracts.csv'))];
                case 4:
                    contracts = _f.sent();
                    return [4 /*yield*/, parseCSV(path_1.default.join(datasetPath, 'notifications.csv'))];
                case 5:
                    notifications = _f.sent();
                    return [4 /*yield*/, parseCSV(path_1.default.join(datasetPath, 'audit_logs.csv'))];
                case 6:
                    auditLogs = _f.sent();
                    console.log('Xóa dữ liệu cũ (Reset)...');
                    return [4 /*yield*/, prisma.auditLog.deleteMany({})];
                case 7:
                    _f.sent();
                    return [4 /*yield*/, prisma.notification.deleteMany({})];
                case 8:
                    _f.sent();
                    return [4 /*yield*/, prisma.contract.deleteMany({})];
                case 9:
                    _f.sent();
                    return [4 /*yield*/, prisma.tenant.deleteMany({})];
                case 10:
                    _f.sent();
                    return [4 /*yield*/, prisma.room.deleteMany({})];
                case 11:
                    _f.sent();
                    return [4 /*yield*/, prisma.user.deleteMany({})];
                case 12:
                    _f.sent();
                    console.log('Seeding Users...');
                    _i = 0, users_1 = users;
                    _f.label = 13;
                case 13:
                    if (!(_i < users_1.length)) return [3 /*break*/, 16];
                    u = users_1[_i];
                    password_hash = '$2a$10$X7x2E3L9lT3B1B9sR7.o6u9B2.7M6o1Q9Q5N4/9U6G1A4V8B2.o6u';
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                id: u.id,
                                username: u.username,
                                full_name: u.full_name,
                                password_hash: password_hash,
                                role: u.role,
                                status: u.status,
                            }
                        })];
                case 14:
                    _f.sent();
                    _f.label = 15;
                case 15:
                    _i++;
                    return [3 /*break*/, 13];
                case 16:
                    console.log('Seeding Rooms...');
                    _a = 0, rooms_1 = rooms;
                    _f.label = 17;
                case 17:
                    if (!(_a < rooms_1.length)) return [3 /*break*/, 20];
                    r = rooms_1[_a];
                    return [4 /*yield*/, prisma.room.create({
                            data: {
                                id: r.id,
                                room_number: r.room_number,
                                room_type: r.room_type,
                                price: Number(r.price),
                                area: Number(r.area),
                                status: r.status,
                                description: r.description
                            }
                        })];
                case 18:
                    _f.sent();
                    _f.label = 19;
                case 19:
                    _a++;
                    return [3 /*break*/, 17];
                case 20:
                    console.log('Seeding Tenants...');
                    _b = 0, tenants_1 = tenants;
                    _f.label = 21;
                case 21:
                    if (!(_b < tenants_1.length)) return [3 /*break*/, 24];
                    t = tenants_1[_b];
                    return [4 /*yield*/, prisma.tenant.create({
                            data: {
                                id: t.id,
                                full_name: t.full_name,
                                identity_number: t.identity_number,
                                phone: t.phone,
                                email: t.email
                            }
                        })];
                case 22:
                    _f.sent();
                    _f.label = 23;
                case 23:
                    _b++;
                    return [3 /*break*/, 21];
                case 24:
                    console.log('Seeding Contracts...');
                    _c = 0, contracts_1 = contracts;
                    _f.label = 25;
                case 25:
                    if (!(_c < contracts_1.length)) return [3 /*break*/, 28];
                    c = contracts_1[_c];
                    return [4 /*yield*/, prisma.contract.create({
                            data: {
                                id: c.id,
                                tenant_id: c.tenant_id,
                                room_id: c.room_id,
                                start_date: new Date(c.start_date),
                                end_date: new Date(c.end_date),
                                rent_price: Number(c.rent_price),
                                deposit: Number(c.deposit),
                                status: c.status,
                            }
                        })];
                case 26:
                    _f.sent();
                    _f.label = 27;
                case 27:
                    _c++;
                    return [3 /*break*/, 25];
                case 28:
                    console.log('Seeding Notifications...');
                    _d = 0, notifications_1 = notifications;
                    _f.label = 29;
                case 29:
                    if (!(_d < notifications_1.length)) return [3 /*break*/, 32];
                    n = notifications_1[_d];
                    return [4 /*yield*/, prisma.notification.create({
                            data: {
                                id: n.id,
                                user_id: n.user_id,
                                title: n.title,
                                content: n.content,
                                type: n.type,
                                is_read: n.is_read === 'true',
                                created_at: new Date(n.created_at)
                            }
                        })];
                case 30:
                    _f.sent();
                    _f.label = 31;
                case 31:
                    _d++;
                    return [3 /*break*/, 29];
                case 32:
                    console.log('Seeding Audit Logs...');
                    _e = 0, auditLogs_1 = auditLogs;
                    _f.label = 33;
                case 33:
                    if (!(_e < auditLogs_1.length)) return [3 /*break*/, 36];
                    a = auditLogs_1[_e];
                    return [4 /*yield*/, prisma.auditLog.create({
                            data: {
                                id: a.id,
                                actor_id: a.actor_id,
                                action: a.action,
                                target_type: a.target_type,
                                target_id: a.target_id,
                                old_value: a.old_value,
                                new_value: a.new_value,
                                created_at: new Date(a.created_at)
                            }
                        })];
                case 34:
                    _f.sent();
                    _f.label = 35;
                case 35:
                    _e++;
                    return [3 /*break*/, 33];
                case 36:
                    console.log('✅ Đã Seed toàn bộ 50 Rooms, 30 Tenants, 30 Contracts, 5 Users, Notifications, Audit Logs thành công!');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error(e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
