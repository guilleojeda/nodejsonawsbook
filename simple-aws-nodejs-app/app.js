const express = require('express');
const app = express();
const { Pool } = require('pg');
const bodyParser = require('body-parser');

const pool = new Pool({
  user: process.env.DB_USER || 'PostgresUser',
  host: process.env.DB_HOST || 'postgres',
  database: process.env.DB_NAME || 'SimpleAWSDB',
  password: process.env.DB_PASS || 'veryverysecret',
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

app.use(bodyParser.json());

app.get('/health', (req, res) => {
  res.sendStatus(200);
});

app.get('/data', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM data');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.post('/data', async (req, res) => {
  try {
    const { value } = req.body;
    await pool.query('INSERT INTO data (value) VALUES ($1)', [value]);
    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

const port = Number(process.env.PORT || 3000);
const server = app.listen(port, '0.0.0.0', () => {
  const address = server.address();
  console.log(`Server is listening on port ${address.port}`);
});
