const { EmbedBuilder } = require('discord.js');
const { getGold, addGold, removeGold, formatGold } = require('../../utils/helpers');

module.exports = {
  name: 'taixiu',
  description: 'Cược xúc xắc Tài hoặc Xỉu',
  aliases: ['tx', 'staixiu'],
  run: async (client, message, args) => {
    // Hỗ trợ cả 2 thứ tự: A!taixiu <tai/xiu> <tien> hoặc A!taixiu <tien> <tai/xiu>
    let choice = args[0]?.toLowerCase();
    let amount = parseInt(args[1], 10);

    if (!isNaN(parseInt(args[0], 10)) && args[1]) {
      amount = parseInt(args[0], 10);
      choice = args[1]?.toLowerCase();
    }

    if (!choice || !['tai', 'xỉu', 'xiu'].includes(choice)) {
      const embed = new EmbedBuilder()
        .setDescription('❌ Lựa chọn không hợp lệ! Hãy dùng `tai` hoặc `xiu`.')
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

    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const d3 = Math.floor(Math.random() * 6) + 1;
    const total = d1 + d2 + d3;
    const outcome = total >= 11 ? 'tai' : 'xiu';
    const userChoice = choice === 'tai' ? 'tai' : 'xiu';

    const embed = new EmbedBuilder()
      .setTitle('🎲 Kết Quả Tài Xỉu')
      .setColor(0x3498DB)
      .addFields({
        name: 'Xúc xắc ra',
        value: `🎲 \`${d1}\` - \`${d2}\` - \`${d3}\` (Tổng: **${total}**)`
      });

    if (userChoice === outcome) {
      addGold(uid, amount);
      embed.setColor(0x2ECC71);
      embed.setDescription(`🎉 **THẮNG!** Bạn đoán đúng và nhận được **+${formatGold(amount)} Gold**.`);
    } else {
      removeGold(uid, amount);
      embed.setColor(0xE74C3C);
      embed.setDescription(`😢 **THUA!** Bạn đã mất **-${formatGold(amount)} Gold**.`);
    }

    return message.channel.send({ embeds: [embed] });
  }
};
