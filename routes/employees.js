  const express = require('express');
  const router = express.Router(); // Router instance
  const db = require("../db/db"); // Importing the database connection from db.js

  // Ensure the `user_details` table exists
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS user_details (
      code INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      address TEXT,
      mobile_number VARCHAR(15),
      qualification VARCHAR(100),
      dob DATE,
      work_experience TEXT,
      key_skills TEXT,
      reference TEXT,
      email VARCHAR(100),
      add_user_id INT NOT NULL,
      add_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      modi_user_id INT,
      modi_date DATETIME
    )
  `;

  (async () => {
    try {
      await db.query(createTableQuery);
      console.log('Table `user_details` ensured to exist.');
    } catch (err) {
      console.error('Error ensuring table `user_details` exists:', err);
    }
  })();

  // CREATE - Add a new employee
  router.post("/", async (req, res) => {
    const { name, address, mobile_number, qualification, dob, work_experience, key_skills, reference, add_user_id, email } = req.body;

    const query = `
      INSERT INTO user_details 
      (name, address, mobile_number, qualification, dob, work_experience, key_skills, reference, add_user_id, add_date, email)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
    `;

    try {
      const [result] = await db.query(query, [name, address, mobile_number, qualification, dob, work_experience, key_skills, reference, add_user_id, email]);
      res.status(201).json({
        success: true,
        message: "Employee added successfully",
        emp_code: result.insertId
      });
    } catch (err) {
      console.error("❌ Error inserting data:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // READ - Get all employees
  router.get("/", async (req, res) => {
    try {
      const [results] = await db.query("SELECT * FROM user_details ORDER BY code DESC");
      res.json(results);
    } catch (err) {
      console.error("❌ Error fetching employees:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // READ - Get a single employee by emp_code (code in table)
  router.get("/:emp_code", async (req, res) => {
    const { emp_code } = req.params;
    try {
      const [results] = await db.query("SELECT * FROM user_details WHERE code = ?", [emp_code]);
      if (results.length === 0) {
        return res.status(404).json({ error: "Employee not found" });
      }
      res.json(results[0]);
    } catch (err) {
      console.error("❌ Error fetching employee:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // UPDATE - Modify an employee's details
  router.put("/:emp_code", async (req, res) => {
    const { emp_code } = req.params;
    const { name, address, mobile_number, qualification, dob, work_experience, key_skills, reference, modi_user_id, email } = req.body;

    const query = `
      UPDATE user_details
      SET name = ?, address = ?, mobile_number = ?, qualification = ?, dob = ?, work_experience = ?, key_skills = ?, reference = ?, modi_user_id = ?, modi_date = NOW(), email = ?
      WHERE code = ?
    `;

    try {
      const [result] = await db.query(query, [name, address, mobile_number, qualification, dob, work_experience, key_skills, reference, modi_user_id, email, emp_code]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Employee not found" });
      }
      res.json({ success: true, message: "Employee updated successfully" });
    } catch (err) {
      console.error("❌ Error updating employee:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // DELETE - Remove an employee by emp_code (code in table)
  router.delete("/:emp_code", async (req, res) => {
    const { emp_code } = req.params;
    try {
      const [result] = await db.query("DELETE FROM user_details WHERE code = ?", [emp_code]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Employee not found" });
      }
      res.json({ success: true, message: "Employee deleted successfully" });
    } catch (err) {
      console.error("❌ Error deleting employee:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  module.exports = router;
