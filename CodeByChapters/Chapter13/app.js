const express = require('express');
const app = express();
const {
    Pool
} = require('pg');
const bodyParser = require('body-parser');
const AWSXRay = require('aws-xray-sdk'); // Import the X-Ray SDK
const AWSXRayPostgres = require('aws-xray-sdk-postgres'); // Import the X-Ray SDK for Postgres
const pg = AWSXRayPostgres.capturePostgres(require('pg'));

const pool = new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
});
// Use the X-Ray middleware
app.use(AWSXRay.express.openSegment('SimpleAWSNodejsApp'));

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
// Close the X-Ray segment
app.use(AWSXRay.express.closeSegment());

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});