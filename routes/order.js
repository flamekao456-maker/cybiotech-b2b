const express = require('express');
const jwt = require('jsonwebtoken');
const Product = require('../models/Product');
const Order = require('../models/Order');
const router = express.Router();

router.get('/products', async (req, res) => {
  const products = await Product.getAll();
  res.json(products);
});

router.post('/order', async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ msg: '請登入' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { items, shippingAddress, note } = req.body;
    const totalAmount = items.reduce((sum, i) => sum + (i.price * i.qty), 0);

    const order = new Order({
      lineUserId: decoded.lineUserId,
      displayName: decoded.displayName,
      orgName: req.body.orgName,
      ownerName: req.body.ownerName,
      phone: req.body.phone,
      salesName: req.body.salesName,
      items,
      totalAmount,
      shippingAddress,
      note
    });
    await order.save();

    res.json({ msg: '訂單成功', orderId: order._id });
  } catch (err) {
    res.status(401).json({ msg: '驗證失敗' });
  }
});

module.exports = router;