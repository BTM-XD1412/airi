const { ActivityType } = require('discord.js');

module.exports = async (client) => {
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
    }
  } catch (err) {
    console.error('[ready.js] ' + err.message);
  }

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
