const { EmbedBuilder } = require('discord.js');
const { addGold, removeGold, formatGold } = require('../../utils/helpers');

const cooldowns = new Map();
const COOLDOWN_SECONDS = 30;

module.exports = {
  name: 'daotao',
  description: 'Đào vườn tìm táo may mắn để nhận Gold',
  aliases: ['sdaotao', 'sdig', 'dig', 'dao'],
  run: async (client, message, args) => {
    const uid = String(message.author.id);
    const now = Date.now();
    const userCooldown = cooldowns.get(uid);

    if (userCooldown && now - userCooldown < COOLDOWN_SECONDS * 1000) {
      const remaining = Math.ceil((userCooldown + COOLDOWN_SECONDS * 1000 - now) / 1000);
      const embed = new EmbedBuilder()
        .setTitle('⏳ Bạn Đang Mệt')
        .setDescription(`Bạn vừa đào đất xong, cần nghỉ ngơi một chút! Hãy quay lại sau **${remaining} giây**.`)
        .setColor(0xE67E22);
      return message.channel.send({ embeds: [embed] });
    }

    cooldowns.set(uid, now);

    const rand = Math.random();
    const embed = new EmbedBuilder().setTitle('⛏️ Chuyến Đào Táo May Mắn');

    if (rand < 0.08) {
      const gold = Math.floor(Math.random() * 800) + 500; // 500 - 1300
      addGold(uid, gold);
      embed
        .setColor(0xF1C40F)
        .setDescription(`✨ **TRỜI ƠI ĐỈNH QUÁ!** Bạn đã đào trúng **Táo Vàng Hoàng Kim 🌟**!\nNhận ngay phần thưởng siêu to: **+${formatGold(gold)} Gold**.`);
    } else if (rand < 0.45) {
      const gold = Math.floor(Math.random() * 150) + 100; // 100 - 250
      addGold(uid, gold);
      embed
        .setColor(0x2ECC71)
        .setDescription(`🍎 **TUYỆT VỜI!** Bạn đào được một trái **Táo Đỏ tươi ngon**!\nBán được: **+${formatGold(gold)} Gold**.`);
    } else if (rand < 0.75) {
      const gold = Math.floor(Math.random() * 80) + 50; // 50 - 130
      addGold(uid, gold);
      embed
        .setColor(0x3498DB)
        .setDescription(`🍏 Bạn tìm thấy một trái **Táo Xanh giòn rụm**!\nBán được: **+${formatGold(gold)} Gold**.`);
    } else if (rand < 0.90) {
      embed
        .setColor(0x95A5A6)
        .setDescription('🕳️ Đào toát cả mồ hôi nhưng chỉ thấy toàn đất cát và giun đất... Không nhặt được đồng nào!');
    } else {
      const penalty = 30;
      removeGold(uid, penalty);
      embed
        .setColor(0xE74C3C)
        .setDescription(`💣 **XUI XẺO!** Bạn đào trúng một quả mìn xịt cũ kỹ phát nổ lấm lem!\nBạn phải chi **-${penalty} Gold** để lau rửa trang bị.`);
    }

    return message.channel.send({ embeds: [embed] });
  }
};
