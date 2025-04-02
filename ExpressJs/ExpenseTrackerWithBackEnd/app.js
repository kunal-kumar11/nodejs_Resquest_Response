const express = require('express');
const cors = require('cors');
const path = require('path');
const expenseRoutes = require('./routes/expenseRoutes');
//const db = require('./config/db'); 
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use('/api/expenses', expenseRoutes);

const PORT = 4500;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
