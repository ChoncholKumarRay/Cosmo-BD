const express = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const router = express.Router();
const Supply = require("../models/Supply");
const Product = require("../models/Product");

dotenv.config();

// Admin route to login 
router.post('/login', (req, res) => {
  const { username, password } = req.body;

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

// Admin route to get all the supplies 
router.get('/get-supply', authenticateJWT, async (req, res) => {
  try {
    // Fetch all supply records
    const supplies = await Supply.find();

    // Map over supplies to fetch product details and add calculated fields
    const enhancedSupplies = await Promise.all(
      supplies.map(async (supply) => {
        const enrichedProducts = await Promise.all(
          supply.ordered_products.map(async (orderedProduct) => {
            const product = await Product.findOne({ product_id: orderedProduct.product_id });

            if (product) {
              const subtotal_price = product.price * orderedProduct.quantity;
              return {
                product_id: product.product_id,
                name: product.name,
                price: product.price,
                quantity: orderedProduct.quantity,
                subtotal_price,
              };
            }

            return { product_id: orderedProduct.product_id, error: "Product not found" };
          })
        );

        // Calculate total_price as the sum of all subtotal_price
        const total_price = enrichedProducts
          .filter((product) => !product.error) // Exclude missing products
          .reduce((sum, product) => sum + product.subtotal_price, 0);

        return {
          ...supply.toObject(), // Convert Mongoose document to plain JS object
          enriched_products: enrichedProducts,
          total_price, // Include calculated total price
        };
      })
    );

    res.json(enhancedSupplies);
  } catch (error) {
    console.error("Error in fetching supply records:", error);
    res.status(500).json({ message: 'Failed to fetch supply records' });
  }
});

// Admin route to update status
router.post('/update-status', authenticateJWT, async (req, res) => {
  try {
    const { supplyId, status } = req.body;

    if (!supplyId || !status) {
      return res.status(400).json({ message: 'Supply ID and status are required' });
    }

    // For now, just log the data
    console.log(`Received request to update status`);
    console.log(`Supply ID: ${supplyId}`);
    console.log(`New Status: ${status}`);

    // Send success response
    res.status(200).json({ message: 'Status updated successfully!' });
  } catch (error) {
    console.error('Error in /update-status:', error);
    res.status(500).json({ message: 'Failed to update status' });
  }
});

module.exports = router;
