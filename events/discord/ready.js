const { ActivityType } = require('discord.js');

module.exports = async (client) => {
  console.log(`[ Event | ready.js ] Bot đã đăng nhập thành công: ${client.user.tag}`);

  // Đồng bộ hóa Slash Commands với Discord
  try {
    if (client.slashCommands && client.slashCommands.size > 0) {
      const commandsData = client.slashCommands.map(cmd => ({
        name: cmd.name,
        description: cmd.description,
        options: cmd.options || [],
        default_member_permissions: cmd.default_member_permissions || null,
        dm_permission: false
      }));

      await client.application.commands.set(commandsData);
      console.log(`[ Slash Commands ] Đã đăng ký thành công ${commandsData.length} Slash Commands với Discord!`);
    }
  } catch (err) {
    console.error('[ Slash Commands ] Lỗi khi đồng bộ Slash Commands:', err.message);
  }

  // Cấu hình trạng thái hoạt động xoay tua cho Bot
  const activities = [
    'Prefix: A!help',
    'Slash: /addgold, /removegold',
    'Mini-games & Casino'
  ];

  let currentIdx = 0;
  client.user.setActivity({ name: activities[0], type: ActivityType.Playing });

  setInterval(() => {
    currentIdx = (currentIdx + 1) % activities.length;
    client.user.setActivity({ name: activities[currentIdx], type: ActivityType.Playing });
  }, 15000);
};
