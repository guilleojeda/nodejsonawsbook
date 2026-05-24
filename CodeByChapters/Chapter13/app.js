const express = require('express');
const app = express();
const {
    Pool
} = require('pg');
const bodyParser = require('body-parser');
const { createMetricRecorder } = require('./metrics');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
});

app.use(bodyParser.json());

const { recordMetric } = createMetricRecorder();

function hasDatabaseConfig() {
    return Boolean(
        process.env.DB_USER &&
        process.env.DB_HOST &&
        process.env.DB_NAME &&
        process.env.DB_PASS &&
        process.env.DB_PORT
    );
}

async function initializeDatabase() {
    if (!hasDatabaseConfig()) {
        return;
    }

    await pool.query(`
        CREATE TABLE IF NOT EXISTS data (
            id SERIAL PRIMARY KEY,
            value TEXT NOT NULL
        )
    `);
}

app.get('/health', (req, res) => {
    res.sendStatus(200);
});

app.get('/data', async(req, res) => {
    const startTime = Date.now();
    recordMetric('RequestCount', 1);

    try {
        const result = await pool.query('SELECT * FROM data');
        recordMetric('SuccessCount', 1);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        recordMetric('ErrorCount', 1);
        res.sendStatus(500);
    } finally {
        recordMetric('ResponseTime', Date.now() - startTime, 'Milliseconds');
    }
});
app.post('/data', async(req, res) => {
    const startTime = Date.now();
    recordMetric('RequestCount', 1);

    try {
        const {
            value
        } = req.body;
        await pool.query('INSERT INTO data (value) VALUES ($1)', [value]);
        recordMetric('SuccessCount', 1);
        res.sendStatus(201);
    } catch (err) {
        console.error(err);
        recordMetric('ErrorCount', 1);
        res.sendStatus(500);
    } finally {
        recordMetric('ResponseTime', Date.now() - startTime, 'Milliseconds');
    }
});
const port = process.env.PORT || 3000;

initializeDatabase()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server is listening on port ${port}`);
        });
    })
    .catch((err) => {
        console.error('Failed to initialize database', err);
        process.exit(1);
    });
