const { EmbedBuilder } = require('discord.js');
const { getLeaderboard, formatGold } = require('../../utils/helpers');

module.exports = {
  name: 'top',
  description: 'Xem bảng xếp hạng đại gia Gold',
  aliases: ['leaderboard', 'lb'],
  run: async (client, message, args) => {
    const topUsers = getLeaderboard(10);
    if (!topUsers || topUsers.length === 0) {
      const embed = new EmbedBuilder()
        .setDescription('Chưa có dữ liệu người chơi!')
        .setColor(0xE67E22);
      return message.channel.send({ embeds: [embed] });
    }

    const embed = new EmbedBuilder()
      .setTitle('🏆 Bảng Xếp Hạng Đại Gia Gold')
      .setColor(0xF1C40F);

    let description = '';
    for (let idx = 0; idx < topUsers.length; idx++) {
      const row = topUsers[idx];
      const rank = idx + 1;
      const user = client.users.cache.get(row.user_id);
      const name = user ? user.username : `User ${row.user_id}`;
      const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `\`#${rank}\``;
      description += `${medal} **${name}** — **${formatGold(row.gold)} Gold**\n`;
    }

    embed.setDescription(description || 'Chưa có dữ liệu.');
    return message.channel.send({ embeds: [embed] });
  }
};
