const { EmbedBuilder } = require('discord.js');
const { getGold, addGold, removeGold, formatGold } = require('../../utils/helpers');

module.exports = {
  name: 'bj',
  description: 'Chơi bài Blackjack với nhà cái',
  aliases: ['blackjack'],
  run: async (client, message, args) => {
    const amount = parseInt(args[0], 10);

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

    const drawCard = () => Math.floor(Math.random() * 11) + 1;
    const playerScore = drawCard() + drawCard();
    const dealerScore = drawCard() + drawCard();

    const embed = new EmbedBuilder()
      .setTitle('🃏 Blackjack (Xì Dách)')
      .setColor(0x9B59B6)
      .addFields(
        { name: 'Bài của bạn', value: `Điểm: **${playerScore}**`, inline: true },
        { name: 'Bài nhà cái', value: `Điểm ẩn: **${dealerScore}**`, inline: true }
      );

    if (playerScore === 21) {
      const prize = Math.floor(amount * 1.5);
      addGold(uid, prize);
      embed.setDescription(`🔥 **BLACKJACK!** Bạn ăn được **+${formatGold(prize)} Gold**!`);
      embed.setColor(0x2ECC71);
    } else if (playerScore > 21) {
      removeGold(uid, amount);
      embed.setDescription(`💥 **QUÁ QUYỀN!** Bạn thua và mất **-${formatGold(amount)} Gold**.`);
      embed.setColor(0xE74C3C);
    } else {
      if (playerScore > dealerScore || dealerScore > 21) {
        addGold(uid, amount);
        embed.setDescription(`🎉 Bạn có **${playerScore}** điểm, cao hơn nhà cái! Thắng **+${formatGold(amount)} Gold**.`);
        embed.setColor(0x2ECC71);
      } else {
        removeGold(uid, amount);
        embed.setDescription(`😢 Bạn có **${playerScore}** điểm, thấp hơn nhà cái (**${dealerScore}**). Mất **-${formatGold(amount)} Gold**.`);
        embed.setColor(0xE74C3C);
      }
    }

    return message.channel.send({ embeds: [embed] });
  }
};
