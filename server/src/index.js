const express = require('express');
const cors = require('cors');
const pool = require('./db');

const subjectsRouter = require('./routes/subjects');
const filesRouter = require('./routes/files');
const statusesRouter = require('./routes/statuses');
const teachersRouter = require('./routes/teachers');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', subjectsRouter);
app.use('/api', filesRouter);
app.use('/api', statusesRouter);
app.use('/api', teachersRouter);

// Проверка подключения к БД при старте
pool
  .query('SELECT 1')
  .then(() => {
    console.log('Connected to PostgreSQL');
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to connect to PostgreSQL:', err.message);
    process.exit(1);
  });
