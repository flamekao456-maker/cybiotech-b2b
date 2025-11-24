const express = require('express');
const Order = require('../models/Order');
const { exportOrdersToExcel } = require('../utils/excel');
const router = express.Router();

router.post('/login', (req, res) => {
  if (req.body.password === process.env.ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false });
  }
});

router.get('/orders', async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

router.get('/export', async (req, res) => {
  await exportOrdersToExcel(res);
});

module.exports = router;