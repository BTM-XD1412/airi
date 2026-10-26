const { EmbedBuilder } = require('discord.js');
const { getGold, addGold, tryDeductBet, formatGold, validateBet } = require('../../utils/helpers');

module.exports = {
  name: 'taixiu',
  description: 'Cược xúc xắc Tài hoặc Xỉu',
  aliases: ['tx', 'staixiu'],
  run: async (client, message, args) => {
    // Hỗ trợ cả 2 thứ tự: A!taixiu <tai/xiu> <tien> hoặc A!taixiu <tien> <tai/xiu>
    let choice = args[0]?.toLowerCase();
    let rawAmount = args[1];

    if (!isNaN(parseInt(args[0], 10)) && args[1]) {
      rawAmount = args[0];
      choice = args[1]?.toLowerCase();
    }

    if (!choice || !['tai', 'xỉu', 'xiu'].includes(choice)) {
      const embed = new EmbedBuilder()
        .setDescription('❌ Lựa chọn không hợp lệ! Hãy dùng `tai` hoặc `xiu`.')
        .setColor(0xE74C3C);
      return message.channel.send({ embeds: [embed] });
    }

    const uid = String(message.author.id);
    const userGold = getGold(uid);
    const validation = validateBet(rawAmount, userGold);

    if (!validation.valid) {
      const embed = new EmbedBuilder()
        .setDescription(validation.error)
        .setColor(0xE74C3C);
      return message.channel.send({ embeds: [embed] });
    }

    const amount = validation.amount;

    if (!tryDeductBet(uid, amount)) {
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
      addGold(uid, amount * 2); // Hoàn cược + lãi
      embed.setColor(0x2ECC71);
      embed.setDescription(`🎉 **THẮNG!** Bạn đoán đúng và nhận được **+${formatGold(amount)} Gold**.`);
    } else {
      embed.setColor(0xE74C3C);
      embed.setDescription(`😢 **THUA!** Bạn đã mất **-${formatGold(amount)} Gold**.`);
    }

    return message.channel.send({ embeds: [embed] });
  }
};
