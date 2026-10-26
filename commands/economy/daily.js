const { EmbedBuilder } = require('discord.js');
const { getUser, addGold, setDaily, formatGold, getTodayString } = require('../../utils/helpers');

module.exports = {
  name: 'daily',
  description: 'Nhận thưởng Gold miễn phí mỗi ngày',
  aliases: ['diemdanh'],
  run: async (client, message, args) => {
    const uid = String(message.author.id);
    const user = getUser(uid);
    const today = getTodayString();

    if (user.last_daily === today) {
      const embed = new EmbedBuilder()
        .setTitle('⏰ Chưa Đến Giờ Nhận Thưởng')
        .setDescription('Bạn đã nhận thưởng ngày hôm nay rồi. Hãy quay lại vào ngày mai nhé!')
        .setColor(0xE74C3C);
      return message.channel.send({ embeds: [embed] });
    }

    const reward = 500;
    addGold(uid, reward);
    setDaily(uid, today);

    const embed = new EmbedBuilder()
      .setTitle('🎁 Điểm Danh Hàng Ngày')
      .setDescription(`Tuyệt vời! Bạn đã nhận thành công **${formatGold(reward)} Gold** miễn phí.`)
      .setColor(0x2ECC71);
    return message.channel.send({ embeds: [embed] });
  }
};
