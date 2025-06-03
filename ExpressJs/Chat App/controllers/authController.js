const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

require('dotenv').config();

// Use environment variable for JWT secret or fallback to default
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

/**
 * User Registration Handler
 * Registers a new user after validating input and ensuring uniqueness.
 */
const registerPOST = (req, res) => {
  const { name, email, phone, password } = req.body;

  // Validate all required fields are provided
  if (!name || !email || !phone || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Check if user with same email or phone already exists
  db.query(
    'SELECT * FROM chat_users WHERE email = ? OR phone = ?',
    [email, phone],
    (err, results) => {
      if (err) {
        console.error('Register Error:', err.message);
        return res.status(500).json({ error: 'Server error during registration' });
      }

      // If a user already exists, prevent duplicate registration
      if (results.length > 0) {
        return res.status(400).json({ error: 'Email or phone already exists' });
      }

      // Hash the user's password securely before storing
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
          console.error('Hash Error:', err.message);
          return res.status(500).json({ error: 'Server error during registration' });
        }

        // Insert new user record with hashed password
        db.query(
          'INSERT INTO chat_users (username, email, phone, password) VALUES (?, ?, ?, ?)',
          [name, email, phone, hashedPassword],
          (err, result) => {
            if (err) {
              console.error('Insert Error:', err.message);
              return res.status(500).json({ error: err.message });
            }

            // Respond with success after user is created
            return res.status(201).json({ message: 'User registered successfully' });
          }
        );
      });
    }
  );
};

/**
 * User Login Handler
 * Authenticates user credentials and returns a JWT token on success.
 */
const loginPOST = (req, res) => {
  const { email, password } = req.body;

  // Validate required login fields
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Find user by email
  db.query('SELECT * FROM chat_users WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('Login Error:', err.message);
      return res.status(500).json({ error: 'Server error during login' });
    }

    // If user not found, reject login
    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = results[0];

    // Compare provided password with stored hashed password
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Compare Error:', err.message);
        return res.status(500).json({ error: 'Server error during login' });
      }

      // If passwords don't match, reject login
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT token with user info, expires in 1 hour
      const token = jwt.sign(
        { user_id: user.user_id, username: user.username },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Respond with token and basic user info (excluding password)
      return res.json({
        message: 'Login successful',
        token,
        user: {
          user_id: user.user_id,
          username: user.username,
          email: user.email,
          phone: user.phone,
        },
      });
    });
  });
};

module.exports = {
  registerPOST,
  loginPOST,
};
