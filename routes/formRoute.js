const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const https = require('https');
const querystring = require('querystring');

// SMS Config
const USER_ID = "295";
const API_KEY = "ba048971-6e14-4358-87b6-b2add09a6734";
const SENDER_ID = "LogozoDev";

// DB Config - Hostinger
const dbConfig = {
  host: 'mysql.hostinger.com',
  user: 'u897936987_root',
  password: 'ik*Yc1]E8G+',
  database: 'u897936987_contact_db'
};

// POST /api/send-sms
router.post('/send-sms', async (req, res) => {
  const { first_name, last_name, email, number, subject, message } = req.body;
  if (!first_name || !last_name || !email || !number || !message) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const fullName = `${first_name} ${last_name}`;
  const smsMessage = `Hi ${fullName}, Thanks for contacting LogozoDev. We'll get back to you soon.`;

  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute(
      'INSERT INTO contact_messages (first_name, last_name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?, ?)',
      [first_name, last_name, email, number, subject, message]
    );
    await conn.end();

    const postData = querystring.stringify({
      user_id: USER_ID,
      api_key: API_KEY,
      sender_id: SENDER_ID,
      contact: number,
      message: smsMessage
    });

    const options = {
      hostname: 'smslenz.lk',
      path: '/api/send-sms',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length
      }
    };

    const apiReq = https.request(options, apiRes => {
      let data = '';
      apiRes.on('data', chunk => data += chunk);
      apiRes.on('end', () => {
        console.log("✅ SMS sent:", data);
        res.status(200).json({ message: "SMS sent and data saved!" });
      });
    });

    apiReq.on('error', error => {
      console.error("❌ SMS error:", error);
      res.status(500).json({ message: "SMS failed", error: error.message });
    });

    apiReq.write(postData);
    apiReq.end();
  } catch (error) {
    console.error("❌ DB error:", error);
    res.status(500).json({ message: "Database error", error: error.message });
  }
});

module.exports = router;
