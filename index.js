require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./utils/json/config.json');
const readyEvent = require('./events/discord/ready.js');

// Khởi tạo Client với các Intents cần thiết
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// Lưu cấu hình và Collections vào client
client.config = config;
client.commands = new Collection();
client.slashCommands = new Collection();

/**
 * Quét đệ quy toàn bộ thư mục commands để nạp lệnh prefix
 * @param {string} directory 
 */
function walkCommands(directory) {
  if (!fs.existsSync(directory)) return;

  const files = fs.readdirSync(directory);
  for (const file of files) {
    const filePath = path.join(directory, file);
    if (fs.statSync(filePath).isDirectory()) {
      walkCommands(filePath);
    } else if (file.endsWith('.js')) {
      const command = require(filePath);
      if (command.name) {
        client.commands.set(command.name, command);
      }
      if (command.aliases && Array.isArray(command.aliases)) {
        for (const alias of command.aliases) {
          client.commands.set(alias, command);
        }
      }
    }
  }
}

// Nạp tất cả lệnh prefix từ thư mục commands
walkCommands(path.join(__dirname, 'commands'));
console.log(`[ Commands ] Đã nạp thành công các lệnh Prefix vào Collection`);

/**
 * Nạp toàn bộ Slash Commands từ thư mục slash
 * @param {string} directory 
 */
function loadSlashCommands(directory) {
  if (!fs.existsSync(directory)) return;

  const files = fs.readdirSync(directory);
  for (const file of files) {
    const filePath = path.join(directory, file);
    if (file.endsWith('.js')) {
      const slashCmd = require(filePath);
      if (slashCmd.name) {
        client.slashCommands.set(slashCmd.name, slashCmd);
      }
    }
  }
}

// Nạp tất cả Slash Commands từ thư mục slash
loadSlashCommands(path.join(__dirname, 'slash'));
console.log(`[ Slash Commands ] Đã nạp thành công ${client.slashCommands.size} Slash Commands vào Collection`);

// ==========================================
// EVENT: ready
// ==========================================
client.once('ready', () => readyEvent(client));

// ==========================================
// EVENT: messageCreate (Prefix Commands)
// ==========================================
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Hỗ trợ prefixes từ config và tag @Bot
  const validPrefixes = [
    ...(config.prefixes || ['A!', 'a!', 'A ']),
    `<@!${client.user.id}> `,
    `<@${client.user.id}> `,
    `<@!${client.user.id}>`,
    `<@${client.user.id}>`
  ];

  const matchedPrefix = validPrefixes.find(p => message.content.startsWith(p));
  if (!matchedPrefix) return;

  const args = message.content.slice(matchedPrefix.length).trim().split(/\s+/);
  const commandName = args.shift()?.toLowerCase();
  if (!commandName) return;

  // Nhắc nhở người dùng nếu dùng nhầm prefix cho lệnh Admin đã đổi sang Slash Command
  if (['addgold', 'removegold'].includes(commandName)) {
    return message.reply(`⚠️ Lệnh **${commandName}** đã được chuyển thành Slash Command!\nVui lòng gõ **\`/${commandName}\`** để sử dụng.`);
  }

  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    await command.run(client, message, args);
  } catch (error) {
    console.error(`[Error] Lỗi khi thực thi lệnh ${commandName}:`, error);
    message.reply('❌ Đã có lỗi xảy ra trong quá trình xử lý lệnh!').catch(() => {});
  }
});

// ==========================================
// EVENT: interactionCreate (Slash Commands)
// ==========================================
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.slashCommands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.run(client, interaction);
  } catch (error) {
    console.error(`[Error] Lỗi khi thực thi Slash Command /${interaction.commandName}:`, error);
    const replyPayload = { content: '❌ Đã có lỗi xảy ra khi thực thi lệnh!', ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(replyPayload).catch(() => {});
    } else {
      await interaction.reply(replyPayload).catch(() => {});
    }
  }
});

// ==========================================
// ĐĂNG NHẬP BOT
// ==========================================
const TOKEN = process.env.DISCORD_TOKEN || 'ĐIỀN_TOKEN_BOT_CỦA_BẠN_VÀO_ĐÂY';

if (!TOKEN || TOKEN === 'DIEN_TOKEN_BOT_CUA_BAN_VAO_DAY' || TOKEN === 'ĐIỀN_TOKEN_BOT_CỦA_BẠN_VÀO_ĐÂY') {
  console.warn('⚠️ CẢNH BÁO: Bạn chưa cấu hình Token Discord hợp lệ trong file .env!');
  console.warn("Vui lòng mở file .env và thay thế 'DIEN_TOKEN_BOT_CUA_BAN_VAO_DAY' bằng Token bot của bạn.");
} else {
  client.login(TOKEN).catch((err) => {
    console.error('❌ Không thể kết nối tới Discord. Kiểm tra lại Token hoặc kết nối mạng:', err.message);
  });
}

module.exports = { client };
