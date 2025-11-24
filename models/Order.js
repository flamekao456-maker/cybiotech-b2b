const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  lineUserId: String,
  displayName: String,
  orgName: String,
  ownerName: String,
  phone: String,
  salesName: String,
  items: [{ name: String, price: Number, qty: Number, subtotal: Number }],
  totalAmount: Number,
  shippingAddress: String,
  note: String,
  status: { type: String, default: '新訂單' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);