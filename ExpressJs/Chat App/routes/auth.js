const express = require('express');
const authController=require('../controllers/authController')
const router = express.Router();


// Register (callback style)
router.post('/register', authController.registerPOST);

// Login (callback style)
router.post('/login',authController.loginPOST);

module.exports = router;
