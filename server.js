const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const formRoute = require('./routes/formRoute');

const app = express();

// Allow CORS from your domain
app.use(cors({ origin: 'https://logozodev.com' }));

// JSON & Form Data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static admin.html (if needed)
app.use(express.static(path.join(__dirname, 'files')));

// API Route
app.use('/api', formRoute);

// Optional route
app.get('/', (req, res) => {
  res.send('✅ API is live');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
