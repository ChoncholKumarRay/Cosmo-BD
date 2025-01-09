const express = require("express");
const router = express.Router();
const Supply = require("../models/Supply");

// API endpoint to create a new supply document
router.post("/req-supply", async (req, res) => {
  const {
    supply_id,
    ordered_products,
    payment,
    bank_transaction,
    buyer_name,
    phone,
    address,
  } = req.body;
  const artisan_payment = parseInt(payment, 10);

  if (
    !supply_id ||
    !ordered_products ||
    !payment ||
    !bank_transaction ||
    !buyer_name ||
    !phone ||
    !address
  ) {
    return res.status(400).json({
      message: "All fields are required (supply_id, ordered_products, payment, bank_transaction, buyer_name, phone, address).",
    });
  }

  try {
    const existingSupply = await Supply.findOne({ supply_id });
    if (existingSupply) {
      return res.status(400).json({
        message: `A supply with the ID ${supply_id} already exists.`,
      });
    }

    // Create a new supply document
    const newSupply = new Supply({
      supply_id,
      ordered_products,
      payment:artisan_payment,
      bank_transaction,
      buyer_name,
      phone,
      address,
      current_status: { code: "", message: "" }, // Initially blank
    });

    // Save the new supply document to the collection
    await newSupply.save();

    return res.status(201).json({
      success: true,
      message: "Supply created successfully.",
    });
  } catch (error) {
    console.error("Error creating supply:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while creating the supply.",
    });
  }
});

module.exports = router;