const { EmbedBuilder } = require('discord.js');
const { getGold, addGold, tryDeductBet, formatGold, validateBet } = require('../../utils/helpers');

module.exports = {
  name: 'bj',
  description: 'Chơi bài Blackjack với nhà cái',
  aliases: ['blackjack'],
  run: async (client, message, args) => {
    const rawAmount = args[0];
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

    const drawCard = () => Math.floor(Math.random() * 10) + 1;
    const playerScore = drawCard() + drawCard();
    const dealerScore = drawCard() + drawCard();

    const embed = new EmbedBuilder()
      .setTitle('🃏 Blackjack (Xì Dách)')
      .setColor(0x9B59B6)
      .addFields(
        { name: 'Bài của bạn', value: `Điểm: **${playerScore}**`, inline: true },
        { name: 'Bài nhà cái', value: `Điểm: **${dealerScore}**`, inline: true }
      );

    if (playerScore === 21) {
      const profit = Math.floor(amount * 1.5);
      addGold(uid, amount + profit); // Gốc + Thưởng Blackjack
      embed.setDescription(`🔥 **BLACKJACK!** Bạn ăn được **+${formatGold(profit)} Gold**!`);
      embed.setColor(0x2ECC71);
    } else if (playerScore > 21) {
      embed.setDescription(`💥 **QUÁ QUYỀN!** Bạn thua và mất **-${formatGold(amount)} Gold**.`);
      embed.setColor(0xE74C3C);
    } else if (dealerScore > 21) {
      addGold(uid, amount * 2);
      embed.setDescription(`🎉 Nhà cái bị quá 21 điểm (**${dealerScore}**)! Bạn thắng **+${formatGold(amount)} Gold**.`);
      embed.setColor(0x2ECC71);
    } else if (playerScore === dealerScore) {
      addGold(uid, amount); // Hòa (Push) hoàn cược
      embed.setDescription(`🤝 **HÒA (PUSH)!** Cả hai bên đều có **${playerScore}** điểm. Tiền cược đã được hoàn lại.`);
      embed.setColor(0xE67E22);
    } else if (playerScore > dealerScore) {
      addGold(uid, amount * 2);
      embed.setDescription(`🎉 Bạn có **${playerScore}** điểm, cao hơn nhà cái (**${dealerScore}**)! Thắng **+${formatGold(amount)} Gold**.`);
      embed.setColor(0x2ECC71);
    } else {
      embed.setDescription(`😢 Bạn có **${playerScore}** điểm, thấp hơn nhà cái (**${dealerScore}**). Mất **-${formatGold(amount)} Gold**.`);
      embed.setColor(0xE74C3C);
    }

    return message.channel.send({ embeds: [embed] });
  }
};
