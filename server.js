const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const formRoute = require('./routes/formRoute');

const app = express();

// ✅ Enable CORS for all origins (you can restrict in production)
app.use(cors());

// ✅ Serve static files (e.g., HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'files')));

// ✅ Parse JSON and URL-encoded form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ API routes (form submissions, etc.)
app.use('/api', formRoute);

// ✅ Admin panel (you can protect this later)
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'files', 'admin.html'));
});

// ✅ Home route (useful for testing base URL)
app.get('/', (req, res) => {
  res.send('🚀 LogozoDev Contact Form API is running!');
});

// ✅ Use environment port (important for Railway/Render)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
