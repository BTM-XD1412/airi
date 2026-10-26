const { EmbedBuilder } = require('discord.js');
const { getGold, addGold, tryDeductBet, formatGold, validateBet } = require('../../utils/helpers');

module.exports = {
  name: 'flip',
  description: 'Tung đồng xu may mắn',
  aliases: ['coinflip', 'sfac', 'cf'],
  run: async (client, message, args) => {
    // Hỗ trợ cả 2 dạng: A!flip <so_tien> <sap/ngua> hoặc A!flip <sap/ngua> <so_tien>
    let rawAmount = args[0];
    let choice = args[1]?.toLowerCase();

    if (isNaN(parseInt(args[0], 10)) && !isNaN(parseInt(args[1], 10))) {
      rawAmount = args[1];
      choice = args[0]?.toLowerCase();
    }

    const choiceMap = {
      'sap': 'sap', 'sấp': 'sap', 's': 'sap', 'h': 'sap', 'head': 'sap', 'heads': 'sap',
      'ngua': 'ngua', 'ngửa': 'ngua', 'n': 'ngua', 't': 'ngua', 'tail': 'ngua', 'tails': 'ngua'
    };

    const finalChoice = choiceMap[choice];
    if (!finalChoice) {
      const embed = new EmbedBuilder()
        .setDescription('❌ Lựa chọn không hợp lệ! Hãy dùng `sap` (hoặc `h`) hoặc `ngua` (hoặc `t`).')
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

    const result = Math.random() < 0.5 ? 'sap' : 'ngua';
    const resultText = result === 'sap' ? 'Sấp' : 'Ngửa';

    const embed = new EmbedBuilder()
      .setTitle('🪙 Tung Đồng Xu')
      .setColor(0xF1C40F);

    if (finalChoice === result) {
      addGold(uid, amount * 2);
      embed.setDescription(`🎯 Đồng xu ra mặt **${resultText}**! Bạn thắng **+${formatGold(amount)} Gold**.`);
      embed.setColor(0x2ECC71);
    } else {
      embed.setDescription(`😢 Đồng xu ra mặt **${resultText}**! Bạn thua và mất **-${formatGold(amount)} Gold**.`);
      embed.setColor(0xE74C3C);
    }

    return message.channel.send({ embeds: [embed] });
  }
};
