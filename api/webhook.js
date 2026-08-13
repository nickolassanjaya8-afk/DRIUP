export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan' });

  try {
    const data = req.body; // Terima data langsung dari frontend
    const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
    const CHAT_ID_ENV = process.env.CHAT_ID;

    // Ambil data (perhatikan data.data.idg karena data berada dalam objek 'data')
    const orderId = data.id;
    const gameName = data.game;
    const itemsBeli = data.items;
    const total = data.total;
    const nama = data.data?.nama || '-';
    const wa = data.data?.wa || '-';
    const idg = data.data?.idg || '-';
    const zone = data.data?.zone || '-';

    const caption = `🔔 *PESANAN BARU MASUK!* 🔔\n\n*ID:* \`${orderId}\`\n*Game:* ${gameName}\n*Item:* ${itemsBeli}\n*Total:* Rp ${total.toLocaleString('id-ID')}\n\n👤 Nama: ${nama}\n📱 WA: ${wa}\n🎮 ID Game: \`${idg}\`\n📍 Zona: \`${zone}\``;

    const replyMarkup = { inline_keyboard: [[{ text: '✅ ACC Pesanan', callback_data: `ACC_${orderId}` }]] };

    const chatIds = CHAT_ID_ENV.split(',').map(id => id.trim());
    await Promise.all(chatIds.map(chatId => 
      fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: caption, parse_mode: 'Markdown', reply_markup: replyMarkup })
      })
    ));

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
