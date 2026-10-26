const { EmbedBuilder } = require('discord.js');
const { getUser, resolveMember, formatGold } = require('../../utils/helpers');

module.exports = {
  name: 'bal',
  description: 'Kiểm tra số dư Gold hiện tại',
  aliases: ['balance', 'money'],
  run: async (client, message, args) => {
    let target = await resolveMember(message, args);
    if (!target) target = message.member || message.author;

    const targetUser = target.user || target;
    const user = getUser(target.id);

    const embed = new EmbedBuilder()
      .setTitle('💰 Số Dư Tài Khoản')
      .setDescription(`Người chơi **${targetUser.username}** đang sở hữu **${formatGold(user.gold)} Gold**.`)
      .setColor(0xF1C40F);

    return message.channel.send({ embeds: [embed] });
  }
};
