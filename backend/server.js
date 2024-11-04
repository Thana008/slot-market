require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sql = require('mssql');
const { connectToDatabase, pool } = require('./db'); // Import pool as a function
const multer = require('multer'); // File upload library
const path = require('path');
const { authenticateToken } = require('./middleware'); // Adjust the path to the correct file
const fs = require('fs');

const app = express(); // Initialize the express app

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Secret key for JWT - using environment variable instead of hardcoding
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

// Connect to the database
connectToDatabase().catch(err => {
  console.error('Database connection failed:', err);
});

// Registration Endpoint
app.post('/auth/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // SQL query to check if the user already exists
    const query = `
      IF NOT EXISTS (SELECT * FROM users WHERE username = @username OR email = @email)
      BEGIN
          INSERT INTO users (username, email, password, role) 
          VALUES (@username, @email, @hashedPassword, @role)
      END
    `;

    // Prepare a request
    const request = new sql.Request();
    request.input('username', sql.VarChar, username);
    request.input('email', sql.VarChar, email);
    request.input('hashedPassword', sql.VarChar, hashedPassword);
    request.input('role', sql.VarChar, role);

    // Execute the query
    await request.query(query);
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ message: 'Error registering user', error: err.message });
  }
});

app.get('/api/getUserBookingStatus/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;

  try {
      const poolConnection = await pool();
      const result = await poolConnection.request()
          .input('userId', sql.Int, userId)
          .query('SELECT status FROM bookings WHERE user_id = @userId ORDER BY created_at DESC');

      if (result.recordset.length === 0) {
          return res.status(200).json({ status: 'nothing' }); // ไม่มีข้อมูลการจอง
      }

      res.status(200).json({ status: result.recordset[0].status }); // ส่งสถานะการจองกลับไป
  } catch (error) {
      console.error('Error fetching booking status:', error);
      res.status(500).json({ message: 'Error fetching booking status', error: error.message });
  }
});

app.put('/api/cancelBooking/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;

  try {
    const poolConnection = await pool();
    const result = await poolConnection.request()
      .input('userId', sql.Int, userId)
      .query('UPDATE bookings SET status = \'cancelled\' WHERE user_id = @userId AND status = \'confirmed\'');

    if (result.rowsAffected[0] === 0) {
      return res.status(400).json({ message: 'No booking found to cancel or booking already cancelled' });
    }

    res.status(200).json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Error cancelling booking', error: error.message });
  }
});

// Set up Multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Store files in the "uploads" folder
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage: storage });

// Edit document by ID and replace the file
app.put('/api/documents/:id', authenticateToken, upload.single('document'), async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admin can edit files' });
  }

  const { id } = req.params;
  const { title, description } = req.body;
  const filename = req.file ? req.file.filename : null;

  try {
    const poolConnection = await pool();

    // หาไฟล์เก่าเพื่อลบออกหากมีการอัปเดตไฟล์ใหม่
    if (filename) {
      const oldFileQuery = await poolConnection.request()
        .input('id', sql.Int, id)
        .query('SELECT filename FROM documents WHERE id = @id');

      if (oldFileQuery.recordset.length === 0) {
        return res.status(404).json({ message: 'Document not found' });
      }

      const oldFilename = oldFileQuery.recordset[0].filename;

      // ลบไฟล์เก่า
      fs.unlink(path.join(__dirname, 'uploads', oldFilename), (err) => {
        if (err) {
          console.error('Error deleting old file:', err);
        }
      });
    }

    // อัปเดตข้อมูลไฟล์
    const updateQuery = `
      UPDATE documents
      SET title = @title, description = @description
      ${filename ? ', filename = @filename' : ''}
      WHERE id = @id
    `;

    const request = poolConnection.request()
      .input('title', sql.VarChar, title)
      .input('description', sql.VarChar, description)
      .input('id', sql.Int, id);

    if (filename) {
      request.input('filename', sql.VarChar, filename);
    }

    const result = await request.query(updateQuery);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.status(200).json({ message: 'Document updated successfully' });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ message: 'Error updating document', error: error.message });
  }
});

// Upload document and save metadata to the database
app.post('/api/upload', authenticateToken, upload.single('document'), async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admin can upload files' });
  }

  const { title, description } = req.body;
  const filename = req.file.filename;

  try {
    const poolConnection = await pool(); // Get pool connection

    await poolConnection.request()
      .input('title', sql.VarChar, title)
      .input('description', sql.VarChar, description)
      .input('filename', sql.VarChar, filename)
      .input('uploaded_by', sql.VarChar, req.user.username)
      .query(`
        INSERT INTO documents (title, description, filename, uploaded_by) 
        VALUES (@title, @description, @filename, @uploaded_by)
      `);

    res.status(201).json({ message: 'Document uploaded and saved successfully' });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ message: 'Error uploading document', error: error.message });
  }
});

// Delete document by ID
app.delete('/api/documents/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admin can delete files' });
  }

  const { id } = req.params;

  try {
    const poolConnection = await pool();
    const result = await poolConnection.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM documents WHERE id = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.status(200).json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ message: 'Error deleting document', error: error.message });
  }
});

app.put('/api/upload/:fileName', authenticateToken, upload.single('document'), (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(__dirname, 'uploads', fileName); // Existing file path

  // Check if the old file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ message: 'Original file not found' });
    }

    // Delete the old file
    fs.unlink(filePath, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error deleting old file', error: err.message });
      }

      // Save the new file
      const newFile = req.file;

      if (!newFile) {
        return res.status(400).json({ message: 'No new file uploaded' });
      }

      const newFilePath = path.join(__dirname, 'uploads', fileName); // Reuse original file name

      // Rename the new file to the old file name (replacing it)
      fs.rename(newFile.path, newFilePath, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error renaming file', error: err.message });
        }

        // Optionally, update file metadata in the database (if applicable)
        res.status(200).json({ message: 'File replaced successfully', filePath: newFilePath });
      });
    });
  });
});

// Get all documents
app.get('/api/documents', async (req, res) => {
  try {
    const poolConnection = await pool(); // Get the pool connection
    const result = await poolConnection.request().query('SELECT * FROM documents'); // Get all documents

    res.status(200).json(result.recordset); // ส่งข้อมูลเอกสารกลับไปในรูปแบบ JSON
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ message: 'Error fetching documents' });
  }
});

app.post('/api/update-profile', authenticateToken, async (req, res) => {
  const { name, email } = req.body;
  const userId = req.user.id; // รับ ID ของผู้ใช้จาก token
  
  // Debugging logs
  console.log('User ID:', userId);
  console.log('Name:', name, 'Email:', email);

  try {
    const poolConnection = await pool(); // เชื่อมต่อกับฐานข้อมูล
    const request = poolConnection.request()
      .input('name', sql.VarChar, name)
      .input('email', sql.VarChar, email)
      .input('id', sql.Int, userId);

    const result = await request.query('UPDATE users SET name = @name, email = @email WHERE id = @id');

    console.log('Query Result:', result); // ดูผลลัพธ์ของ query
    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error); // แสดงข้อผิดพลาดใน console
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

// ดึงสถานะการจ่ายเงิน
app.get('/api/payments/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  try {
      const poolConnection = await pool();
      const result = await poolConnection.request()
          .input('userId', sql.Int, userId)
          .query('SELECT * FROM payments WHERE user_id = @userId');
      res.status(200).json(result.recordset);
  } catch (error) {
      console.error('Error fetching payments:', error);
      res.status(500).json({ message: 'Error fetching payments' });
  }
});


// ชำระเงิน
app.post('/api/payments/:userId/pay', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  const { paymentId } = req.body; // รหัสการชำระเงิน
  try {
      const poolConnection = await pool();
      await poolConnection.request()
          .input('userId', sql.Int, userId)
          .input('paymentId', sql.Int, paymentId)
          .input('paymentDate', sql.Date, new Date())
          .query('UPDATE payments SET status = \'paid\', payment_date = @paymentDate WHERE id = @paymentId AND user_id = @userId');
      res.status(200).json({ message: 'Payment successful' });
  } catch (error) {
      console.error('Error updating payment:', error);
      res.status(500).json({ message: 'Error updating payment' });
  }
});

// Delete booking by ID
app.delete('/api/bookings/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const poolConnection = await pool();
    const result = await poolConnection.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM bookings WHERE id = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ message: 'Error deleting booking', error: error.message });
  }
});

app.post('/api/admin/assignSlot', authenticateToken, async (req, res) => {
  console.log('Received userId:', req.body.userId); // ตรวจสอบค่าที่รับมา
  console.log('Authenticated user:', req.user); // ตรวจสอบข้อมูล user จาก token

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admin can assign slots' });
  }

  const { userId } = req.body;

  // ตรวจสอบค่า userId
  if (!userId || typeof userId !== 'number') {
    console.log('Invalid userId:', userId);
    return res.status(400).json({ message: 'Invalid userId provided.' });
  }

  try {
    const poolConnection = await pool();

    // ตรวจสอบการจองที่ยืนยันแล้ว
    const confirmedUser = await poolConnection.request()
      .input('userId', sql.Int, userId)
      .query('SELECT * FROM bookings WHERE user_id = @userId AND status = \'confirmed\'');

    console.log('Confirmed User:', confirmedUser.recordset); // ตรวจสอบผลลัพธ์หลังจากกำหนดค่า confirmedUser

    if (confirmedUser.recordset.length === 0) {
      return res.status(400).json({ message: 'No confirmed booking found for this user.' });
    }

    // สุ่ม slot ที่ว่าง
    const availableSlot = await poolConnection.request()
      .query('SELECT TOP 1 * FROM market_slots WHERE available = 1 ORDER BY NEWID()');

    console.log('Available Slot:', availableSlot.recordset); // ดูผลลัพธ์ของ query

    if (availableSlot.recordset.length === 0) {
      return res.status(400).json({ message: 'No available slots found.' });
    }

    const slotId = availableSlot.recordset[0].id;
    const slotName = availableSlot.recordset[0].slot_name;

    // อัปเดตสถานะ slot เป็นไม่ว่าง
    await poolConnection.request()
      .input('slotId', sql.Int, slotId)
      .query('UPDATE market_slots SET available = 0 WHERE id = @slotId');

    // อัปเดต booking ด้วย slot_id
    await poolConnection.request()
      .input('slotId', sql.Int, slotId)
      .input('userId', sql.Int, userId)
      .query('UPDATE bookings SET slot_id = @slotId WHERE user_id = @userId');

    res.status(200).json({ message: 'Slot assigned successfully', slotName });
  } catch (error) {
    console.error('Error assigning slot:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


app.post('/api/payments/:userId/pay', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  const { paymentId } = req.body; // รหัสการชำระเงิน

  try {
    const poolConnection = await pool();

    // อัปเดตสถานะการชำระเงิน
    await poolConnection.request()
      .input('userId', sql.Int, userId)
      .input('paymentId', sql.Int, paymentId)
      .input('paymentDate', sql.DateTime, new Date())
      .query('UPDATE payments SET status = \'paid\', payment_date = @paymentDate WHERE id = @paymentId AND user_id = @userId');

    res.status(200).json({ message: 'Payment successful' });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ message: 'Error updating payment' });
  }
});

// Login Endpoint
app.post('/auth/login', async (req, res) => {
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

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Return the token and user data
    res.json({
      token,
      user: { id: user.id, username: user.username, role: user.role },
      message: 'Login successful'
    });
  } catch (err) {
    console.error('Login failed:', err);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

// Get all bookings
app.get('/api/bookings', async (req, res) => {
  try {
    const poolConnection = await pool(); // Get pool connection
    const result = await poolConnection.request().query('SELECT * FROM bookings');

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
});

// Update booking status
app.put('/api/bookings/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['taste_test', 'confirmed', 'not pass', 'cancelled']; // เพิ่ม 'not pass'

  // ตรวจสอบสถานะใหม่
if (!validStatuses.includes(status)) {
  return res.status(400).json({ message: 'Invalid status' });
}

  try {
    const poolConnection = await pool(); // Get pool connection

    // Update the status of the booking
    await poolConnection.request()
      .input('id', sql.Int, id)
      .input('status', sql.VarChar(20), status)
      .query('UPDATE bookings SET status = @status WHERE id = @id');

    res.status(200).json({ message: 'Booking status updated successfully' });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ message: 'Error updating booking status', error: error.message });
  }
});



// Create Booking
app.post('/api/bookings', async (req, res) => {
  try {
    const { user_id, slot_id, booking_date, status, payment_status, firstname, lastname, phone, foodtype } = req.body;

    // Validate the request body
    if (!user_id || !slot_id || !booking_date) {
      return res.status(400).json({ message: 'user_id, slot_id, and booking_date are required fields.' });
    }

    const poolConnection = await pool(); // Get the current pool

    // Check if user_id exists
    const userCheck = await poolConnection.request()
      .input('user_id', sql.Int, user_id)
      .query('SELECT id FROM users WHERE id = @user_id');

    if (userCheck.recordset.length === 0) {
      return res.status(400).json({ message: 'User ID does not exist' });
    }

    // Convert the booking_date to UTC+7 if necessary
    const utcBookingDate = new Date(booking_date).toISOString();

    // Insert the booking
    await poolConnection.request()
      .input('user_id', sql.Int, user_id)
      .input('slot_id', sql.Int, slot_id)
      .input('booking_date', sql.DateTime, utcBookingDate)
      .input('status', sql.VarChar(20), status || 'pending')
      .input('payment_status', sql.VarChar(10), payment_status || 'pending')
      .input('firstname', sql.VarChar(50), firstname)
      .input('lastname', sql.VarChar(50), lastname)
      .input('phone', sql.VarChar(10), phone)
      .input('foodtype', sql.VarChar(100), foodtype)
      .query(`
        INSERT INTO bookings (user_id, slot_id, booking_date, status, payment_status, firstname, lastname, phone, foodtype)
        VALUES (@user_id, @slot_id, @booking_date, @status, @payment_status, @firstname, @lastname, @phone, @foodtype)
      `);

    res.status(201).json({ message: 'Booking created successfully' });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Error creating booking', error: error.message });
  }
});
app.get('/api/market_slots', async (req, res) => {
  try {
    const poolConnection = await pool(); // Get the current pool
    // Change "available = 'true'" to "available = 1"
    const result = await poolConnection.request().query('SELECT * FROM market_slots WHERE available = 1'); 

    res.status(200).json(result.recordset); // Respond with the result
  } catch (error) {
    console.error('Error fetching market slots:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
