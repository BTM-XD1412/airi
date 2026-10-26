const { EmbedBuilder } = require('discord.js');
const { getGold, addGold, removeGold, formatGold } = require('../../utils/helpers');

const ITEMS = {
  nai: { name: 'Nai', emoji: '🦌' },
  bau: { name: 'Bầu', emoji: '🎃' },
  ga: { name: 'Gà', emoji: '🐓' },
  ca: { name: 'Cá', emoji: '🐟' },
  cua: { name: 'Cua', emoji: '🦀' },
  tom: { name: 'Tôm', emoji: '🦐' }
};

const ALIAS_MAP = {
  'nai': 'nai',
  'bau': 'bau', 'bầu': 'bau',
  'ga': 'ga', 'gà': 'ga',
  'ca': 'ca', 'cá': 'ca',
  'cua': 'cua',
  'tom': 'tom', 'tôm': 'tom'
};

module.exports = {
  name: 'baucua',
  description: 'Trò chơi Bầu Cua Tôm Cá dân gian',
  aliases: ['sbaucua', 'bc'],
  run: async (client, message, args) => {
    // Hỗ trợ cả 2 thứ tự: A!baucua <con_vat> <so_tien> hoặc A!baucua <so_tien> <con_vat>
    let rawChoice = args[0]?.toLowerCase();
    let amount = parseInt(args[1], 10);

    if (!isNaN(parseInt(args[0], 10)) && args[1]) {
      amount = parseInt(args[0], 10);
      rawChoice = args[1]?.toLowerCase();
    }

    const choiceKey = ALIAS_MAP[rawChoice];
    if (!choiceKey || !ITEMS[choiceKey]) {
      const embed = new EmbedBuilder()
        .setTitle('🦀 Hướng Dẫn Chơi Bầu Cua')
        .setDescription(
          '❌ Lựa chọn không hợp lệ!\n\n' +
          '**Các biểu tượng hợp lệ:**\n' +
          '🦌 `nai` | 🎃 `bau` | 🐓 `ga` | 🐟 `ca` | 🦀 `cua` | 🦐 `tom`\n\n' +
          '**Cú pháp:** `A!baucua <biểu_tượng> <số_gold>`\n*Ví dụ: `A!baucua cua 100`*'
        )
        .setColor(0xE74C3C);
      return message.channel.send({ embeds: [embed] });
    }

    if (isNaN(amount) || amount <= 0) {
      const embed = new EmbedBuilder()
        .setDescription('❌ Số tiền cược phải lớn hơn 0!')
        .setColor(0xE74C3C);
      return message.channel.send({ embeds: [embed] });
    }

    const uid = String(message.author.id);
    if (getGold(uid) < amount) {
      const embed = new EmbedBuilder()
        .setDescription('❌ Bạn không đủ Gold để cược số tiền này!')
        .setColor(0xE74C3C);
      return message.channel.send({ embeds: [embed] });
    }

    const keys = Object.keys(ITEMS);
    const r1 = keys[Math.floor(Math.random() * keys.length)];
    const r2 = keys[Math.floor(Math.random() * keys.length)];
    const r3 = keys[Math.floor(Math.random() * keys.length)];
    const rolled = [r1, r2, r3];

    // Đếm số lần biểu tượng người chơi chọn xuất hiện
    const matchCount = rolled.filter(k => k === choiceKey).length;
    const playerItem = ITEMS[choiceKey];

    const embed = new EmbedBuilder()
      .setTitle('🦀 Kết Quả Bầu Cua Tôm Cá')
      .addFields(
        {
          name: 'Bạn đặt cược',
          value: `${playerItem.emoji} **${playerItem.name}** — **${formatGold(amount)} Gold**`,
          inline: true
        },
        {
          name: 'Đĩa xúc xắc mở ra',
          value: `${ITEMS[r1].emoji} ${ITEMS[r2].emoji} ${ITEMS[r3].emoji}\n(**${ITEMS[r1].name}** - **${ITEMS[r2].name}** - **${ITEMS[r3].name}**)`,
          inline: true
        }
      );

    if (matchCount > 0) {
      const wonAmount = amount * matchCount;
      addGold(uid, wonAmount);
      embed.setColor(0x2ECC71);
      embed.setDescription(`🎉 **THẮNG LỚN!** Trúng **${matchCount}** mặt ${playerItem.emoji}! Bạn nhận được **+${formatGold(wonAmount)} Gold**.`);
    } else {
      removeGold(uid, amount);
      embed.setColor(0xE74C3C);
      embed.setDescription(`😢 **THUA RỒI!** Không có mặt ${playerItem.emoji} nào. Bạn bị trừ **-${formatGold(amount)} Gold**.`);
    }

    return message.channel.send({ embeds: [embed] });
  }
};
