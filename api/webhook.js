export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send();

  try {
    const update = req.body;
    if (update.callback_query && update.callback_query.data.startsWith('ACC_')) {
      const orderId = update.callback_query.data.replace('ACC_', '');
      const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;

      // Update Firebase
      const firebaseUrl = `https://driup-39411-default-rtdb.asia-southeast1.firebasedatabase.app/orders/${orderId}.json`;
      await fetch(firebaseUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Sukses' })
      });

      // Update Pesan Telegram (tambahkan status sukses)
      await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/editMessageCaption`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: update.callback_query.message.chat.id,
          message_id: update.callback_query.message.message_id,
          caption: update.callback_query.message.caption + "\n\n✅ *STATUS: SUKSES (Telah di-ACC)*",
          parse_mode: 'Markdown',
          reply_markup: { inline_keyboard: [] } 
        })
      });
    }
    res.status(200).send("OK");
  } catch (error) {
    res.status(500).send(error.message);
  }
}
