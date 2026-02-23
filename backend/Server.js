require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. โหลด .env ก่อนเพื่อนเลย! (สำคัญมาก ต้องอยู่บนๆ)


// 2. ค่อยเรียกใช้ตัวแปรจาก .env
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key"; 

// --- 1. CONFIGURATION ---
const app = express();

app.use(cors());

app.use(express.json());


// เชื่อมต่อ MongoDB ด้วย URL จาก .env
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log(err));

// --- 2. SCHEMAS & MODELS ---

// [Schema 1] Product Catalog: สำหรับโชว์หน้า Shop (แก้ไขง่าย, โหลดเร็ว)
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  factory: String,
  dealer: String,
  lotId: String,     // <--- กุญแจสำคัญ! ใช้เชื่อมกับ Blockchain
  description: String
});
const Product = mongoose.model('Product', productSchema);

// [Schema 2] Blockchain Block: สำหรับเก็บ History (แก้ไขไม่ได้, ปลอดภัย)
const blockSchema = new mongoose.Schema({
  index: Number,
  timestamp: String,
  data: Object,      // เก็บ product_id, status, location
  previousHash: String,
  hash: String
});
const BlockModel = mongoose.model('Block', blockSchema);

// [Schema 3] Users: สำหรับจัดการระบบสมาชิก
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "user" } 
});
const User = mongoose.model('User', userSchema);

// --- 3. HELPER FUNCTIONS (Blockchain Logic) ---
const calculateHash = (index, previousHash, timestamp, data) => {
  return crypto
    .createHash('sha256')
    .update(index + previousHash + timestamp + JSON.stringify(data))
    .digest('hex');
};

// --- 4. API ROUTES ---

// ==========================================
// A. ส่วนจัดการสินค้า (Product Catalog)
// ==========================================

// 1. ดึงสินค้าทั้งหมดไปโชว์หน้า Shop
app.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. สร้างสินค้าลงหน้าร้าน (Add to Catalog)
app.post('/products', async (req, res) => {
  try {
   if (Array.isArray(req.body)) {
      const newProducts = await Product.insertMany(req.body);
      return res.status(201).json({ message: "เพิ่มสินค้าหลายรายการเรียบร้อย!", products: newProducts });
    } else {
      // ถ้าส่งมาเป็น Object { } ปกติ
      const newProduct = new Product(req.body);
      await newProduct.save();
      return res.status(201).json({ message: "เพิ่มสินค้าลงหน้าร้านเรียบร้อย!", product: newProduct });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// D. ส่วนจัดการผู้ใช้งาน (Authentication)
// ==========================================

// 1. Register (สมัครสมาชิก)
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // เช็คว่ามี username นี้ในระบบหรือยัง
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username นี้มีผู้ใช้งานแล้ว" });
    }

    // เข้ารหัส Password (Hashing)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // บันทึกลง Database
    const newUser = new User({
      username,
      password: hashedPassword
    });

    await newUser.save();
    res.status(201).json({ message: "สมัครสมาชิกสำเร็จ!" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Login (เข้าสู่ระบบ)
app.post('/login', async (req, res) => {
  console.log("LOGIN HIT")
  try {
    const { username, password } = req.body;

    // หา User ใน Database
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "ไม่พบ Username นี้ในระบบ" });
    }

    // เทียบ Password ที่ส่งมา กับที่เข้ารหัสไว้ใน Database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "รหัสผ่านไม่ถูกต้อง" });
    }

    // สร้าง Token (บัตรผ่าน) มีอายุ 1 วัน
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role }, 
      JWT_SECRET, 
      { expiresIn: '1d' }
    );

    res.json({ 
      message: "เข้าสู่ระบบสำเร็จ!", 
      token, 
      user: { username: user.username, role: user.role } 
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// B. ส่วน Blockchain (Tracking)
// ==========================================

// 3. ดึงประวัติสินค้า (Timeline) โดยค้นหาจาก lotId
app.get('/chain/:lotId', async (req, res) => {
  try {
    // ค้นหาใน Blockchain ว่า data.product_id ตรงกับ lotId มั้ย
    const chain = await BlockModel.find({ "data.product_id": req.params.lotId }).sort({ index: 1 });
    
    if (chain.length === 0) {
      return res.status(404).json({ message: "ไม่พบประวัติสินค้าใน Blockchain" });
    }
    res.json(chain);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. เพิ่ม Block ใหม่ (Genesis หรือ Update Status)
app.post('/chain', async (req, res) => {
  try {
    // หา Block ล่าสุดเพื่อเอา Previous Hash
    const lastBlock = await BlockModel.findOne().sort({ index: -1 });
    
    let newIndex = 0;
    let prevHash = "0"; // Genesis Block

    if (lastBlock) {
      newIndex = lastBlock.index + 1;
      prevHash = lastBlock.hash;
    }

    // รับข้อมูลจาก Body
    const { product_id, item, status, location, factory, dealer, sender, receiver } = req.body.data;
    const timestamp = new Date().toISOString();

    const blockData = {
      product_id, // สำคัญมาก ต้องตรงกับ lotId ของ Product
      item,
      status,
      location,
      factory,
      dealer,
      sender,
      receiver
    };

    // คำนวณ Hash
    const newHash = calculateHash(newIndex, prevHash, timestamp, blockData);

    // สร้าง Block
    const newBlock = new BlockModel({
      index: newIndex,
      timestamp,
      data: blockData,
      previousHash: prevHash,
      hash: newHash
    });

    await newBlock.save();
    res.json({ message: "Block added successfully!", block: newBlock });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/validate', async (req, res) => {
  try {
    // ดึง Block ทั้งหมดมาเรียงตามลำดับ Index
    const chain = await BlockModel.find().sort({ index: 1 });
    let isValid = true;

    // วนลูปเช็คทีละ Block (เริ่มจาก Block 1 เพราะ Block 0 คือ Genesis ไม่มีตัวก่อนหน้า)
    for (let i = 1; i < chain.length; i++) {
      const currentBlock = chain[i];
      const previousBlock = chain[i - 1];

      // กฎข้อที่ 1: previousHash ของบล็อกนี้ ต้องตรงกับ hash ของบล็อกก่อนหน้า (เช็คโซ่ขาด)
      if (currentBlock.previousHash !== previousBlock.hash) {
        isValid = false;
        break;
      }

      // กฎข้อที่ 2: ลองเอาข้อมูลปัจจุบันมาคำนวณ Hash ใหม่ดูว่าได้ค่าเท่าเดิมไหม (เช็คคนแอบแก้ Database)
      const recalculatedHash = calculateHash(
        currentBlock.index,
        currentBlock.previousHash,
        currentBlock.timestamp,
        currentBlock.data
      );

      if (currentBlock.hash !== recalculatedHash) {
        isValid = false;
        break;
      }
    }
    
    // ส่งผลลัพธ์กลับไปบอกหน้าเว็บว่า "ปลอดภัย (true)" หรือ "โดนแฮก (false)"
    res.json({ valid: isValid });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/blocks', async (req, res) => {
  try {
    const blocks = await BlockModel.find().sort({ index: 1 });
    res.json(blocks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// C. Utility (สำหรับ Dev)
// ==========================================

// 5. ล้างข้อมูลทั้งหมด (Reset Database) - ใช้ตอนอยากเริ่มใหม่
app.delete('/reset', async (req, res) => {
    try {
        await Product.deleteMany({});
        await BlockModel.deleteMany({});
        res.json({ message: "ล้างข้อมูลทั้งหมดเรียบร้อย! พร้อม Demo ใหม่" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Start Server (ใช้ค่าจาก .env ถ้าไม่มีให้ใช้ 5000)
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});