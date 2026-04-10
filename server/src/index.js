const express = require('express');
const cors = require('cors');
const pool = require('./db');
const tables = require('./tables');

const subjectsRouter = require('./routes/subjects');
const filesRouter = require('./routes/files');
const statusesRouter = require('./routes/statuses');
const teachersRouter = require('./routes/teachers');
const directionsRouter = require('./routes/directions');
const reportRouter = require('./routes/report');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', directionsRouter);
app.use('/api', reportRouter);
app.use('/api', subjectsRouter);
app.use('/api', filesRouter);
app.use('/api', statusesRouter);
app.use('/api', teachersRouter);

pool
  .query('SELECT 1')
  .then(() => tables.init())
  .then(() => {
    console.log('Connected to PostgreSQL');
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to start:', err.message);
    process.exit(1);
  });
