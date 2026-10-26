const { EmbedBuilder } = require('discord.js');
const { getGold, transferGold, formatGold, resolveMember, MAX_BET } = require('../../utils/helpers');

module.exports = {
  name: 'give',
  description: 'Chuyển Gold cho người chơi khác',
  aliases: ['pay', 'chuyentien'],
  run: async (client, message, args) => {
    const target = await resolveMember(message, args);

    if (!target) {
      const embed = new EmbedBuilder()
        .setDescription('❌ Vui lòng gắn thẻ (tag) hoặc nhập ID người nhận! (Ví dụ: `A!give @user 100`)')
        .setColor(0xE74C3C);
      return message.channel.send({ embeds: [embed] });
    }

    if (target.id === message.author.id) {
      const embed = new EmbedBuilder()
        .setDescription('❌ Bạn không thể tự chuyển tiền cho chính mình!')
        .setColor(0xE74C3C);
      return message.channel.send({ embeds: [embed] });
    }

    // Tìm amount trong args: phần tử là số nguyên nhưng KHÔNG trùng với ID của target
    let amount = NaN;
    for (const a of args) {
      const clean = a.replace(/[<@!>]/g, '');
      if (clean !== target.id && /^\d+$/.test(a)) {
        const parsed = parseInt(a, 10);
        if (!isNaN(parsed) && parsed > 0) {
          amount = parsed;
          break;
        }
      }
    }

    if (isNaN(amount) || amount <= 0 || !Number.isSafeInteger(amount)) {
      const embed = new EmbedBuilder()
        .setDescription('❌ Số tiền chuyển phải là số nguyên lớn hơn 0!')
        .setColor(0xE74C3C);
      return message.channel.send({ embeds: [embed] });
    }

    if (amount > MAX_BET) {
      const embed = new EmbedBuilder()
        .setDescription(`❌ Số tiền chuyển tối đa là **${formatGold(MAX_BET)} Gold**!`)
        .setColor(0xE74C3C);
      return message.channel.send({ embeds: [embed] });
    }

    const senderGold = getGold(message.author.id);
    if (senderGold < amount) {
      const embed = new EmbedBuilder()
        .setDescription('❌ Bạn không đủ số dư Gold để chuyển!')
        .setColor(0xE74C3C);
      return message.channel.send({ embeds: [embed] });
    }

    const success = transferGold(message.author.id, target.id, amount);
    if (!success) {
      const embed = new EmbedBuilder()
        .setDescription('❌ Giao dịch thất bại do số dư không đủ!')
        .setColor(0xE74C3C);
      return message.channel.send({ embeds: [embed] });
    }

    const embed = new EmbedBuilder()
      .setTitle('💸 Chuyển Tiền Thành Công')
      .setDescription(`Bạn đã chuyển thành công **${formatGold(amount)} Gold** cho <@${target.id}>.`)
      .setColor(0x2ECC71);
    return message.channel.send({ embeds: [embed] });
  }
};
