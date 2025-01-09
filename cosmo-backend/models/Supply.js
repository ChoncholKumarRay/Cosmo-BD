const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
  {
    supply_id: { type: String, required: true, unique: true },
    ordered_products: [
      {
        product_id: { type: String, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    payment: { type: Number, required: true },
    bank_transaction: { type: String, required: true},
    buyer_name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    current_status: {
      code: { type: String},
      message: { type: String},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Supplier", supplierSchema, "supply");
