const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const formRoute = require('./routes/formRoute');

const app = express();

// ✅ Enable CORS
app.use(cors());

// ✅ Serve public static HTML files (optional for general access)
app.use(express.static(path.join(__dirname, 'files')));

// ✅ Parse JSON and form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ API routes
app.use('/api', formRoute);

// ✅ Admin route (secure folder or hidden file)
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'files/admin.html')); // or use 'secure/admin.html' if you create a secure folder
});

// ✅ Optional default route
app.get('/', (req, res) => {
  res.send('🚀 Contact Form API is running!');
});

// ✅ Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
