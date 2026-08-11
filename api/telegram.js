export default async function handler(req, res) {
  // Hanya menerima permintaan berbentuk POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderId, gameName, itemsBeli, total, nama, wa, idg, zone } = req.body;

  // Mengambil token dan Chat ID dari Vercel Environment Variables
  const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
  const CHAT_ID = process.env.CHAT_ID;

  if (!TELEGRAM_TOKEN || !CHAT_ID) {
    return res.status(500).json({ error: 'Token atau Chat ID Telegram belum diatur di Vercel' });
  }

  // Format pesan yang dikirim ke Telegram
  const textTelegram = `
🔔 *PESANAN BARU MASUK!* 🔔

*ID Order:* ${orderId}
*Game:* ${gameName}
*Item:* ${itemsBeli}
*Total Pembayaran:* Rp ${total.toLocaleString('id-ID')}

👤 *Data Pembeli:*
*Nama:* ${nama}
*No. WA:* ${wa}

🎮 *Data Game:*
*ID Game:* ${idg}
*Zone/Server:* ${zone || '-'}
`;
  
  // URL API Bot Telegram
  const urlTelegram = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(textTelegram)}&parse_mode=Markdown`;

  try {
    const response = await fetch(urlTelegram);
    const data = await response.json();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ error: 'Gagal mengirim pesan ke Telegram' });
  }
}
