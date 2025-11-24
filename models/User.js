const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  orgName:     { type: String, required: true },    // 機構名稱
  ownerName:   { type: String, required: true },    // 負責人
  phone:       { type: String, required: true },    // 手機
  salesName:   { type: String, required: true },    // 業務員
  password:    { type: String, required: true },    // 密碼（之後會加密）
  agreedPolicy: { type: Boolean, default: false },  // 同意條款
  agreedPrivacy:{ type: Boolean, default: false },  // 同意隱私權
  createdAt:   { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);