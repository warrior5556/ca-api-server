const mysql = require('mysql2');
require('dotenv').config(); // Load environment variables from .env file

// Create a connection pool to avoid multiple connection instances
const pool = mysql.createPool({
  host: process.env.DB_HOST, // Correct environment variable for host
  user: process.env.DB_USER, // Correct environment variable for user
  password: process.env.DB_PASS, // Correct environment variable for password
  database: process.env.DB_NAME, // Correct environment variable for database
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 25000,
  queueLimit: 0
});

// Test the database connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed:', err.message);
  } else {
    console.log('Database connection successful');
    connection.release(); // Release the connection back to the pool
  }
});

module.exports = pool.promise(); // Use promise-based API for easier async/await
