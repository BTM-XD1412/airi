const { EmbedBuilder } = require('discord.js');
const { getGold, addGold, removeGold, formatGold } = require('../../utils/helpers');

const DICE_EMOJIS = {
  1: '⚀',
  2: '⚁',
  3: '⚂',
  4: '⚃',
  5: '⚄',
  6: '⚅'
};

module.exports = {
  name: 'dice',
  description: 'Đoán mặt xúc xắc 1 đến 6 — Cược 1 ăn 5',
  aliases: ['sdice', 'xucxac'],
  run: async (client, message, args) => {
    // Hỗ trợ cả 2 dạng: A!dice <mat 1-6> <so_tien> hoặc A!dice <so_tien> <mat 1-6>
    let rawFace = parseInt(args[0], 10);
    let amount = parseInt(args[1], 10);

    if (rawFace > 6 && !isNaN(parseInt(args[1], 10)) && parseInt(args[1], 10) >= 1 && parseInt(args[1], 10) <= 6) {
      amount = parseInt(args[0], 10);
      rawFace = parseInt(args[1], 10);
    }

    if (isNaN(rawFace) || rawFace < 1 || rawFace > 6) {
      const embed = new EmbedBuilder()
        .setTitle('🎲 Hướng Dẫn Cược Xúc Xắc')
        .setDescription(
          '❌ Mặt xúc xắc bạn chọn không hợp lệ!\n\n' +
          '**Yêu cầu:** Chọn 1 mặt từ `1` đến `6`\n' +
          '**Tỷ lệ thưởng:** Đoán đúng ăn gấp **5 lần** tiền cược!\n\n' +
          '**Cú pháp:** `A!dice <mặt 1-6> <số_gold>`\n*Ví dụ: `A!dice 6 100`*'
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

    const rolledFace = Math.floor(Math.random() * 6) + 1;

    const embed = new EmbedBuilder()
      .setTitle('🎲 Lắc Xúc Xắc May Mắn')
      .addFields(
        { name: 'Mặt bạn đã chọn', value: `${DICE_EMOJIS[rawFace]} **Mặt ${rawFace}** (Cược: **${formatGold(amount)} Gold**)`, inline: true },
        { name: 'Xúc xắc lắc ra', value: `${DICE_EMOJIS[rolledFace]} **Mặt ${rolledFace}**`, inline: true }
      );

    if (rawFace === rolledFace) {
      const won = amount * 5;
      addGold(uid, won);
      embed
        .setColor(0x2ECC71)
        .setDescription(`🎉 **XUẤT SẮC!** Xúc xắc ra đúng mặt **${rolledFace}**!\nBạn nhận được **+${formatGold(won)} Gold** (Tỷ lệ 1 ăn 5).`);
    } else {
      removeGold(uid, amount);
      embed
        .setColor(0xE74C3C)
        .setDescription(`😢 **THUA RỒI!** Xúc xắc ra mặt **${rolledFace}**, không phải mặt **${rawFace}**.\nBạn mất **-${formatGold(amount)} Gold**.`);
    }

    return message.channel.send({ embeds: [embed] });
  }
};
