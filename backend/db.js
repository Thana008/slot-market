const sql = require('mssql');

// Database configuration
const config = {
  user: 'sa',
  password: '123456789',
  server: 'LAPTOP-GSHFC4D4',
  database: 'slot-market (2)',
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

// Create a pool variable
let pool;

async function connectToDatabase() {
  try {
    pool = await sql.connect(config);
    console.log('Connected to SQL Server!');
  } catch (err) {
    console.error('Error connecting to SQL Server:', err);
    throw err;
  }
}

// Call the connect function to initialize the pool
connectToDatabase();

// Exporting the pool as a function to get the current pool
module.exports = {
  sql,
  pool: () => pool, // Export pool as a function
  connectToDatabase,
};
