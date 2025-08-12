const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors({ origin: ['https://logozodev.com', 'http://localhost:5173'] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'files')));
app.use('/api', require('./routes/formRoute'));

app.get('/', (_req, res) => res.send('✅ API is live'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server on ${PORT}`));
