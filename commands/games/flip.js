const { EmbedBuilder } = require('discord.js');
const { getGold, addGold, removeGold, formatGold } = require('../../utils/helpers');

module.exports = {
  name: 'flip',
  description: 'Tung đồng xu may mắn',
  aliases: ['coinflip', 'sfac', 'cf'],
  run: async (client, message, args) => {
    // Hỗ trợ cả 2 dạng: A!flip <so_tien> <sap/ngua> hoặc A!flip <sap/ngua> <so_tien>
    let amount = parseInt(args[0], 10);
    let choice = args[1]?.toLowerCase();

    if (isNaN(amount) && !isNaN(parseInt(args[1], 10))) {
      amount = parseInt(args[1], 10);
      choice = args[0]?.toLowerCase();
    }

    // Chuẩn hóa lựa chọn s/sap/h (heads) và n/ngua/t (tails)
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

    const result = Math.random() < 0.5 ? 'sap' : 'ngua';
    const resultText = result === 'sap' ? 'Sấp' : 'Ngửa';

    const embed = new EmbedBuilder()
      .setTitle('🪙 Tung Đồng Xu')
      .setColor(0xF1C40F);

    if (finalChoice === result) {
      addGold(uid, amount);
      embed.setDescription(`🎯 Đồng xu ra mặt **${resultText}**! Bạn thắng **+${formatGold(amount)} Gold**.`);
      embed.setColor(0x2ECC71);
    } else {
      removeGold(uid, amount);
      embed.setDescription(`😢 Đồng xu ra mặt **${resultText}**! Bạn thua và mất **-${formatGold(amount)} Gold**.`);
      embed.setColor(0xE74C3C);
    }

    return message.channel.send({ embeds: [embed] });
  }
};
