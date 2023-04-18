const express = require('express');
const mysql = require('mysql2/promise');
const config = require('./config.json');

const app = express();
app.use(express.json());

const pool = mysql.createPool({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// GET all leads
app.get('/leads', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM leads');
  res.json(rows);
});

// GET a lead by ID
app.get('/leads/:id', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM leads WHERE id = ?', [req.params.id]);
  if (rows.length === 0) {
    res.status(404).send('Lead not found');
  } else {
    res.json(rows[0]);
  }
});

// POST a new lead
app.post('/leads', async (req, res) => {
  const { name, mobile_number, email, gender, category, course, Enquiry_date, status } = req.body;
  const [result] = await pool.query('INSERT INTO leads (name, mobile_number, email, gender, category, course, Enquiry_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [name, mobile_number, email, gender, category, course, Enquiry_date, status]);
  const id = result.insertId;
  const [row] = await pool.query('SELECT * FROM leads WHERE id = ?', [id]);
  res.status(201).json(row);
});

// PUT a lead by ID
app.put('/leads/:id', async (req, res) => {
  const { name, mobile_number, email, gender, category, course, Enquiry_date, status } = req.body;
  const [result] = await pool.query('UPDATE leads SET name = ?, mobile_number = ?, email = ?, gender = ?, category = ?, course = ?, Enquiry_date = ?, status = ? WHERE id = ?', [name, mobile_number, email, gender, category, course, Enquiry_date, status, req.params.id]);
  if (result.affectedRows === 0) {
    res.status(404).send('Lead not found');
  } else {
    const [row] = await pool.query('SELECT * FROM leads WHERE id = ?', [req.params.id]);
    res.json(row);
  }
});

// DELETE a lead by ID
app.delete('/leads/:id', async (req, res) => {
  const [result] = await pool.query('DELETE FROM leads WHERE id = ?', [req.params.id]);
  if (result.affectedRows === 0) {
    res.status(404).send('Lead not found');
  } else {
    res.status(204).send();
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
