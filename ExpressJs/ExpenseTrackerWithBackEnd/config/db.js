const mysql = require('mysql2');

// Create MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'sql12770861',        // Update with your MySQL username
    password: 'Please wait',        // Update with your MySQL password
    database: 'expenses_db'
});

// Connect to MySQL
db.connect(err => {
    if (err) {
        console.error('❌ Database connection failed:', err);
        return;
    }
    console.log('✅ Connected to MySQL Database');

    // Create expenses table if not exists
    db.query(
        `CREATE TABLE IF NOT EXISTS expenses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            expenseAmount DECIMAL(10,2) NOT NULL,
            description VARCHAR(255) NOT NULL,
            category VARCHAR(50) NOT NULL
        )`,
        err => {
            if (err) console.error('❌ Error creating table:', err);
            else console.log('✅ Expenses table ready');
        }
    );
});

module.exports = db;
