export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan' });

  try {
    const { orderId, gameName, itemsBeli, total, nama, wa, idg, zone, bukti } = req.body;
    
    const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
    const CHAT_ID_ENV = process.env.CHAT_ID;

    if (!TELEGRAM_TOKEN || !CHAT_ID_ENV) {
      return res.status(500).json({ error: 'Token atau Chat ID belum disetting.' });
    }

    // Memecah CHAT_ID menjadi beberapa akun berdasarkan tanda koma
    const chatIds = CHAT_ID_ENV.split(',').map(id => id.trim());

    const caption = `
🔔 *PESANAN BARU MASUK!* 🔔

*ID Pesanan:* \`${orderId}\`
*Game:* ${gameName}
*Item:* ${itemsBeli}
*Total Harga:* Rp ${total.toLocaleString('id-ID')}

*Data Pembeli:*
👤 Nama: ${nama}
📱 WA: ${wa}

*Data Game:*
🎮 ID Game: \`${idg}\`
📍 Zona: \`${zone || '-'}\`
    `;

    // Proses konversi bukti transfer
    const base64Data = bukti.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const blob = new Blob([imageBuffer], { type: 'image/jpeg' });

    // Tombol ACC
    const replyMarkup = {
      inline_keyboard: [
        [{ text: '✅ ACC Pesanan (Sukses)', callback_data: `ACC_${orderId}` }]
      ]
    };

    // Kirim notifikasi ke SEMUA CHAT ID yang terdaftar
    const sendPromises = chatIds.map(async (chatId) => {
      const formData = new FormData();
      formData.append('chat_id', chatId);
      formData.append('caption', caption);
      formData.append('parse_mode', 'Markdown');
      formData.append('photo', blob, 'bukti_transfer.jpg');
      formData.append('reply_markup', JSON.stringify(replyMarkup));
      
      const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`;
      return fetch(telegramUrl, { method: 'POST', body: formData });
    });

    await Promise.all(sendPromises);
    res.status(200).json({ success: true, message: 'Berhasil dikirim ke semua admin!' });

  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
