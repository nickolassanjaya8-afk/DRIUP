export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Hanya POST' });

  try {
    const update = req.body;
    const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;

    // Cek apakah aksi ini berasal dari klik tombol (callback_query)
    if (update.callback_query) {
      const callbackQuery = update.callback_query;
      const data = callbackQuery.data; // Contoh: "ACC_DRIUP-123456"
      const message = callbackQuery.message;
      const chatId = message.chat.id;
      const messageId = message.message_id;
      const callbackQueryId = callbackQuery.id;

      // Jika tombol yang diklik adalah tombol ACC
      if (data.startsWith('ACC_')) {
        const orderId = data.replace('ACC_', '');

        // 1. UPDATE STATUS DI FIREBASE MENJADI "Sukses"
        // Menggunakan REST API Firebase bawaan
        const firebaseUrl = `https://driup-39411-default-rtdb.asia-southeast1.firebasedatabase.app/orders/${orderId}.json`;
        await fetch(firebaseUrl, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Sukses' })
        });

        // 2. UBAH PESAN DI TELEGRAM (Hapus Tombol & Tambah Cap Sukses)
        const newCaption = message.caption + '\n\n✅ *STATUS: SUKSES (Telah di-ACC oleh Admin)*';
        await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/editMessageCaption`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: messageId,
            caption: newCaption,
            parse_mode: 'Markdown',
            reply_markup: { inline_keyboard: [] } // Ini akan menghilangkan tombol ACC agar tidak bisa diklik 2x
          })
        });

        // 3. JAWAB CALLBACK AGAR TOMBOL BERHENTI LOADING (MUTER)
        await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callback_query_id: callbackQueryId,
            text: `Mantap! Pesanan ${orderId} berhasil di-ACC.`
          })
        });
      }
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).json({ error: 'Webhook gagal dieksekusi' });
  }
}
