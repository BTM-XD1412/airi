const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  description: 'Hiển thị danh sách các lệnh của bot',
  aliases: ['h', 'huongdan'],
  run: async (client, message, args) => {
    const embed = new EmbedBuilder()
      .setTitle('📜 Hướng Dẫn Sử Dụng Bot Game & Tiền Tệ')
      .setDescription('Danh sách đầy đủ các lệnh hiện có của bot (Prefix: `A!`, `a!`, `A ` hoặc tag `@Bot`):')
      .setColor(0x3498DB)
      .addFields(
        {
          name: '🎮 Mini-games & Cá Cược May Mắn',
          value:
            '🦀 `A!baucua <biểu_tượng> <tiền>` - Lắc Bầu Cua Tôm Cá (ăn x1 - x3)\n' +
            '🃏 `A!caothap <cao/thap> <tiền>` - Đoán lá bài tiếp theo Cao hay Thấp\n' +
            '🏁 `A!race <tiền> <con_vật>` - Đua thú gay cấn (cược 1 ăn 4)\n' +
            '🎲 `A!dice <1-6> <tiền>` - Lắc 1 viên xúc xắc đoán mặt (cược 1 ăn 5)\n' +
            '🎟️ `A!xoso <00-99> <tiền>` - Mua vé số lồng cầu may mắn (ăn gấp 70 lần)\n' +
            '🎲 `A!taixiu <tai/xiu> <tiền>` - Cược xúc xắc Tài hoặc Xỉu\n' +
            '🃏 `A!bj <tiền>` - Chơi bài Blackjack (Xì Dách) với nhà cái\n' +
            '🪙 `A!flip <tiền> <sap/ngua>` - Tung đồng xu may mắn (hoặc `h/t`)\n' +
            '✂️ `A!rps <tiền> <bua/bao/keo>` - Chơi Kéo - Búa - Bao (hoặc `oantuti`)'
        },
        {
          name: '🧠 Kiếm Gold Miễn Phí (Đơn / Trí Tuệ)',
          value:
            '⛏️ `A!daotao` (hoặc `A!dig`) - Đào vườn tìm táo may mắn nhận Gold\n' +
            '🧠 `A!math` - Giải toán nhanh như chớp nhận thưởng Gold'
        },
        {
          name: '💰 Tài Chính & Kinh Tế',
          value:
            '💳 `A!bal` (hoặc `A!balance`) - Kiểm tra số dư Gold\n' +
            '🎁 `A!daily` - Điểm danh nhận thưởng 500 Gold mỗi ngày\n' +
            '🏆 `A!top` (hoặc `A!leaderboard`) - Bảng xếp hạng đại gia server\n' +
            '💸 `A!give <@user> <tiền>` - Chuyển Gold cho bạn bè'
        },
        {
          name: '🛡️ Quản Trị Viên',
          value:
            '➕ `/addgold <user> <amount>` - Cộng Gold cho người chơi\n' +
            '➖ `/removegold <user> <amount>` - Trừ Gold của người chơi'
        }
      )
      .setFooter({ text: 'Chúc bạn chơi game vui vẻ và sớm trở thành đại gia server!' });

    return message.channel.send({ embeds: [embed] });
  }
};
