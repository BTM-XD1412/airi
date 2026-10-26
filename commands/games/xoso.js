const { EmbedBuilder } = require('discord.js');
const { getGold, addGold, removeGold, formatGold } = require('../../utils/helpers');

module.exports = {
  name: 'xoso',
  description: 'Mua vé số may mắn 2 chữ số (00-99) — Trúng ăn gấp 70 lần',
  aliases: ['sxs', 'sxoso', 'xs', 'veso'],
  run: async (client, message, args) => {
    // Hỗ trợ cả 2 thứ tự: A!xoso <con_so> <so_tien> hoặc A!xoso <so_tien> <con_so>
    let rawNumber = args[0];
    let amount = parseInt(args[1], 10);

    if (!isNaN(parseInt(args[0], 10)) && args[1] && args[1].length <= 2) {
      if (parseInt(args[0], 10) > 99) {
        amount = parseInt(args[0], 10);
        rawNumber = args[1];
      }
    }

    const cleanNum = parseInt(rawNumber, 10);
    if (isNaN(cleanNum) || cleanNum < 0 || cleanNum > 99) {
      const embed = new EmbedBuilder()
        .setTitle('🎟️ Hướng Dẫn Mua Vé Số')
        .setDescription(
          '❌ Con số bạn chọn không hợp lệ!\n\n' +
          '**Yêu cầu:** Chọn một con số may mắn từ `00` đến `99`\n' +
          '**Tỷ lệ thưởng:** Trúng giải ăn gấp **70 lần** tiền cược!\n\n' +
          '**Cú pháp:** `A!xoso <số_chọn 00-99> <tiền_cược>`\n*Ví dụ: `A!xoso 68 100`*'
        )
        .setColor(0xE74C3C);
      return message.channel.send({ embeds: [embed] });
    }

    if (isNaN(amount) || amount <= 0) {
      const embed = new EmbedBuilder()
        .setDescription('❌ Số tiền cược mua vé số phải lớn hơn 0!')
        .setColor(0xE74C3C);
      return message.channel.send({ embeds: [embed] });
    }

    const uid = String(message.author.id);
    if (getGold(uid) < amount) {
      const embed = new EmbedBuilder()
        .setDescription('❌ Bạn không đủ Gold để mua vé số này!')
        .setColor(0xE74C3C);
      return message.channel.send({ embeds: [embed] });
    }

    const chosenStr = String(cleanNum).padStart(2, '0');
    const winningNum = Math.floor(Math.random() * 100);
    const winningStr = String(winningNum).padStart(2, '0');

    const embed = new EmbedBuilder()
      .setTitle('🎟️ Xổ Số Kiến Thiết Server')
      .addFields(
        { name: 'Số bạn đã chọn', value: `🎫 **${chosenStr}** (Cược: **${formatGold(amount)} Gold**)`, inline: true },
        { name: 'Lồng cầu quay ra số', value: `🎱 **${winningStr}**`, inline: true }
      );

    if (chosenStr === winningStr) {
      const jackpot = amount * 70;
      addGold(uid, jackpot);
      embed
        .setColor(0x2ECC71)
        .setDescription(`🎊 **ĐỘC ĐẮC RỒI!** Chúc mừng bạn đã đoán chính xác số **${winningStr}**!\nBạn ẵm trọn giải thưởng gấp 70 lần: **+${formatGold(jackpot)} Gold**.`);
    } else {
      removeGold(uid, amount);
      embed
        .setColor(0xE74C3C)
        .setDescription(`😢 **CHÚC BẠN MAY MẮN LẦN SAU!** Số mở thưởng là **${winningStr}**, không trùng với số **${chosenStr}** của bạn.\nBạn mất **-${formatGold(amount)} Gold**.`);
    }

    return message.channel.send({ embeds: [embed] });
  }
};
