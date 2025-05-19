const express = require('express');
const router = express.Router();
const db = require('../db/db'); // Assumes you have a db.js exporting promise pool

// [GET] Test route to check if login API is reachable
router.get("/", (req, res) => {
  res.send("Login route is working. Use POST to login.");
});

// [POST] Login route
router.post("/", async (req, res) => {
  const { id, password } = req.body;

  if (!id || !password) {
    return res.status(400).json({ error: "ID and Password are required" });
  }

  try {
    // Query the database to validate credentials
    const [results] = await db.query(
      "SELECT * FROM users WHERE id = ? AND password = ?",
      [id, password]
    );

    if (results.length > 0) {
      // Send full user details
      res.json({
        success: true,
        message: "Login successful",
        user: results[0]  // full user data
      });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
