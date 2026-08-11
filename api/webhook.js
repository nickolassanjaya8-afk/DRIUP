export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(200).send('OK');

  const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
  // Pastikan URL Database ini sesuai dengan milik kamu!
  const FIREBASE_DB_URL = "https://driup-39411-default-rtdb.asia-southeast1.firebasedatabase.app";

  try {
    const body = req.body;
    if (body.callback_query) {
      const callbackQuery = body.callback_query;
      const data = callbackQuery.data;
      const chatId = callbackQuery.message.chat.id;
      const messageId = callbackQuery.message.message_id;

      if (data.startsWith('acc_')) {
        const orderId = data.split('_')[1];

        // 1. Update status di Firebase
        await fetch(`${FIREBASE_DB_URL}/orders/${orderId}.json`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Selesai' })
        });

        // 2. Ubah pesan di Telegram sesuai tipe pesannya (Gambar atau Teks)
        const isPhoto = callbackQuery.message.photo !== undefined;
        const oldText = isPhoto ? callbackQuery.message.caption : callbackQuery.message.text;
        const newText = oldText + "\n\n✅ *STATUS: SELESAI (Di-ACC via Telegram)*";

        if (isPhoto) {
          // Jika pesan adalah Gambar
          await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/editMessageCaption`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, message_id: messageId, caption: newText, parse_mode: 'Markdown' })
          });
        } else {
          // Jika pesan adalah Teks biasa
          await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/editMessageText`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, message_id: messageId, text: newText, parse_mode: 'Markdown' })
          });
        }
      }
    }
    return res.status(200).send('OK');
  } catch (error) {
    console.error(error);
    return res.status(500).send('Error');
  }
}
