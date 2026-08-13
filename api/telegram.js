export default async function handler(req, res) {
  // Hanya menerima metode POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method tidak diizinkan' });
  }

  try {
    const { orderId, gameName, itemsBeli, total, nama, wa, idg, zone, bukti } = req.body;
    
    const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
    const CHAT_ID = process.env.CHAT_ID;

    // Pastikan variabel lingkungan sudah ada
    if (!TELEGRAM_TOKEN || !CHAT_ID) {
      return res.status(500).json({ error: 'Token atau Chat ID belum disetting di Vercel.' });
    }

    // Susun pesan notifikasi
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

Silakan cek bukti transfer di bawah ini 👇
    `;

    // 1. TERJEMAHKAN BUKTI (BASE64) MENJADI FILE GAMBAR (BUFFER)
    // Hapus header data base64 (misal: "data:image/jpeg;base64,")
    const base64Data = bukti.replace(/^data:image\/\w+;base64,/, "");
    // Ubah jadi buffer
    const imageBuffer = Buffer.from(base64Data, 'base64');
    // Ubah jadi blob (format yang bisa dikirim via Fetch)
    const blob = new Blob([imageBuffer], { type: 'image/jpeg' });

    // 2. SIAPKAN PENGIRIMAN MULTIPART FORM-DATA KE TELEGRAM
    const formData = new FormData();
    formData.append('chat_id', CHAT_ID);
    formData.append('caption', caption);
    formData.append('parse_mode', 'Markdown');
    formData.append('photo', blob, 'bukti_transfer.jpg');
    
    // 3. TAMBAHKAN TOMBOL ACC (Webhook)
    const replyMarkup = {
      inline_keyboard: [
        [{ text: '✅ ACC Pesanan (Sukses)', callback_data: `ACC_${orderId}` }]
      ]
    };
    formData.append('reply_markup', JSON.stringify(replyMarkup));

    // 4. KIRIM KE TELEGRAM
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`;

    const response = await fetch(telegramUrl, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!data.ok) {
      console.error('Error dari Telegram:', data);
      return res.status(500).json({ error: 'Gagal kirim ke Telegram', details: data });
    }

    // Jika berhasil
    res.status(200).json({ success: true, message: 'Notifikasi berhasil terkirim!' });

  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
