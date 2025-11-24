require('dotenv').config();
const express=require('express'),mongoose=require('mongoose'),cors=require('cors'),path=require('path'),app=express();
app.use(cors());
app.use(express.json());
const jwt = require('jsonwebtoken');
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).send('請先登入');
  try {
    const decoded = jwt.verify(token, 'cybiotech-secret-2025');
    req.user = decoded;
    next();
  } catch (e) { res.status(401).send('登入過期'); }
};
app.use('/admin',express.static(path.join(__dirname,'views'),{index:'admin.html'}));
app.use(express.static(path.join(__dirname,'public'))); // 這行讓 register.html 能被讀到！
app.use('/api/auth',require('./routes/auth'));
mongoose.connect('mongodb://127.0.0.1:27017/cybiotech').then(()=>console.log('MongoDB 連線成功！')).catch(e=>console.log('連線失敗',e));
app.get('/',(req,res)=>res.send('<h1 style="color:green;text-align:center;margin-top:100px;">創益生技 B2B 系統已啟動！<br><a href="/admin">管理後台</a> | <a href="/register.html">會員註冊</a></h1>'));
app.post('/admin/login',(req,res)=>req.body.password==='cybiotech2025'?res.json({success:true}):res.status(401).json({success:false}));
app.get('/admin/orders', authMiddleware, async (req, res) => { ... });
app.get('/admin/export', authMiddleware, async (req, res) => { ... });
app.get('/admin/orders',async(req,res)=>{try{const Order=require('./models/Order');res.json(await Order.find().sort({createdAt:-1}))}catch(e){res.json([])}});
app.get('/admin/export',async(req,res)=>{try{const ExcelJS=require('exceljs'),Order=require('./models/Order'),o=await Order.find().sort({createdAt:-1}),wb=new ExcelJS.Workbook(),ws=wb.addWorksheet('訂單');ws.columns=[{header:'時間',key:'t',width:20},{header:'機構',key:'o',width:25},{header:'負責人',key:'n',width:15},{header:'手機',key:'p',width:15},{header:'業務',key:'s',width:15},{header:'商品',key:'i',width:40},{header:'總額',key:'a',width:12},{header:'狀態',key:'st',width:10}];o.forEach(x=>ws.addRow({t:new Date(x.createdAt).toLocaleString('zh-TW'),o:x.orgName||'',n:x.ownerName||'',p:x.phone||'',s:x.salesName||'',i:x.items?x.items.map(i=>i.name+' x'+i.qty).join('; '):'',a:x.totalAmount||0,st:x.status||'新訂單'}));res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');res.setHeader('Content-Disposition','attachment; filename=cybiotech_orders_'+new Date().toISOString().slice(0,10)+'.xlsx');await wb.xlsx.write(res);res.end()}catch(e){res.status(500).send('匯出失敗')}});
app.listen(3000,()=>{console.log('系統啟動完成！http://localhost:3000');require('child_process').exec('start http://localhost:3000')});
