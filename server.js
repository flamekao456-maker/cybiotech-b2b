require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// 靜態檔案：public 資料夾（首頁、register.html 等）
app.use(express.static(path.join(__dirname, 'public')));

// 靜態檔案：views 資料夾（admin.html）
app.use('/admin', express.static(path.join(__dirname, 'views')));

// 強制讓 /admin 也能正確跳轉到 admin.html
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

// 路由
app.use('/api/auth', require('./routes/auth'));

// MongoDB 連線
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cybiotech')
  .then(() => console.log('MongoDB 連線成功！'))
  .catch(err => console.log('MongoDB 連線失敗：', err));

// 首頁綠色提示
app.get('/', (req, res) => {
  res.send(`
    <h1 style="color:green;text-align:center;margin-top:100px;font-family:Arial;">
      創益生技 B2B 系統已啟動！<br><br>
      <a href="/admin" style="font-size:20px;">🔐 點我進入管理後台</a>　|　
      <a href="/register.html" style="font-size:20px;">📝 會員註冊頁面</a>
    </h1>
  `);
});

// 管理員登入（密碼 cybiotech2025）
app.post('/admin/login', express.json(), (req, res) => {
  if (req.body.password === 'cybiotech2025') {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false });
  }
});

// 取得所有訂單
app.get('/admin/orders', async (req, res) => {
  try {
    const Order = require('./models/Order');
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (e) {
    res.json([]);
  }
});

// Excel 匯出
app.get('/admin/export', async (req, res) => {
  try {
    const ExcelJS = require('exceljs');
    const Order = require('./models/Order');
    const orders = await Order.find().sort({ createdAt: -1 });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('訂單');
    sheet.columns = [
      { header: '時間', key: 'time', width: 20 },
      { header: '機構名稱', key: 'org', width: 28 },
      { header: '負責人', key: 'owner', width: 15 },
      { header: '手機', key: 'phone', width: 15 },
      { header: '業務員', key: 'sales', width: 12 },
      { header: '購買商品', key: 'items', width: 45 },
      { header: '總金額', key: 'amount', width: 12 },
      { header: '狀態', key: 'status', width: 10 }
    ];

    orders.forEach(o => {
      sheet.addRow({
        time: new Date(o.createdAt).toLocaleString('zh-TW'),
        org: o.orgName || '',
        owner: o.ownerName || '',
        phone: o.phone || '',
        sales: o.salesName || '',
        items: o.items ? o.items.map(i => `${i.name} x${i.qty}`).join('；') : '',
        amount: o.totalAmount || 0,
        status: o.status || '新訂單'
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=cybiotech_orders_${new Date().toISOString().slice(0,10)}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).send('匯出失敗');
  }
});

// 啟動伺服器（支援 Render 的 PORT）
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`=======================================`);
  console.log(`創益生技 B2B 系統已啟動！`);
  console.log(`本機測試：http://localhost:${PORT}`);
  console.log(`後台登入：http://localhost:${PORT}/admin`);
  console.log(`會員註冊：http://localhost:${PORT}/register.html`);
  console.log(`=======================================`);
});