const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Received token:', token); // ตรวจสอบ token

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'Access Denied: No Token Provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Token verification failed:', err.message); // ตรวจสอบ error
      return res.status(403).json({ message: 'Invalid Token' });
    }

    console.log('Authenticated user:', user); // ตรวจสอบข้อมูล user
    req.user = user;
    next();
  });
}

module.exports = { authenticateToken };
