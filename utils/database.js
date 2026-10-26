const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'data.sqlite');
const DATA_JSON_PATH = path.join(__dirname, '..', 'data.json');

// Khởi tạo kết nối SQLite
const db = new Database(DB_PATH);

// Bật WAL mode (Write-Ahead Logging) giúp đọc ghi nhanh và chống xung đột
db.pragma('journal_mode = WAL');

// Tạo bảng users nếu chưa có
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    gold INTEGER NOT NULL DEFAULT 100,
    last_daily TEXT DEFAULT ''
  );
`);

// Tự động di chuyển dữ liệu cũ từ data.json vào SQLite nếu có
(function migrateFromJson() {
  try {
    if (fs.existsSync(DATA_JSON_PATH)) {
      const raw = fs.readFileSync(DATA_JSON_PATH, 'utf-8');
      const jsonData = JSON.parse(raw);
      const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;

      if (userCount === 0 && Object.keys(jsonData).length > 0) {
        console.log('[ SQLite ] Đang di chuyển dữ liệu từ data.json sang data.sqlite...');
        const insert = db.prepare('INSERT OR IGNORE INTO users (user_id, gold, last_daily) VALUES (?, ?, ?)');
        const insertMany = db.transaction((users) => {
          for (const [uid, info] of Object.entries(users)) {
            insert.run(String(uid), info.gold || 100, info.last_daily || '');
          }
        });
        insertMany(jsonData);
        console.log('[ SQLite ] Đã hoàn tất di chuyển dữ liệu thành công!');
      }
    }
  } catch (err) {
    console.error('[ SQLite ] Lỗi di chuyển dữ liệu từ data.json:', err.message);
  }
})();

// Pre-compiled prepared statements để tối ưu hiệu năng
const stmts = {
  getUser: db.prepare('SELECT user_id, gold, last_daily FROM users WHERE user_id = ?'),
  insertUser: db.prepare("INSERT OR IGNORE INTO users (user_id, gold, last_daily) VALUES (?, 100, '')"),
  addGold: db.prepare('UPDATE users SET gold = gold + ? WHERE user_id = ?'),
  removeGold: db.prepare('UPDATE users SET gold = MAX(0, gold - ?) WHERE user_id = ?'),
  setGold: db.prepare('UPDATE users SET gold = ? WHERE user_id = ?'),
  setDaily: db.prepare('UPDATE users SET last_daily = ? WHERE user_id = ?'),
  getTop: db.prepare('SELECT user_id, gold FROM users ORDER BY gold DESC LIMIT ?'),
  getAll: db.prepare('SELECT user_id, gold, last_daily FROM users')
};

/**
 * Lấy thông tin người dùng từ SQLite (tự động tạo mới với 100 gold nếu chưa có)
 * @param {string|number} userId 
 * @returns {{ user_id: string, gold: number, last_daily: string }}
 */
function getUser(userId) {
  const uid = String(userId);
  let user = stmts.getUser.get(uid);
  if (!user) {
    stmts.insertUser.run(uid);
    user = { user_id: uid, gold: 100, last_daily: '' };
  }
  return user;
}

/**
 * Lấy số dư Gold của người dùng
 * @param {string|number} userId 
 * @returns {number}
 */
function getGold(userId) {
  return getUser(userId).gold;
}

/**
 * Cộng thêm Gold cho người dùng
 * @param {string|number} userId 
 * @param {number} amount 
 * @returns {number} Số dư mới sau khi cộng
 */
function addGold(userId, amount) {
  const uid = String(userId);
  getUser(uid); // Đảm bảo đã có bản ghi
  stmts.addGold.run(amount, uid);
  return getGold(uid);
}

/**
 * Trừ bớt Gold của người dùng (tối thiểu là 0)
 * @param {string|number} userId 
 * @param {number} amount 
 * @returns {number} Số dư mới sau khi trừ
 */
function removeGold(userId, amount) {
  const uid = String(userId);
  getUser(uid);
  stmts.removeGold.run(amount, uid);
  return getGold(uid);
}

/**
 * Cập nhật ngày điểm danh hàng ngày
 * @param {string|number} userId 
 * @param {string} dateStr YYYY-MM-DD
 */
function setDaily(userId, dateStr) {
  const uid = String(userId);
  getUser(uid);
  stmts.setDaily.run(dateStr, uid);
}

/**
 * Chuyển tiền an toàn giữa 2 người dùng bằng SQLite Transaction
 * @param {string|number} fromUserId 
 * @param {string|number} toUserId 
 * @param {number} amount 
 * @returns {boolean}
 */
const transferGold = db.transaction((fromUserId, toUserId, amount) => {
  const fromUid = String(fromUserId);
  const toUid = String(toUserId);
  const sender = getUser(fromUid);
  getUser(toUid);

  if (sender.gold < amount) {
    return false;
  }

  stmts.removeGold.run(amount, fromUid);
  stmts.addGold.run(amount, toUid);
  return true;
});

/**
 * Lấy danh sách top đại gia theo số Gold
 * @param {number} limit 
 * @returns {Array<{ user_id: string, gold: number }>}
 */
function getLeaderboard(limit = 10) {
  return stmts.getTop.all(limit);
}

/**
 * Tương thích ngược: Lấy object dạng { [uid]: { gold, last_daily } }
 */
function loadData() {
  const rows = stmts.getAll.all();
  const obj = {};
  for (const row of rows) {
    obj[row.user_id] = { gold: row.gold, last_daily: row.last_daily };
  }
  return obj;
}

/**
 * Tương thích ngược: Lưu object vào SQLite
 */
const saveData = db.transaction((data) => {
  const upsert = db.prepare(`
    INSERT INTO users (user_id, gold, last_daily) 
    VALUES (?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET 
      gold = excluded.gold,
      last_daily = excluded.last_daily
  `);
  for (const [uid, info] of Object.entries(data)) {
    upsert.run(String(uid), info.gold || 100, info.last_daily || '');
  }
});

/**
 * Tương thích ngược: getUserData
 */
function getUserData(userId) {
  const user = getUser(userId);
  return {
    [user.user_id]: {
      gold: user.gold,
      last_daily: user.last_daily
    }
  };
}

module.exports = {
  db,
  getUser,
  getGold,
  addGold,
  removeGold,
  setDaily,
  transferGold,
  getLeaderboard,
  loadData,
  saveData,
  getUserData
};
