export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method salah' });

  try {
    const data = req.body; // Terima object lengkap
    const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
    const CHAT_ID_ENV = process.env.CHAT_ID;

    // Persiapkan data
    const orderId = data.id || "Tidak diketahui";
    const game = data.game || "-";
    const items = data.items || "-";
    const total = data.total || 0;
    const nama = data.data?.nama || "-";
    const wa = data.data?.wa || "-";
    const idg = data.data?.idg || "-";
    const zone = data.data?.zone || "-";
    const buktiBase64 = data.bukti; // Data foto

    const caption = `🔔 *PESANAN BARU MASUK!* 🔔\n\n*ID:* \`${orderId}\`\n*Game:* ${game}\n*Item:* ${items}\n*Total:* Rp ${total.toLocaleString('id-ID')}\n\n👤 Nama: ${nama}\n📱 WA: ${wa}\n🎮 ID Game: \`${idg}\`\n📍 Zona: \`${zone}\``;

    const chatIds = CHAT_ID_ENV.split(',').map(id => id.trim());

    // Konversi Base64 ke Buffer untuk Telegram
    const buffer = Buffer.from(buktiBase64.split(',')[1], 'base64');
    const blob = new Blob([buffer], { type: 'image/jpeg' });

    await Promise.all(chatIds.map(async (chatId) => {
      const formData = new FormData();
      formData.append('chat_id', chatId);
      formData.append('caption', caption);
      formData.append('parse_mode', 'Markdown');
      formData.append('photo', blob, 'bukti.jpg');
      formData.append('reply_markup', JSON.stringify({
        inline_keyboard: [[{ text: '✅ ACC Pesanan', callback_data: `ACC_${orderId}` }]]
      }));

      await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`, {
        method: 'POST',
        body: formData
      });
    }));

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
