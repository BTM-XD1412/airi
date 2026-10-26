const { ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { addGold, formatGold, isAdmin } = require('../utils/helpers');

module.exports = {
  name: 'addgold',
  description: 'Cộng thêm Gold cho người chơi (Admin only)',
  default_member_permissions: PermissionFlagsBits.Administrator.toString(),
  options: [
    {
      name: 'user',
      description: 'Người chơi cần cộng Gold',
      type: ApplicationCommandOptionType.User,
      required: true
    },
    {
      name: 'amount',
      description: 'Số lượng Gold muốn cộng (lớn hơn 0)',
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
      return interaction.reply({ content: '❌ Số tiền cộng phải lớn hơn 0!', ephemeral: true });
    }

    const newBalance = addGold(targetUser.id, amount);

    const embed = new EmbedBuilder()
      .setTitle('🛠️ Quản Trị Viên - Cộng Tiền Thành Công')
      .setDescription(
        `Đã cộng thêm **+${formatGold(amount)} Gold** cho <@${targetUser.id}>.\n` +
        `💰 Số dư hiện tại của người chơi: **${formatGold(newBalance)} Gold**.`
      )
      .setColor(0x2ECC71)
      .setFooter({ text: `Thực hiện bởi: ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  }
};
