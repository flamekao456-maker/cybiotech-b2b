const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// 註冊 API
router.post('/register', async (req, res) => {
  try {
    const { orgName, ownerName, phone, salesName, password, agreedPolicy, agreedPrivacy } = req.body;

    if (!agreedPolicy || !agreedPrivacy) return res.status(400).json({ msg: '請同意條款' });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ orgName, ownerName, phone, salesName, password: hashed, agreedPolicy: true, agreedPrivacy: true });
    await user.save();

    const token = jwt.sign({ id: user._id }, 'cybiotech-secret-2025', { expiresIn: '30d' });
    res.json({ success: true, token, user: { orgName, ownerName, phone, salesName } });
  } catch (e) {
    res.status(500).json({ msg: '註冊失敗' });
  }
});

// 登入 API
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user) return res.status(400).json({ msg: '帳號或密碼錯誤' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: '帳號或密碼錯誤' });

    const token = jwt.sign({ id: user._id }, 'cybiotech-secret-2025', { expiresIn: '30d' });
    res.json({ success: true, token, user: { orgName: user.orgName, ownerName: user.ownerName, phone: user.phone, salesName: user.salesName } });
  } catch (e) {
    res.status(500).json({ msg: '登入失敗' });
  }
});

module.exports = router;