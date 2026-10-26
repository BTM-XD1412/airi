const { PermissionsBitField } = require('discord.js');
const config = require('./json/config.json');
const dbModule = require('./database');

const MAX_BET = 10_000_000_000; // Giới hạn cược tối đa: 10 tỷ Gold

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
 * Lấy chuỗi ngày hiện tại theo chuẩn YYYY-MM-DD theo múi giờ Việt Nam (Asia/Ho_Chi_Minh)
 * @returns {string}
 */
function getTodayString() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
}

/**
 * Xác thực số tiền cược hợp lệ và đủ số dư
 * @param {any} rawAmount 
 * @param {number} userGold 
 * @returns {{ valid: boolean, amount?: number, error?: string }}
 */
function validateBet(rawAmount, userGold) {
  const amount = parseInt(rawAmount, 10);

  if (isNaN(amount) || amount <= 0 || !Number.isSafeInteger(amount)) {
    return { valid: false, error: '❌ Số tiền cược phải là số nguyên lớn hơn 0!' };
  }

  if (amount > MAX_BET) {
    return { valid: false, error: `❌ Số tiền cược tối đa cho phép là **${formatGold(MAX_BET)} Gold**!` };
  }

  if (userGold < amount) {
    return { valid: false, error: '❌ Bạn không đủ Gold để cược số tiền này!' };
  }

  return { valid: true, amount };
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
  ...dbModule,
  MAX_BET,
  isAdmin,
  formatGold,
  getTodayString,
  validateBet,
  resolveMember
};
