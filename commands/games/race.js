const { EmbedBuilder } = require('discord.js');
const { getGold, addGold, removeGold, formatGold } = require('../../utils/helpers');

const RACERS = [
  { id: '1', key: 'cho', name: 'Chó Vàng', emoji: '🐕' },
  { id: '2', key: 'ngua', name: 'Chiến Mã', emoji: '🐎' },
  { id: '3', key: 'rua', name: 'Rùa Thần', emoji: '🐢' },
  { id: '4', key: 'tho', name: 'Thỏ Trắng', emoji: '🐇' },
  { id: '5', key: 'ho', name: 'Chúa Sơn Lâm', emoji: '🐅' }
];

module.exports = {
  name: 'race',
  description: 'Đua thú kịch tính — Cược 1 ăn 4',
  aliases: ['srace', 'duathu'],
  run: async (client, message, args) => {
    // Cú pháp: A!race <so_tien> <con_vat> hoặc A!race <con_vat> <so_tien>
    let amount = parseInt(args[0], 10);
    let choice = args[1]?.toLowerCase();

    if (isNaN(amount) && !isNaN(parseInt(args[1], 10))) {
      amount = parseInt(args[1], 10);
      choice = args[0]?.toLowerCase();
    }

    const selectedRacer = RACERS.find(r => 
      r.id === choice || 
      r.key === choice || 
      r.name.toLowerCase() === choice
    );

    if (!selectedRacer) {
      const listText = RACERS.map(r => `\`${r.id}\` hoặc \`${r.key}\`: ${r.emoji} **${r.name}**`).join('\n');
      const embed = new EmbedBuilder()
        .setTitle('🏁 Hướng Dẫn Đua Thú')
        .setDescription(
          '❌ Vui lòng chọn con vật bạn muốn đặt cược!\n\n' +
          '**Danh sách thú đua:**\n' + listText + '\n\n' +
          '**Cú pháp:** `A!race <số_gold> <con_vật>`\n*Ví dụ: `A!race 100 ngua` (hoặc `A!race 100 2`)*'
        )
        .setColor(0xE74C3C);
      return message.channel.send({ embeds: [embed] });
    }

    if (isNaN(amount) || amount <= 0) {
      const embed = new EmbedBuilder()
        .setDescription('❌ Số tiền cược phải lớn hơn 0!')
        .setColor(0xE74C3C);
      return message.channel.send({ embeds: [embed] });
    }

    const uid = String(message.author.id);
    if (getGold(uid) < amount) {
      const embed = new EmbedBuilder()
        .setDescription('❌ Bạn không đủ Gold để cược số tiền này!')
        .setColor(0xE74C3C);
      return message.channel.send({ embeds: [embed] });
    }

    const TRACK_LENGTH = 10;
    const positions = RACERS.map(r => ({ ...r, pos: 0 }));

    const renderTrack = () => {
      return positions.map(r => {
        const left = '- '.repeat(TRACK_LENGTH - r.pos);
        const right = '- '.repeat(r.pos);
        return `🏁 ${left}${r.emoji} ${right}**${r.name}**`;
      }).join('\n');
    };

    const initialEmbed = new EmbedBuilder()
      .setTitle('🏁 Trường Đua Thú Sôi Động')
      .setDescription(
        `Người chơi **${message.author.username}** đã đặt cược **${formatGold(amount)} Gold** vào ${selectedRacer.emoji} **${selectedRacer.name}**!\n\n` +
        renderTrack()
      )
      .setColor(0xF1C40F);

    const raceMsg = await message.channel.send({ embeds: [initialEmbed] });

    let winner = null;
    while (!winner) {
      for (const r of positions) {
        r.pos += Math.floor(Math.random() * 3) + 1;
        if (r.pos >= TRACK_LENGTH) {
          r.pos = TRACK_LENGTH;
          winner = r;
          break;
        }
      }
    }

    await new Promise(res => setTimeout(res, 1500));

    const finalEmbed = new EmbedBuilder()
      .setTitle('🏆 Kết Quả Cuộc Đua Thú')
      .addFields(
        { name: 'Đường đua về đích', value: renderTrack(), inline: false },
        { name: 'Con vật vô địch', value: `${winner.emoji} **${winner.name}**`, inline: true },
        { name: 'Bạn đã cược', value: `${selectedRacer.emoji} **${selectedRacer.name}** (**${formatGold(amount)} Gold**)`, inline: true }
      );

    if (winner.key === selectedRacer.key) {
      const reward = amount * 4;
      addGold(uid, reward);
      finalEmbed.setColor(0x2ECC71);
      finalEmbed.setDescription(`🎉 **CHIẾN THẮNG RỰC RỠ!** ${selectedRacer.emoji} **${selectedRacer.name}** đã cán đích đầu tiên! Bạn nhận được **+${formatGold(reward)} Gold** (Tỷ lệ 1 ăn 4).`);
    } else {
      removeGold(uid, amount);
      finalEmbed.setColor(0xE74C3C);
      finalEmbed.setDescription(`😢 **THUA CUỘC!** ${winner.emoji} **${winner.name}** đã về đích trước. Bạn mất **-${formatGold(amount)} Gold**.`);
    }

    return raceMsg.edit({ embeds: [finalEmbed] }).catch(() => {});
  }
};
