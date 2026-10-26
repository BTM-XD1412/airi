const { ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { removeGold, formatGold, isAdmin } = require('../utils/helpers');

module.exports = {
  name: 'removegold',
  description: 'Trừ bớt Gold của người chơi (Admin only)',
  default_member_permissions: PermissionFlagsBits.Administrator.toString(),
  options: [
    {
      name: 'user',
      description: 'Người chơi cần trừ Gold',
      type: ApplicationCommandOptionType.User,
      required: true
    },
    {
      name: 'amount',
      description: 'Số lượng Gold muốn trừ (lớn hơn 0)',
      type: ApplicationCommandOptionType.Integer,
      required: true,
      min_value: 1
    }
  ],
  run: async (client, interaction) => {
    // Kiểm tra quyền Administrator qua PermissionsBitField (không xác định ID)
    if (!isAdmin(interaction)) {
      const errorEmbed = new EmbedBuilder()
        .setDescription('❌ Bạn không có quyền sử dụng lệnh này! (Chỉ Admin mới có thể dùng)')
        .setColor(0xE74C3C);
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    const targetUser = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    if (!targetUser) {
      return interaction.reply({ content: '❌ Không tìm thấy người chơi hợp lệ!', ephemeral: true });
    }

    if (amount <= 0) {
      return interaction.reply({ content: '❌ Số tiền trừ phải lớn hơn 0!', ephemeral: true });
    }

    const newBalance = removeGold(targetUser.id, amount);

    const embed = new EmbedBuilder()
      .setTitle('🛠️ Quản Trị Viên - Trừ Tiền Thành Công')
      .setDescription(
        `Đã trừ bớt **-${formatGold(amount)} Gold** của <@${targetUser.id}>.\n` +
        `💰 Số dư hiện tại của người chơi: **${formatGold(newBalance)} Gold**.`
      )
      .setColor(0xE67E22)
      .setFooter({ text: `Thực hiện bởi: ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  }
};
