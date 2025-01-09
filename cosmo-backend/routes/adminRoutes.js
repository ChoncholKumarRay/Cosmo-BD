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

    // Mapping status with corresponding code
    const statusCodeMap = {
      Acknowledged: 450,
      Packaged: 550,
      Delivered: 650,
    };

    const code = statusCodeMap[status];
    if (!code) {
      return res.status(400).json({ message: 'Invalid status provided' });
    }
    const verificationCode = process.env.MY_VERIFICATION_CODE;
    if (!verificationCode) {
      return res.status(500).json({ message: 'Server configuration error: Verification code not found' });
    }

    // Call external API using fetch
    const response = await fetch('http://localhost:5000/api/order/update-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        supply_id:supplyId,
        code,
        status,
        verification_code: verificationCode,
      }),
    });

    // Handle response from external API
    const responseData = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ message: responseData.message || 'Failed to update status in the external system' });
    }

    const supply = await Supply.findOne({ supply_id: supplyId });
    if (!supply) {
      return res.status(404).json({ message: 'Supply record not found.' });
    }

    // Update current_status in the supply document
    supply.current_status = status;
    await supply.save();

    res.status(200).json({ message: 'Status updated successfully!' });
  } catch (error) {
    console.error('Error in /update-status:', error);
    res.status(500).json({ message: 'Failed to update status' });
  }
});

module.exports = router;
