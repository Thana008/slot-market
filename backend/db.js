const sql = require('mssql');

// กำหนดค่าการเชื่อมต่อกับฐานข้อมูล SQL Server
const config = {
  user: 'sa',
  password: '123456789',
  server: 'LAPTOP-GSHFC4D4',
  database: 'slot_market',
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

// ฟังก์ชันเพื่อเชื่อมต่อกับฐานข้อมูล SQL Server
async function connectToDatabase() {
  try {
    await sql.connect(config);
    console.log('Connected to SQL Server!');
  } catch (err) {
    console.error('Error connecting to SQL Server:', err);
    throw err;
  }
}

module.exports = {
  sql,
  connectToDatabase
};
