const express = require('express');
const cors = require('cors');
const authRoutes = require('./auth'); // นำเข้า auth.js

const app = express();
app.use(express.json());
app.use(cors());

// ใช้ auth routes
app.use('/auth', authRoutes);

// เริ่มต้น server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
