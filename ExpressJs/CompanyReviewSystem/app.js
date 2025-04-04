const express = require('express');
const path = require('path');
const db = require('./db'); // Import db.js

const app = express();

app.use(express.json());

// Serve static files (JS, CSS)
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html from views
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// POST review
app.post('/api/reviews', (req, res) => {
  const { companyName, prosName, consName, rating } = req.body;
   
  const sql = 'INSERT INTO reviews (companyName, prosName, consName, rating) VALUES (?, ?, ?, ?)';
  db.query(sql, [companyName, prosName, consName, rating], (err, result) => {
    if (err) {
      console.error("Error inserting review:", err);
      return res.status(500).send("Database error.");
    }
    res.status(201).send("Review submitted successfully!");
  });
});

app.get('/api/reviews', (req, res) => {
  const { company } = req.query; 

  const sql = 'SELECT * FROM reviews WHERE companyName = ?';
  db.query(sql, [company], (err, results) => {
    if (err) {
      console.error("❌ Error fetching reviews:", err);
      return res.status(500).send("Database error.");
    }
    res.json(results);
  });
});


const port = 3100;
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
