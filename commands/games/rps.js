const { EmbedBuilder } = require('discord.js');
const { getGold, addGold, tryDeductBet, formatGold, validateBet } = require('../../utils/helpers');

module.exports = {
  name: 'rps',
  description: 'Chơi Kéo - Búa - Bao',
  aliases: ['keobua', 'kbb', 'soantuti', 'oantuti', 'ott'],
  run: async (client, message, args) => {
    // Hỗ trợ cả 2 dạng: A!rps <so_tien> <bua/bao/keo> hoặc A!rps <bua/bao/keo> <so_tien>
    let rawAmount = args[0];
    let choice = args[1]?.toLowerCase();

    if (isNaN(parseInt(args[0], 10)) && !isNaN(parseInt(args[1], 10))) {
      rawAmount = args[1];
      choice = args[0]?.toLowerCase();
    }

    const mapping = { bua: 'búa', bao: 'bao', keo: 'kéo' };
    if (!choice || !mapping[choice]) {
      const embed = new EmbedBuilder()
        .setDescription('❌ Lựa chọn không hợp lệ! Hãy dùng `bua`, `bao` hoặc `keo`.')
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

    const rpsOptions = ['bua', 'bao', 'keo'];
    const botChoice = rpsOptions[Math.floor(Math.random() * rpsOptions.length)];

    const embed = new EmbedBuilder()
      .setTitle('✂️ Kéo - Búa - Bao')
      .setColor(0x3498DB)
      .addFields(
        { name: 'Bạn chọn', value: mapping[choice], inline: true },
        { name: 'Bot chọn', value: mapping[botChoice], inline: true }
      );

    if (choice === botChoice) {
      addGold(uid, amount); // Hoàn cược
      embed.setDescription('🤝 **HÒA!** Tiền cược đã được hoàn lại.');
      embed.setColor(0xE67E22);
    } else if (
      (choice === 'bua' && botChoice === 'keo') ||
      (choice === 'bao' && botChoice === 'bua') ||
      (choice === 'keo' && botChoice === 'bao')
    ) {
      addGold(uid, amount * 2);
      embed.setDescription(`🎉 **THẮNG!** Nhận được **+${formatGold(amount)} Gold**.`);
      embed.setColor(0x2ECC71);
    } else {
      embed.setDescription(`😢 **THUA!** Mất **-${formatGold(amount)} Gold**.`);
      embed.setColor(0xE74C3C);
    }

    return message.channel.send({ embeds: [embed] });
  }
};
