const { EmbedBuilder } = require('discord.js');
const { getGold, addGold, removeGold, formatGold } = require('../../utils/helpers');

const RANKS = [
  { name: '2', value: 2 },
  { name: '3', value: 3 },
  { name: '4', value: 4 },
  { name: '5', value: 5 },
  { name: '6', value: 6 },
  { name: '7', value: 7 },
  { name: '8', value: 8 },
  { name: '9', value: 9 },
  { name: '10', value: 10 },
  { name: 'J', value: 11 },
  { name: 'Q', value: 12 },
  { name: 'K', value: 13 },
  { name: 'A', value: 14 }
];

const SUITS = ['♠️', '♥️', '♦️', '♣️'];

function getRandomCard() {
  const rank = RANKS[Math.floor(Math.random() * RANKS.length)];
  const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
  return {
    display: `[ ${rank.name}${suit} ]`,
    name: rank.name,
    value: rank.value
  };
}

module.exports = {
  name: 'caothap',
  description: 'Đoán lá bài tiếp theo Cao hơn hay Thấp hơn',
  aliases: ['scaothap', 'hl', 'highlow'],
  run: async (client, message, args) => {
    // Hỗ trợ cả 2 thứ tự: A!caothap <cao/thap> <tien> hoặc A!caothap <tien> <cao/thap>
    let choice = args[0]?.toLowerCase();
    let amount = parseInt(args[1], 10);

    if (!isNaN(parseInt(args[0], 10)) && args[1]) {
      amount = parseInt(args[0], 10);
      choice = args[1]?.toLowerCase();
    }

    const validChoices = {
      'cao': 'cao', 'c': 'cao', 'high': 'cao', 'h': 'cao',
      'thap': 'thap', 'thấp': 'thap', 't': 'thap', 'low': 'thap', 'l': 'thap'
    };

    const parsedChoice = validChoices[choice];
    if (!parsedChoice) {
      const embed = new EmbedBuilder()
        .setTitle('🃏 Hướng Dẫn Chơi Cao Thấp')
        .setDescription(
          '❌ Lựa chọn không hợp lệ!\n\n' +
          '**Lựa chọn:** `cao` (hoặc `c`) hoặc `thap` (hoặc `t`)\n' +
          '**Cú pháp:** `A!caothap <cao/thap> <số_gold>`\n*Ví dụ: `A!caothap cao 100`*'
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

    const card1 = getRandomCard();
    let card2 = getRandomCard();
    while (card1.display === card2.display) {
      card2 = getRandomCard();
    }

    const choiceName = parsedChoice === 'cao' ? '🔼 Cao Hơn' : '🔽 Thấp Hơn';

    const embed = new EmbedBuilder()
      .setTitle('🃏 Game Bài Cao Thấp')
      .addFields(
        { name: 'Lá bài hiện tại', value: `🃏 **${card1.display}**`, inline: true },
        { name: 'Lá bài rút ra', value: `🎴 **${card2.display}**`, inline: true },
        { name: 'Bạn chọn', value: `**${choiceName}** (Cược: **${formatGold(amount)} Gold**)`, inline: false }
      );

    if (card2.value === card1.value) {
      embed.setColor(0xE67E22);
      embed.setDescription(`🤝 **HÒA!** Hai lá bài có cùng giá trị điểm (${card1.name}). Tiền cược được hoàn lại.`);
    } else if (
      (parsedChoice === 'cao' && card2.value > card1.value) ||
      (parsedChoice === 'thap' && card2.value < card1.value)
    ) {
      addGold(uid, amount);
      embed.setColor(0x2ECC71);
      embed.setDescription(`🎉 **CHÍNH XÁC!** Bạn đoán đúng lá bài tiếp theo và nhận được **+${formatGold(amount)} Gold**.`);
    } else {
      removeGold(uid, amount);
      embed.setColor(0xE74C3C);
      embed.setDescription(`😢 **SAI RỒI!** Lá bài tiếp theo không đúng với dự đoán. Bạn mất **-${formatGold(amount)} Gold**.`);
    }

    return message.channel.send({ embeds: [embed] });
  }
};
