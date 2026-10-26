const { EmbedBuilder } = require('discord.js');
const { addGold, formatGold } = require('../../utils/helpers');

const activeMathQuizzes = new Set();
const mathCooldowns = new Map();
const COOLDOWN_SECONDS = 20;

module.exports = {
  name: 'math',
  description: 'Thử thách giải toán nhanh nhận Gold thưởng',
  aliases: ['smath', 'toanhoc', 'sdt'],
  run: async (client, message, args) => {
    const uid = String(message.author.id);
    const now = Date.now();
    const lastPlayed = mathCooldowns.get(uid);

    if (lastPlayed && now - lastPlayed < COOLDOWN_SECONDS * 1000) {
      const remaining = Math.ceil((lastPlayed + COOLDOWN_SECONDS * 1000 - now) / 1000);
      const embed = new EmbedBuilder()
        .setTitle('⏳ Hãy Nghỉ Ngơi')
        .setDescription(`Não bộ cần hồi sức! Hãy quay lại sau **${remaining} giây**.`)
        .setColor(0xE67E22);
      return message.channel.send({ embeds: [embed] });
    }

    if (activeMathQuizzes.has(uid)) {
      return message.reply('⚠️ Bạn đang có một câu đố toán học chưa hoàn thành, hãy trả lời câu đó trước!');
    }

    activeMathQuizzes.add(uid);
    mathCooldowns.set(uid, now);

    const operations = ['+', '-', '*'];
    const op = operations[Math.floor(Math.random() * operations.length)];
    let num1, num2, answer;

    if (op === '+') {
      num1 = Math.floor(Math.random() * 80) + 10;
      num2 = Math.floor(Math.random() * 80) + 10;
      answer = num1 + num2;
    } else if (op === '-') {
      num1 = Math.floor(Math.random() * 90) + 20;
      num2 = Math.floor(Math.random() * (num1 - 5)) + 5;
      answer = num1 - num2;
    } else {
      num1 = Math.floor(Math.random() * 12) + 2;
      num2 = Math.floor(Math.random() * 12) + 2;
      answer = num1 * num2;
    }

    const reward = Math.floor(Math.random() * 150) + 150;

    const embed = new EmbedBuilder()
      .setTitle('🧠 Thử Thách Trí Tuệ: Nhanh Như Chớp')
      .setDescription(
        `Người chơi **${message.author.username}**, hãy giải phép toán sau trong **15 giây**:\n\n` +
        `### \` ${num1} ${op} ${num2} = ? \`\n\n` +
        `💰 Thưởng khi giải đúng: **+${formatGold(reward)} Gold**`
      )
      .setColor(0x3498DB)
      .setFooter({ text: 'Gõ trực tiếp đáp án (chỉ số) vào kênh chat!' });

    await message.channel.send({ embeds: [embed] });

    // Chỉ nhận tin nhắn là số hợp lệ từ người gọi lệnh (không nhận tin nhắn lệnh bot khác)
    const filter = m => m.author.id === message.author.id && /^-?\d+$/.test(m.content.trim());
    try {
      const collected = await message.channel.awaitMessages({
        filter,
        max: 1,
        time: 15000,
        errors: ['time']
      });

      activeMathQuizzes.delete(uid);
      const userReply = collected.first();
      const userAns = parseInt(userReply.content.trim(), 10);

      if (userAns === answer) {
        addGold(uid, reward);

        const winEmbed = new EmbedBuilder()
          .setTitle('🎉 Chúc Mừng Bạn Đã Trả Lời Đúng!')
          .setDescription(`Đáp án chính xác là **${answer}**! Bạn nhận được **+${formatGold(reward)} Gold**.`)
          .setColor(0x2ECC71);
        return message.channel.send({ embeds: [winEmbed] });
      } else {
        const loseEmbed = new EmbedBuilder()
          .setTitle('❌ Rất Tiếc, Đáp Án Chưa Đúng!')
          .setDescription(`Bạn trả lời là \`${userReply.content}\`, nhưng đáp án đúng là **${answer}**.\nĐừng buồn, hãy thử lại lần sau nhé!`)
          .setColor(0xE74C3C);
        return message.channel.send({ embeds: [loseEmbed] });
      }
    } catch {
      activeMathQuizzes.delete(uid);
      const timeoutEmbed = new EmbedBuilder()
        .setTitle('⏰ Hết Thời Gian!')
        .setDescription(`Đã quá 15 giây mà bạn chưa đưa ra đáp án. Phép tính **${num1} ${op} ${num2}** có kết quả là **${answer}**!`)
        .setColor(0xE67E22);
      return message.channel.send({ embeds: [timeoutEmbed] });
    }
  }
};
