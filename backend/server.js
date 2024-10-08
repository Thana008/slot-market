const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sql = require('mssql');
const { connectToDatabase, pool } = require('./db'); // Import pool as a function

const app = express(); // Initialize the express app

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Secret key for JWT
const JWT_SECRET = 'your_secret_key';

// Connect to the database
connectToDatabase().catch(err => {
  console.error('Database connection failed:', err);
});


app.use(bodyParser.json());
app.use(cors());

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


// Login Endpoint
app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const query = `SELECT * FROM users WHERE username = '${username}'`;
    const result = await sql.query(query);

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
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, message: 'Login successful' });
  } catch (err) {
    console.error('Login failed:', err);
    res.status(500).json({ message: 'Login failed', error: err.message });
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

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


// app.post('/api/bookings', async (req, res) => {
//   try {
//     // Destructure the required fields from the request body
//     const { user_id, slot_id, booking_date, status, payment_status, firstname, lastname, phone, foodtype } = req.body;

//     // Validate the request body
//     if (!user_id || !slot_id || !booking_date) {
//       return res.status(400).json({ message: 'user_id, slot_id, and booking_date are required fields.' });
//     }

//     // Use the existing pool by calling the pool function
//     const poolConnection = await pool(); // Get the current pool

//     // Check if user_id exists
//     const userCheck = await poolConnection.request()
//       .input('user_id', sql.Int, user_id)
//       .query('SELECT id FROM users WHERE id = @user_id');

//     if (userCheck.recordset.length === 0) {
//       return res.status(400).json({ message: 'User ID does not exist' });
//     }

//     // Convert the booking_date to UTC+7 if necessary
//     const utcBookingDate = new Date(booking_date).toISOString();

//     // Execute the SQL query to insert the booking
//     await poolConnection.request()
//       .input('user_id', sql.Int, user_id)
//       .input('slot_id', sql.Int, slot_id)
//       .input('booking_date', sql.DateTime, utcBookingDate) // Ensure this matches your database schema
//       .input('status', sql.VarChar(20), status || 'pending')
//       .input('payment_status', sql.VarChar(10), payment_status || 'pending')
//       .input('firstname', sql.VarChar(50), firstname)
//       .input('lastname', sql.VarChar(50), lastname)
//       .input('phone', sql.VarChar(10), phone)
//       .input('foodtype', sql.VarChar(100), foodtype)
//       .query(`
//         INSERT INTO bookings (user_id, slot_id, booking_date, status, payment_status, firstname, lastname, phone, foodtype)
//         VALUES (@user_id, @slot_id, @booking_date, @status, @payment_status, @firstname, @lastname, @phone, @foodtype)
//       `);

//     // Send a success response
//     res.status(201).json({ message: 'Booking created successfully' });
//   } catch (error) {
//     // Improved error logging
//     console.error('Error creating booking:', error);
//     res.status(500).json({ message: 'Error creating booking', error: error.message });
//   }
// });


