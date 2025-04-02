const db = require('../config/db');

exports.addExpense = (req, res) => {
    const { expenseAmount, description, category } = req.body;
    db.query('INSERT INTO expenses (expenseAmount, description, category) VALUES (?, ?, ?)',
        [expenseAmount, description, category],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Expense added!', id: result.insertId });
        }
    );
};

exports.getExpenses = (req, res) => {
    db.query('SELECT * FROM expenses', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

exports.deleteExpense = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM expenses WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Expense deleted!' });
    });
};

exports.updateExpense = (req, res) => {
    const { id } = req.params;
    const { expenseAmount, description, category } = req.body;
    db.query(
        'UPDATE expenses SET expenseAmount = ?, description = ?, category = ? WHERE id = ?',
        [expenseAmount, description, category, id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Expense updated!' });
        }
    );
};
