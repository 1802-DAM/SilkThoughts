
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const foroRoutes = require('./src/routes/foroRoutes');
const agendaRoutes = require('./src/routes/agendaRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const psicologoRoutes = require('./src/routes/psicologoRoutes');


const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SilkThoughts API funcionando' });
});

app.get('/api/db-test', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM ROL');
    res.json({ status: 'ok', roles: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/forum', foroRoutes);
app.use('/api/agenda', agendaRoutes);
app.use ('/api/admin', adminRoutes);
app.use('/api/psicologos', psicologoRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});