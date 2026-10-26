# 🤖 Discord Game & Tiền Tệ Bot (Node.js - SQLite Database)

Dự án Bot Discord về Mini-games và Hệ thống Kinh tế (Gold) được chuyển thể sang Node.js (`discord.js v14`), và lưu trữ dữ liệu an toàn trên **SQLite** (`better-sqlite3`).

---

## 📁 Cấu trúc thư mục chi tiết

```text
airi/
├── commands/                   # Thư mục chứa các lệnh Prefix (phân loại theo nhóm)
│   ├── economy/                # Lệnh kinh tế & tài chính
│   │   ├── bal.js              # Xem số dư Gold
│   │   ├── daily.js            # Điểm danh nhận thưởng hàng ngày
│   │   ├── give.js             # Chuyển tiền (sử dụng SQLite Transaction)
│   │   └── top.js              # Bảng xếp hạng đại gia
│   ├── games/                  # Mini-games giải trí & cá cược
│   │   ├── baucua.js           # Bầu Cua Tôm Cá (ăn x1 đến x3)
│   │   ├── bj.js               # Game Xì Dách (Blackjack)
│   │   ├── caothap.js          # Cao Thấp (Đoán lá bài tiếp theo)
│   │   ├── daotao.js           # Đào vườn tìm táo may mắn
│   │   ├── dice.js             # Đổ xúc xắc đoán mặt 1-6 (ăn x5)
│   │   ├── flip.js             # Tung đồng xu Sấp / Ngửa (hoặc h/t)
│   │   ├── math.js             # Giải toán nhanh trong 15s
│   │   ├── race.js             # Đua thú sôi động (cược 1 ăn 4)
│   │   ├── rps.js              # Kéo - Búa - Bao (Oẳn tù tì)
│   │   ├── taixiu.js           # Tài Xỉu xúc xắc 3 viên
│   │   └── xoso.js             # Vé số may mắn 00-99 (ăn gấp 70 lần)
│   └── misc/                   # Lệnh tiện ích khác
│       └── help.js             # Bảng hướng dẫn lệnh
├── slash/                      # Thư mục chứa Slash Commands (Admin)
│   ├── addgold.js              # Slash Command /addgold
│   └── removegold.js           # Slash Command /removegold
├── events/                     # Quản lý các sự kiện Discord
│   └── discord/
│       └── ready.js            # Sự kiện bot online & đặt status xoay tua
├── utils/                      # Helper & Database & Cấu hình
│   ├── database.js             # Khởi tạo SQLite, Prepared Statements & Transactions
│   ├── helpers.js              # Các hàm bổ trợ logic, định dạng, quyền hạn
│   └── json/
│       └── config.json         # Danh sách prefixes của bot
├── .env                        # Biến môi trường chứa DISCORD_TOKEN bí mật
├── .env.example                # File mẫu cấu hình biến môi trường
├── data.sqlite                 # Cơ sở dữ liệu SQLite siêu tốc (WAL mode)
├── index.js                    # File khởi động chính, nạp đệ quy commands & events
├── package.json                # Dependencies và scripts
└── README.md                   # Tài liệu hướng dẫn
```

---

## 🗄️ Ưu điểm của Cơ sở Dữ liệu SQLite:
- **Tốc độ cực nhanh & An toàn (ACID):** Chạy chế độ **WAL (Write-Ahead Logging)**, không sợ bị corrupt hoặc mất dữ liệu khi bot tắt đột ngột.
- **SQLite Transaction:** Lệnh chuyển tiền `give` và giao dịch tiền tệ được bọc trong Transaction, triệt tiêu hoàn toàn lỗi trừ tiền 1 bên hoặc bug trùng lặp.
- **Tự động di chuyển dữ liệu (Auto-migrate):** Nếu bạn có dữ liệu cũ trong `data.json`, bot sẽ tự động nạp toàn bộ vào `data.sqlite` trong lần chạy đầu tiên.

---

## 🎮 Danh Sách Đầy Đủ Các Mini-games

| Mini-game | Cú pháp lệnh | Mô tả |
| :--- | :--- | :--- |
| **🦀 Bầu Cua** | `A!baucua <nai/bau/ga/ca/cua/tom> <tiền>` | Lắc 3 xúc xắc Bầu Cua Tôm Cá, trúng bao nhiêu mặt ăn bấy nhiêu lần tiền (tối đa x3). |
| **🃏 Cao Thấp** | `A!caothap <cao/thap> <tiền>` | Rút 1 lá bài, đoán lá bài tiếp theo cao hơn hay thấp hơn (hòa hoàn tiền). |
| **🏁 Đua Thú** | `A!race <tiền> <con_vật>` | Đua thú giữa Chó, Ngựa, Rùa, Thỏ, Hổ với đường đua sống động (cược 1 ăn 4). |
| **⛏️ Đào Táo** | `A!daotao` (hoặc `A!dig`) | Đào vườn tìm Táo Đỏ, Táo Xanh, Táo Vàng Hoàng Kim nhận Gold miễn phí (Cooldown 30s). |
| **🧠 Giải Toán** | `A!math` (hoặc `A!smath`) | Trả lời phép tính ngẫu nhiên trong 15 giây để nhận thưởng 150 - 300 Gold. |
| **🎟️ Vé Số** | `A!xoso <00-99> <tiền>` | Dự đoán 2 số cuối lồng cầu may mắn (00-99). Trúng độc đắc ăn gấp **70 lần** tiền cược! |
| **🎲 Xúc Xắc** | `A!dice <1-6> <tiền>` | Lắc 1 viên xúc xắc đoán mặt từ 1 đến 6 (cược 1 ăn 5). |
| **🎲 Tài Xỉu** | `A!taixiu <tai/xiu> <tiền>` | Lắc 3 viên xúc xắc, tổng >= 11 là Tài, < 11 là Xỉu. |
| **🃏 Blackjack** | `A!bj <tiền>` | Xì Dách so điểm với nhà cái (Blackjack 21 điểm ăn x1.5). |
| **🪙 Tung Đồng Xu** | `A!flip <tiền> <sap/ngua>` (hoặc `<h/t>`) | Đoán mặt đồng xu Sấp hoặc Ngửa. |
| **✂️ Kéo Búa Bao** | `A!rps <tiền> <bua/bao/keo>` | Oẳn tù tì ăn tiền cược với Bot. |

---

## 🛡️ Lệnh Quản Trị Viên (Admin - Slash Commands)

| Lệnh | Cú pháp | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- |
| **Cộng Gold** | `/addgold user:@user amount:<số_gold>` | Administrator / Admin Roles | Cộng thêm Gold cho người chơi |
| **Trừ Gold** | `/removegold user:@user amount:<số_gold>` | Administrator / Admin Roles | Trừ bớt Gold của người chơi |

---

## ⚙️ Cấu hình & Chạy Bot

1. Mở [.env](file:///d:/Files/airi/.env) điền Token Bot:
   ```env
   DISCORD_TOKEN=your_token_here
   ```
2. Khởi chạy bot:
   ```bash
   node .
   ```
