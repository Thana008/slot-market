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

app.get('/api/bookings/:bookingId', authenticateToken, async (req, res) => {
  const { bookingId } = req.params;

  try {
    const poolConnection = await pool(); // เชื่อมต่อกับฐานข้อมูล

    // Query to get booking details along with the slot price
    const result = await poolConnection.request()
      .input('bookingId', sql.Int, bookingId)
      .query(`
        SELECT 
          b.id AS booking_id,
          b.firstname,
          b.lastname,
          b.foodtype,
          b.payment_status,
          b.status,
          ms.price AS total_amount,
          b.booking_date
        FROM 
          bookings b
        INNER JOIN 
          market_slots ms ON b.slot_id = ms.id
        WHERE 
          b.id = @bookingId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'No booking found with the provided booking ID' });
    }

    res.status(200).json(result.recordset[0]);
  } catch (error) {
    console.error('Error fetching booking details:', error);
    res.status(500).json({ message: 'Error fetching booking details', error: error.message });
  }
});


app.post('/api/update-profile', authenticateToken, async (req, res) => {
  const { username, email, currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    const poolConnection = await pool();

    // ตรวจสอบรหัสผ่านปัจจุบันถ้ามีการเปลี่ยนแปลงรหัสผ่าน
    if (newPassword) {
      const userResult = await poolConnection.request()
        .input('userId', sql.Int, userId)
        .query('SELECT password FROM users WHERE id = @userId');

      if (userResult.recordset.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const validPassword = await bcrypt.compare(currentPassword, userResult.recordset[0].password);
      if (!validPassword) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
    }

    // อัพเดตข้อมูลโปรไฟล์
    let hashedPassword = null;
    if (newPassword) {
      hashedPassword = await bcrypt.hash(newPassword, 10);
    }

    const request = poolConnection.request()
      .input('username', sql.VarChar, username)
      .input('email', sql.VarChar, email)
      .input('id', sql.Int, userId);

    if (hashedPassword) {
      request.input('password', sql.VarChar, hashedPassword);
      await request.query('UPDATE users SET username = @username, email = @email, password = @password WHERE id = @id');
    } else {
      await request.query('UPDATE users SET username = @username, email = @email WHERE id = @id');
    }

    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
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


// ตรวจสอบ username ในฐานข้อมูล
app.get('/api/check-username', async (req, res) => {
  const { username, userId } = req.query;

  try {
    const poolConnection = await pool(); // เชื่อมต่อกับฐานข้อมูล
    const request = poolConnection.request()
      .input('username', sql.VarChar, username)
      .input('userId', sql.Int, userId);

    const result = await request.query(`
      SELECT COUNT(*) AS count 
      FROM users 
      WHERE username = @username AND id != @userId
    `);

    if (result.recordset[0].count > 0) {
      return res.status(200).json({ exists: true });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error('Error checking username:', error);
    res.status(500).json({ message: 'Error checking username', error: error.message });
  }
});

app.get('/api/getUserBookings/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;

  try {
    const poolConnection = await pool(); // Connect to the database

    // SQL query to retrieve booking details along with the slot name
    const result = await poolConnection.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT 
          b.id, 
          b.status, 
          b.firstname, 
          b.lastname, 
          b.payment_status, 
          b.foodtype, 
          b.slot_id, 
          ms.slot_name 
        FROM bookings b
        LEFT JOIN market_slots ms ON b.slot_id = ms.id
        WHERE b.user_id = @userId
        ORDER BY b.created_at DESC
      `);

    if (result.recordset.length === 0) {
      return res.status(200).json({ status: 'nothing' }); // No booking data found
    }

    const booking = result.recordset[0];

    res.status(200).json({
      id: booking.id,
      status: booking.status,
      firstname: booking.firstname,
      lastname: booking.lastname,
      payment_status: booking.payment_status,
      foodtype: booking.foodtype,
      slot_id: booking.slot_id,
      slot_name: booking.slot_name 
    });

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

const PDFDocument = require('pdfkit');

app.get('/api/receipt/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;

  try {
    const poolConnection = await pool();

    // Query to get booking details along with the slot price and slot name
    const result = await poolConnection.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT 
          b.id AS booking_id,
          b.firstname,
          b.lastname,
          b.foodtype,
          b.payment_status,
          ms.price AS total_amount,
          ms.slot_name,
          b.booking_date
        FROM 
          bookings b
        INNER JOIN 
          market_slots ms ON b.slot_id = ms.id
        WHERE 
          b.user_id = @userId
        ORDER BY 
          b.booking_date DESC
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'No booking found for the user' });
    }

    // สร้าง PDF ด้วย pdfkit
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();
    let filename = `Receipt_Booking_${userId}.pdf`;
    filename = encodeURIComponent(filename);
    
    res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-type', 'application/pdf');

    const booking = result.recordset[0];
    doc.text('Receipt');
    doc.text(`Booking ID: ${booking.booking_id}`);
    doc.text(`Name: ${booking.firstname} ${booking.lastname}`);
    doc.text(`Food Type: ${booking.foodtype}`);
    doc.text(`Slot: ${booking.slot_name}`);
    doc.text(`Payment Status: ${booking.payment_status}`);
    doc.text(`Total Amount: ${booking.total_amount} THB`);
    doc.text(`Booking Date: ${booking.booking_date}`);

    doc.pipe(res);
    doc.end();

  } catch (error) {
    console.error('Error generating receipt:', error);
    res.status(500).json({ message: 'Error generating receipt', error: error.message });
  }
});




app.post('/api/payments', authenticateToken, async (req, res) => {
  const { bookingId, paymentMethod } = req.body;

  if (!bookingId || !paymentMethod) {
    return res.status(400).json({ message: 'Booking ID and payment method are required.' });
  }

  try {
    const poolConnection = await pool();
    const bookingCheck = await poolConnection.request()
      .input('bookingId', sql.Int, bookingId)
      .query('SELECT * FROM bookings WHERE id = @bookingId');

    if (bookingCheck.recordset.length === 0) {
      return res.status(400).json({ message: 'Booking not found.' });
    }

    // อัปเดตสถานะการชำระเงิน
    await poolConnection.request()
      .input('bookingId', sql.Int, bookingId)
      .input('paymentStatus', sql.VarChar(20), 'paid')
      .query('UPDATE bookings SET payment_status = @paymentStatus WHERE id = @bookingId');

    res.status(200).json({ message: 'Payment processed successfully.' });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ message: 'Error processing payment', error: error.message });
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
app.get('/api/bookings/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const poolConnection = await pool();
    const result = await poolConnection.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT 
          b.*, 
          ms.slot_name, 
          ms.price AS slot_price 
        FROM 
          bookings b 
        LEFT JOIN 
          market_slots ms ON b.slot_id = ms.id 
        WHERE 
          b.id = @id
      `);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.status(200).json(result.recordset[0]);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Error fetching booking', error: error.message });
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

    // หากสถานะเป็น 'cancelled' จะทำให้ slot กลับมาเป็นว่าง
    if (status === 'cancelled') {
      // ดึงข้อมูล slot_id ที่เกี่ยวข้องกับการจองนี้
      const bookingResult = await poolConnection.request()
        .input('id', sql.Int, id)
        .query('SELECT slot_id FROM bookings WHERE id = @id');

      const slotId = bookingResult.recordset[0]?.slot_id;

      if (slotId) {
        // ทำให้ slot ที่เคยถูกใช้กลับมาเป็นว่าง
        await poolConnection.request()
          .input('slotId', sql.Int, slotId)
          .query('UPDATE market_slots SET available = 1 WHERE id = @slotId');
      }
    }

    // อัปเดตสถานะการจอง
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


app.post('/api/admin/assignSlot', authenticateToken, async (req, res) => {
  let { Id, slotId } = req.body;

  // แปลงค่า Id และ slotId เป็นตัวเลข
  Id = parseInt(Id);
  slotId = parseInt(slotId);

  if (isNaN(Id) || isNaN(slotId)) {
    return res.status(400).json({ success: false, message: 'Id and SlotId must be numeric values' });
  }

  console.log('Assigning slot:', { Id, slotId });

  try {
    const poolConnection = await pool();

    // ตรวจสอบการจองที่ยืนยันแล้วสำหรับ Id นี้หรือไม่
    const confirmedBooking = await poolConnection.request()
      .input('Id', sql.Int, Id)
      .query('SELECT * FROM bookings WHERE id = @Id AND status = \'confirmed\'');

    console.log('Confirmed booking:', confirmedBooking.recordset);

    if (confirmedBooking.recordset.length === 0) {
      return res.status(400).json({ success: false, message: 'No confirmed booking found for this booking id.' });
    }

    // ตรวจสอบ slot ที่ต้องการ assign ว่างอยู่หรือไม่
    const slotCheck = await poolConnection.request()
      .input('slotId', sql.Int, slotId)
      .query('SELECT * FROM market_slots WHERE id = @slotId AND available = 1');

    console.log('Slot availability:', slotCheck.recordset);

    if (slotCheck.recordset.length === 0) {
      return res.status(400).json({ success: false, message: 'Selected slot is not available.' });
    }

    // หากการจองนี้มี slot_id เดิมอยู่แล้ว ต้องคืนสถานะให้ slot เก่าเป็น available
    if (confirmedBooking.recordset[0].slot_id) {
      const oldSlotId = confirmedBooking.recordset[0].slot_id;

      // อัปเดต slot เก่าให้ว่าง
      await poolConnection.request()
        .input('oldSlotId', sql.Int, oldSlotId)
        .query('UPDATE market_slots SET available = 1 WHERE id = @oldSlotId');
    }

    // อัปเดตสถานะ slot ที่เลือกใหม่เป็นไม่ว่าง
    await poolConnection.request()
      .input('slotId', sql.Int, slotId)
      .query('UPDATE market_slots SET available = 0 WHERE id = @slotId');

    // อัปเดต booking ด้วย slot_id ใหม่
    await poolConnection.request()
      .input('slotId', sql.Int, slotId)
      .input('Id', sql.Int, Id)
      .query('UPDATE bookings SET slot_id = @slotId WHERE id = @Id');

    res.status(200).json({ success: true, message: 'Slot assigned successfully' });
  } catch (error) {
    console.error('Error assigning slot:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});



// ดึงข้อมูล slot ที่ว่างทั้งหมด
app.get('/api/slots/available', authenticateToken, async (req, res) => {
  try {
    const poolConnection = await pool();
    const availableSlots = await poolConnection.request()
      .query('SELECT * FROM market_slots WHERE available = 1');
    res.status(200).json(availableSlots.recordset);
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// Create Booking
app.post('/api/bookings', async (req, res) => {
  try {
    const { user_id, booking_date, status, payment_status, firstname, lastname, phone, foodtype } = req.body;

    // Validate the request body
    if (!user_id || !booking_date) {
      return res.status(400).json({ message: 'user_id and booking_date are required fields.' });
    }

    const poolConnection = await pool(); // Get the current pool

    // Check if user_id exists
    const userCheck = await poolConnection.request()
      .input('user_id', sql.Int, user_id)
      .query('SELECT id FROM users WHERE id = @user_id');

    if (userCheck.recordset.length === 0) {
      return res.status(400).json({ message: 'User ID does not exist.' });
    }

    // Check if user already has an active booking
    const existingBooking = await poolConnection.request()
      .input('user_id', sql.Int, user_id)
      .query('SELECT * FROM bookings WHERE user_id = @user_id AND status != \'cancelled\'');

    if (existingBooking.recordset.length > 0) {
      return res.status(400).json({ message: 'User already has an active booking.' });
    }

    // Convert the booking_date to UTC+7 if necessary
    const utcBookingDate = new Date(booking_date).toISOString();

    // Insert the booking
    await poolConnection.request()
      .input('user_id', sql.Int, user_id)
      .input('booking_date', sql.DateTime, utcBookingDate)
      .input('status', sql.VarChar(20), status || 'pending')
      .input('payment_status', sql.VarChar(10), payment_status || 'pending')
      .input('firstname', sql.VarChar(50), firstname)
      .input('lastname', sql.VarChar(50), lastname)
      .input('phone', sql.VarChar(10), phone)
      .input('foodtype', sql.VarChar(100), foodtype)
      .query(`
        INSERT INTO bookings (user_id, booking_date, status, payment_status, firstname, lastname, phone, foodtype)
        VALUES (@user_id, @booking_date, @status, @payment_status, @firstname, @lastname, @phone, @foodtype)
      `);

    res.status(201).json({ message: 'Booking created successfully.' });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Error creating booking.', error: error.message });
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
