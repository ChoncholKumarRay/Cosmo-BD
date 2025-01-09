const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken'); 
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes')

dotenv.config(); 

const app = express();

app.use(cors());
app.use(express.json()); 

// MongoDB connection
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));


// Print all api call
// app.use((req, res, next) => {
//   console.log(`${req.method} ${req.url}`);
//   next();
// });
  

// Admin route
app.use('/api/admin', adminRoutes); 


// User routes for other functionality
app.use('/api/user', userRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
