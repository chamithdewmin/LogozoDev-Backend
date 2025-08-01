const mysql = require('mysql2/promise');
const https = require('https');
const querystring = require('querystring');

// ✅ SMS API Config
const USER_ID = "295";
const API_KEY = "ba048971-6e14-4358-87b6-b2add09a6734";
const SENDER_ID = "LogozoDev";

// ✅ MySQL Config (Hostinger)
const dbConfig = {
  host: 'mysql.hostinger.com',
  user: 'u897936987_root',
  password: 'ik*Yc1]E8G+',
  database: 'u897936987_contact_db'
};

// ✅ Send SMS + Save to DB
exports.sendSms = async (req, res) => {
  const { first_name, last_name, email, number, subject, message } = req.body;

  // Validate input
  if (!first_name || !last_name || !email || !number || !message) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const fullName = `${first_name} ${last_name}`;
  const smsMessage = `Hi ${fullName},\nThanks for contacting LogozoDev. We'll reach out to you soon!`;

  try {
    // 🔗 Save to MySQL
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute(
      'INSERT INTO contact_messages (first_name, last_name, email, number, subject, message) VALUES (?, ?, ?, ?, ?, ?)',
      [first_name, last_name, email, number, subject, message]
    );
    await conn.end();

    // 📤 Send SMS
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
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const apiReq = https.request(options, apiRes => {
      let data = '';
      apiRes.on('data', chunk => data += chunk);
      apiRes.on('end', () => {
        console.log("✅ SMS Sent:", data);
        res.status(200).json({ message: "SMS sent and data saved successfully!" });
      });
    });

    apiReq.on('error', error => {
      console.error("❌ SMS Send Error:", error);
      res.status(500).json({ message: "SMS send failed", error: error.message });
    });

    apiReq.write(postData);
    apiReq.end();
  } catch (error) {
    console.error("❌ DB Save Error:", error);
    res.status(500).json({ message: "Database error", error: error.message });
  }
};

// ✅ Get All Messages
exports.getAllMessages = async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute(
      'SELECT * FROM contact_messages ORDER BY created_at DESC'
    );
    await conn.end();

    res.status(200).json(rows);
  } catch (error) {
    console.error("❌ Fetch Error:", error);
    res.status(500).json({ message: "Failed to fetch messages", error: error.message });
  }
};

// ✅ Delete Message by ID
exports.deleteMessage = async (req, res) => {
  const { id } = req.params;

  try {
    const conn = await mysql.createConnection(dbConfig);
    const [result] = await conn.execute('DELETE FROM contact_messages WHERE id = ?', [id]);
    await conn.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.status(200).json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error("❌ Delete Error:", error);
    res.status(500).json({ message: "Failed to delete message", error: error.message });
  }
};
