export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(200).send('OK');

  const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
  const FIREBASE_DB_URL = "https://driup-39411-default-rtdb.asia-southeast1.firebasedatabase.app";

  try {
    const body = req.body;
    if (body.callback_query) {
      const callbackQuery = body.callback_query;
      const data = callbackQuery.data;
      const chatId = callbackQuery.message.chat.id;
      const messageId = callbackQuery.message.message_id;
      const callbackQueryId = callbackQuery.id;

      if (data.startsWith('acc_')) {
        const orderId = data.split('_')[1];

        // 1. Update status di Firebase jadi 'Sukses'
        await fetch(`${FIREBASE_DB_URL}/orders/${orderId}.json`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Sukses' })
        });

        // 2. Hentikan loading error di tombol Telegram
        await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ callback_query_id: callbackQueryId, text: 'Pesanan Sukses di-ACC!' })
        });

        // 3. Ubah tulisan pesan di Telegram
        const isPhoto = callbackQuery.message.photo !== undefined;
        const oldText = isPhoto ? callbackQuery.message.caption : callbackQuery.message.text;
        const newText = oldText + "\n\n✅ *STATUS: SUKSES (Di-ACC via Telegram)*";

        if (isPhoto) {
          await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/editMessageCaption`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, message_id: messageId, caption: newText, parse_mode: 'Markdown' })
          });
        } else {
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
