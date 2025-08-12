const https = require('https');
const querystring = require('querystring');
const db = require('../config/db');

exports.sendSms = async (req, res) => {
  const { first_name, last_name, email, number, subject, message } = req.body;
  if (!first_name || !last_name || !email || !number || !message) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const fullName = `${first_name} ${last_name}`;
  const smsMessage = `Hi ${fullName}, Thanks for contacting LogozoDev. We'll reach out soon!`;

  try {
    await db.execute(
      'INSERT INTO contact_messages (first_name,last_name,email,phone,subject,message) VALUES (?,?,?,?,?,?)',
      [first_name, last_name, email, number, subject || null, message]
    );

    const postData = querystring.stringify({
      user_id: process.env.SMS_USER_ID,
      api_key: process.env.SMS_API_KEY,
      sender_id: process.env.SMS_SENDER_ID,
      contact: number,
      message: smsMessage
    });

    const options = {
      hostname: 'smslenz.lk',
      path: '/api/send-sms',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const apiReq = https.request(options, apiRes => {
      let data = '';
      apiRes.on('data', c => (data += c));
      apiRes.on('end', () => res.status(200).json({ ok: true, sms: data }));
    });
    apiReq.on('error', err => res.status(502).json({ ok: false, error: err.message }));
    apiReq.write(postData);
    apiReq.end();
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};

exports.getAllMessages = async (_req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM contact_messages ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteMessage = async (req, res) => {
  try {
    const [r] = await db.execute('DELETE FROM contact_messages WHERE id=?', [req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ message: 'Not found' });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
