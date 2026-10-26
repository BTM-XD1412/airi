const { EmbedBuilder } = require('discord.js');
const { getGold, addGold, removeGold, formatGold } = require('../../utils/helpers');

module.exports = {
  name: 'rps',
  description: 'Chơi Kéo - Búa - Bao',
  aliases: ['keobua', 'kbb', 'soantuti', 'oantuti', 'ott'],
  run: async (client, message, args) => {
    // Hỗ trợ cả 2 dạng: A!rps <so_tien> <bua/bao/keo> hoặc A!rps <bua/bao/keo> <so_tien>
    let amount = parseInt(args[0], 10);
    let choice = args[1]?.toLowerCase();

    if (isNaN(amount) && !isNaN(parseInt(args[1], 10))) {
      amount = parseInt(args[1], 10);
      choice = args[0]?.toLowerCase();
    }

    const mapping = { bua: 'búa', bao: 'bao', keo: 'kéo' };
    if (!choice || !mapping[choice]) {
      const embed = new EmbedBuilder()
        .setDescription('❌ Lựa chọn không hợp lệ! Hãy dùng `bua`, `bao` hoặc `keo`.')
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
      embed.setDescription('🤝 **HÒA!** Không mất tiền cược.');
      embed.setColor(0xE67E22);
    } else if (
      (choice === 'bua' && botChoice === 'keo') ||
      (choice === 'bao' && botChoice === 'bua') ||
      (choice === 'keo' && botChoice === 'bao')
    ) {
      addGold(uid, amount);
      embed.setDescription(`🎉 **THẮNG!** Nhận được **+${formatGold(amount)} Gold**.`);
      embed.setColor(0x2ECC71);
    } else {
      removeGold(uid, amount);
      embed.setDescription(`😢 **THUA!** Mất **-${formatGold(amount)} Gold**.`);
      embed.setColor(0xE74C3C);
    }

    return message.channel.send({ embeds: [embed] });
  }
};
