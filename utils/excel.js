const ExcelJS = require('exceljs');
const Order = require('../models/Order');

async function exportOrdersToExcel(res) {
  const orders = await Order.find().sort({ createdAt: -1 });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('訂單');

  sheet.columns = [
    { header: '時間', key: 'createdAt', width: 20 },
    { header: '機構', key: 'orgName', width: 25 },
    { header: '負責人', key: 'ownerName', width: 15 },
    { header: '手機', key: 'phone', width: 15 },
    { header: '業務', key: 'salesName', width: 15 },
    { header: '商品', key: 'items', width: 40 },
    { header: '總額', key: 'totalAmount', width: 12 },
    { header: '狀態', key: 'status', width: 10 }
  ];

  orders.forEach(order => {
    sheet.addRow({
      createdAt: order.createdAt.toLocaleString('zh-TW'),
      orgName: order.orgName,
      ownerName: order.ownerName,
      phone: order.phone,
      salesName: order.salesName,
      items: order.items.map(i => `${i.name} x${i.qty}`).join('; '),
      totalAmount: order.totalAmount,
      status: order.status
    });
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=創益生技訂單_${new Date().toISOString().slice(0,10)}.xlsx`);
  await workbook.xlsx.write(res);
  res.end();
}

module.exports = { exportOrdersToExcel };