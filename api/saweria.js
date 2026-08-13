export default async function handler(req, res) {
  // Saweria akan menembakkan request POST ke webhook ini
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Hanya menerima POST' });
  }

  try {
    const data = req.body;
    
    // Mengambil data dari Saweria
    const pesan = data.message || ""; 
    const amount = data.amount || 0;
    const donator = data.donator_name || "Seseorang";
    
    // Sistem pintar untuk mencari tulisan "DRIUP-XXXXXX" di dalam pesan Saweria
    const orderIdMatch = pesan.match(/DRIUP-\d+/i);
    
    if (orderIdMatch) {
      const orderId = orderIdMatch[0].toUpperCase();
      
      // 1. UPDATE FIREBASE OTOMATIS JADI "Sukses"
      const firebaseUrl = `https://driup-39411-default-rtdb.asia-southeast1.firebasedatabase.app/orders/${orderId}.json`;
      await fetch(firebaseUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Sukses' })
      });

      // 2. KIRIM NOTIFIKASI KE TELEGRAM ADMIN BAHWA SUDAH LUNAS
      const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
      const CHAT_ID_ENV = process.env.CHAT_ID;
      
      if (TELEGRAM_TOKEN && CHAT_ID_ENV) {
        const chatIds = CHAT_ID_ENV.split(',').map(id => id.trim());
        const text = `🎉 *AUTO-ACC SAWERIA BERHASIL!* 🎉\n\n*Order ID:* \`${orderId}\`\n*Pembayar:* ${donator}\n*Nominal:* Rp ${amount.toLocaleString('id-ID')}\n*Pesan Pembeli:* ${pesan}\n\n✅ _Status pesanan di web otomatis berubah menjadi SUKSES!_`;
        
        const sendPromises = chatIds.map(chatId => {
          return fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'Markdown' })
          });
        });
        await Promise.all(sendPromises);
      }
    }

    // Wajib membalas status 200 agar Saweria tahu webhook berhasil
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Saweria Webhook Error:', error);
    res.status(500).json({ error: 'Gagal diproses' });
  }
}
