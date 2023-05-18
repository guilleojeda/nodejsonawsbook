const express = require('express');
const app = express();
const {
    Pool
} = require('pg');
const bodyParser = require('body-parser');

const pool = new Pool({ //replace these values
    user: 'your_database_user',
    host: 'your_cluster_endpoint',
    database: 'your_database_name',
    password: 'your_database_password',
    port: 5432,
});
app.use(bodyParser.json());

app.get('/data', async(req, res) => {
    try {
        const result = await pool.query('SELECT * FROM data');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});
app.post('/data', async(req, res) => {
    try {
        const {
            value
        } = req.body;
        await pool.query('INSERT INTO data (value) VALUES ($1)', [value]);
        res.sendStatus(201);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});
app.get('/health', (req, res) => {
    res.sendStatus(200);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});