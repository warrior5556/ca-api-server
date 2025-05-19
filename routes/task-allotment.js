const express = require("express");
const router = express.Router();
const db = require("../db/db"); // MySQL connection

// Ensure the table exists
const createTaskAllotmentTableQuery = `
  CREATE TABLE IF NOT EXISTS tasks_allotment_master (
    code INT AUTO_INCREMENT PRIMARY KEY,
    allot_date DATE DEFAULT NULL,
    due_date DATE DEFAULT NULL,
    rm_emp_code INT DEFAULT NULL,
    received_by INT DEFAULT NULL,
    placed_at VARCHAR(255) DEFAULT NULL,
    client_code INT DEFAULT NULL,
    financial_year VARCHAR(50) DEFAULT NULL,
    assessment_month VARCHAR(50) DEFAULT NULL,
    assessment_for VARCHAR(255) DEFAULT NULL,
    alloted_to INT DEFAULT NULL,
    status VARCHAR(50) DEFAULT NULL,
    doc_received_by VARCHAR(255) DEFAULT NULL,
    key_factor TEXT DEFAULT NULL,
    prime_taskname VARCHAR(255) DEFAULT NULL,
    sub_taskname VARCHAR(255) DEFAULT NULL,
    time_taken_to_complete DECIMAL(5,2) DEFAULT NULL,
    add_user_id VARCHAR(50) DEFAULT NULL,
    add_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    modi_user_id VARCHAR(50) DEFAULT NULL,
    modi_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (rm_emp_code) REFERENCES user_details(code),
    FOREIGN KEY (received_by) REFERENCES user_details(code),
    FOREIGN KEY (client_code) REFERENCES client_master(code),
    FOREIGN KEY (alloted_to) REFERENCES user_details(code)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

(async () => {
  try {
    await db.query(createTaskAllotmentTableQuery);
    console.log("✅ Table `tasks_allotment_master` ensured to exist.");
  } catch (err) {
    console.error("❌ Failed to create `tasks_allotment_master` table:", err);
  }
})();

// ---------------------
// CRUD Routes
// ---------------------

// CREATE (POST)
router.post("/", async (req, res) => {
  try {
    const data = req.body;
    
    // Debug log to see what's being received
    console.log("Received task allotment data:", data);
    
    // Check for both possible field names
    const allotmentDate = data.allot_date || data.alloted_date;
    
    // Validate required fields
    if (!allotmentDate) {
      console.log("Missing allotment date in request:", data);
      return res.status(400).json({ error: "Allotment date is required" });
    }

    // Check if rm_emp_code is present
    if (!data.rm_emp_code) {
      console.log("Missing rm_emp_code in request:", data);
      // You can either return an error or continue with null
      // return res.status(400).json({ error: "RM employee code is required" });
    }

    const sql = `INSERT INTO tasks_allotment_master (
      allot_date, due_date, rm_emp_code, received_by, placed_at, client_code,
      financial_year, assessment_month, assessment_for, alloted_to, status,
      doc_received_by, key_factor, prime_taskname, sub_taskname,
      time_taken_to_complete, add_user_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      allotmentDate, 
      data.due_date, 
      data.rm_emp_code || null, // Handle null case explicitly
      data.received_by,
      data.placed_at, 
      data.client_code, 
      data.financial_year, 
      data.assessment_month,
      data.assessment_for, 
      data.alloted_to, 
      data.status, 
      data.doc_received_by,
      data.key_factor, 
      data.prime_taskname, 
      data.sub_taskname,
      data.time_taken_to_complete, 
      data.add_user_id
    ];

    const [result] = await db.query(sql, values);
    res.status(201).json({ message: "Task created", code: result.insertId });
  } catch (err) {
    console.error("❌ POST error:", err);
    res.status(500).json({ error: "Failed to create task" });
  }
});

// READ ALL (GET)
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM tasks_allotment_master ORDER BY code DESC");
    res.json(rows);
  } catch (err) {
    console.error("❌ GET all error:", err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// READ ONE (GET /:code)
router.get("/:code", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM tasks_allotment_master WHERE code = ?", [req.params.code]);
    if (rows.length === 0) return res.status(404).json({ error: "Task not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("❌ GET by ID error:", err);
    res.status(500).json({ error: "Failed to fetch task" });
  }
});

// UPDATE (PUT /:code)
router.put("/:code", async (req, res) => {
  try {
    const data = req.body;
    
    // Debug log to see what's being received
    console.log("Received task update data:", data);
    
    // Check for both possible field names
    const allotmentDate = data.allot_date || data.alloted_date;
    
    // Validate required fields
    if (!allotmentDate) {
      return res.status(400).json({ error: "Allotment date is required" });
    }
    
    // Check if rm_emp_code is present
    if (!data.rm_emp_code) {
      console.log("Missing rm_emp_code in update request:", data);
      // You can either return an error or continue with null
      // return res.status(400).json({ error: "RM employee code is required" });
    }
    
    const sql = `UPDATE tasks_allotment_master SET
      allot_date = ?, due_date = ?, rm_emp_code = ?, received_by = ?, placed_at = ?,
      client_code = ?, financial_year = ?, assessment_month = ?, assessment_for = ?,
      alloted_to = ?, status = ?, doc_received_by = ?, key_factor = ?, prime_taskname = ?,
      sub_taskname = ?, time_taken_to_complete = ?, modi_user_id = ?
      WHERE code = ?`;

    const values = [
      allotmentDate, 
      data.due_date, 
      data.rm_emp_code || null, // Handle null case explicitly
      data.received_by,
      data.placed_at, 
      data.client_code, 
      data.financial_year, 
      data.assessment_month,
      data.assessment_for, 
      data.alloted_to, 
      data.status, 
      data.doc_received_by,
      data.key_factor, 
      data.prime_taskname, 
      data.sub_taskname,
      data.time_taken_to_complete, 
      data.modi_user_id, 
      req.params.code
    ];

    const [result] = await db.query(sql, values);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Task not found" });
    res.json({ message: "Task updated" });
  } catch (err) {
    console.error("❌ PUT error:", err);
    res.status(500).json({ error: "Failed to update task" });
  }
});

// DELETE (DELETE /:code)
router.delete("/:code", async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM tasks_allotment_master WHERE code = ?", [req.params.code]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error("❌ DELETE error:", err);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

module.exports = router;
