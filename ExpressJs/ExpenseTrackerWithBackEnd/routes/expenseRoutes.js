const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');

// Routes
router.post('/add', expenseController.addExpense);
router.get('/get', expenseController.getExpenses);
router.delete('/delete/:id', expenseController.deleteExpense);
router.put('/update/:id', expenseController.updateExpense);

module.exports = router;
