const express = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const router = express.Router();

dotenv.config();

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  console.log(req.body);

  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Middleware to verify JWT token
const authenticateJWT = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(403).json({ message: "Access Denied" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    req.user = user;
    next();
  });
};

// Admin route to get all bank users
// router.get('/get-supply', authenticateJWT, async (req, res) => {
//   try {
//     const users = await User.find({}, 'username bank_account balance'); 
//     res.json(users);
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to fetch users' });
//   }
// });

// module.exports = router;
