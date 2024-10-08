const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sql = require('mssql');
const { connectToDatabase } = require('./db'); // เชื่อมต่อกับฐานข้อมูล

// สร้าง router
const router = express.Router();

// สร้าง secret key สำหรับ JWT
const JWT_SECRET = 'your_secret_key';

// เรียกใช้ฟังก์ชันเชื่อมต่อฐานข้อมูล
connectToDatabase().catch(err => {
  console.error('Database connection failed:', err);
});

// ลงทะเบียนผู้ใช้ใหม่
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    // เข้ารหัสรหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, 10);

    // เพิ่มข้อมูลลงในฐานข้อมูล
    const query = `INSERT INTO users (username, email, password, role) VALUES (@username, @email, @hashedPassword, @role)`;

    const request = new sql.Request();
    request.input('username', sql.VarChar, username);
    request.input('email', sql.VarChar, email);
    request.input('hashedPassword', sql.VarChar, hashedPassword);
    request.input('role', sql.VarChar, role);

    await request.query(query);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error registering user:', err); // แสดงข้อผิดพลาดในคอนโซล
    res.status(500).json({ message: 'Error registering user', error: err });
  }
});

// ล็อกอินและสร้าง token
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const query = `SELECT * FROM users WHERE username = @username`;
    const request = new sql.Request();
    request.input('username', sql.VarChar, username);

    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    const user = result.recordset[0];

    // ตรวจสอบรหัสผ่าน
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    // สร้าง JWT token
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, message: 'Login successful' });
  } catch (err) {
    console.error('Login failed:', err); // แสดงข้อผิดพลาดในคอนโซล
    res.status(500).json({ message: 'Login failed', error: err });
  }
});

module.exports = router;
