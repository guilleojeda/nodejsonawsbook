const express = require('express');
const app = express();
const { Pool } = require('pg');
const bodyParser = require('body-parser');

const pool = new Pool({
  user: 'your_database_user',
  host: 'localhost',
  database: 'your_database_name',
  password: 'your_database_password',
  port: 5432,
});

app.use(bodyParser.json());

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

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
