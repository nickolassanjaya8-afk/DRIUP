export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { orderId, gameName, itemsBeli, total, nama, wa, idg, zone, bukti, expiredAt } = req.body;
  const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
  const CHAT_ID = process.env.CHAT_ID;

  if (!TELEGRAM_TOKEN || !CHAT_ID) return res.status(500).json({ error: 'Token belum diatur' });

  // Format jam kadaluarsa (WIB)
  const expireDate = new Date(expiredAt).toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' });

  const textTelegram = `🔔 *PESANAN BARU!* 🔔

*ID:* ${orderId}
*Game:* ${gameName}
*Item:* ${itemsBeli}
*Total:* Rp ${total.toLocaleString('id-ID')}

⏳ *Batas Waktu:* 1 Jam (Hingga ${expireDate} WIB)

👤 *Pembeli:* ${nama}
📱 *WA:* ${wa}
🎮 *ID Game:* ${idg} / ${zone || '-'}`;

  const replyMarkup = {
    inline_keyboard: [[{ text: "✅ ACC Pesanan (Sukses)", callback_data: `acc_${orderId}` }]]
  };

  try {
    if (bukti && bukti.startsWith('data:image')) {
      const base64Data = bukti.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      const blob = new Blob([buffer], { type: 'image/jpeg' });

      const formData = new FormData();
      formData.append('chat_id', CHAT_ID);
      formData.append('photo', blob, 'bukti.jpg');
      formData.append('caption', textTelegram);
      formData.append('parse_mode', 'Markdown');
      formData.append('reply_markup', JSON.stringify(replyMarkup));

      await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`, { method: 'POST', body: formData });
    } else {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: CHAT_ID, text: textTelegram, parse_mode: 'Markdown', reply_markup: replyMarkup })
      });
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Gagal' });
  }
}
