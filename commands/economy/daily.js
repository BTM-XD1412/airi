const { EmbedBuilder } = require('discord.js');
const { claimDaily, formatGold, getTodayString } = require('../../utils/helpers');

module.exports = {
  name: 'daily',
  description: 'Nhận thưởng Gold miễn phí mỗi ngày',
  aliases: ['diemdanh'],
  run: async (client, message, args) => {
    const uid = String(message.author.id);
    const today = getTodayString();
    const reward = 500;

    const result = claimDaily(uid, today, reward);
    if (result.alreadyClaimed) {
      const embed = new EmbedBuilder()
        .setTitle('⏰ Chưa Đến Giờ Nhận Thưởng')
        .setDescription('Bạn đã nhận thưởng ngày hôm nay rồi. Hãy quay lại vào ngày mai nhé!')
        .setColor(0xE74C3C);
      return message.channel.send({ embeds: [embed] });
    }

    const embed = new EmbedBuilder()
      .setTitle('🎁 Điểm Danh Hàng Ngày')
      .setDescription(`Tuyệt vời! Bạn đã nhận thành công **${formatGold(reward)} Gold** miễn phí.`)
      .setColor(0x2ECC71);
    return message.channel.send({ embeds: [embed] });
  }
};
