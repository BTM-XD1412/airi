const { PermissionsBitField } = require('discord.js');
const config = require('./json/config.json');
const dbModule = require('./database');

/**
 * Kiểm tra người dùng có quyền Administrator không (sử dụng PermissionsBitField, không kiểm tra ID)
 * @param {import('discord.js').Message|import('discord.js').ChatInputCommandInteraction} context 
 * @returns {boolean}
 */
function isAdmin(context) {
  if (!context?.guild) return false;
  return context.member?.permissions?.has(PermissionsBitField.Flags.Administrator) ?? false;
}

/**
 * Định dạng số tiền có dấu phẩy ngăn cách hàng nghìn
 * @param {number} amount 
 * @returns {string}
 */
function formatGold(amount) {
  return (amount || 0).toLocaleString();
}

/**
 * Lấy chuỗi ngày hiện tại theo chuẩn YYYY-MM-DD
 * @returns {string}
 */
function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Tìm kiếm Member từ tag mention, reply hoặc User ID
 * @param {import('discord.js').Message} message 
 * @param {string[]} args 
 * @returns {Promise<import('discord.js').GuildMember|null>}
 */
async function resolveMember(message, args = []) {
  // 1. Kiểm tra mention trực tiếp
  const mention = message.mentions.members?.first();
  if (mention) return mention;

  // 2. Kiểm tra message reference (reply tin nhắn của ai đó)
  if (message.reference?.messageId) {
    try {
      const refMsg = await message.channel.messages.fetch(message.reference.messageId);
      if (refMsg?.member) return refMsg.member;
    } catch {}
  }

  // 3. Kiểm tra User ID truyền trong args
  const rawId = args.find(a => /^\d{17,20}$/.test(a) || /^<@!?(\d{17,20})>$/.test(a));
  if (rawId) {
    const cleanId = rawId.replace(/[<@!>]/g, '');
    try {
      return message.guild.members.cache.get(cleanId) || await message.guild.members.fetch(cleanId);
    } catch {}
  }

  return null;
}

module.exports = {
  // Re-export toàn bộ database methods (SQLite)
  ...dbModule,
  
  // Helpers tiện ích
  isAdmin,
  formatGold,
  getTodayString,
  resolveMember
};
