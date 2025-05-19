const express = require("express");
const router = express.Router();
const db = require("../db/db"); // Importing the database connection from db.js

// Ensure the `client_master` table exists
const createClientMasterTableQuery = `
  CREATE TABLE IF NOT EXISTS client_master (
    code INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    fileno VARCHAR(50) UNIQUE,
    firmname VARCHAR(255),
    gstno VARCHAR(50),
    pan VARCHAR(50),
    address TEXT,
    mob VARCHAR(15) NOT NULL,
    email VARCHAR(255) NOT NULL,
    folderpath TEXT,
    add_user_id INT NOT NULL,
    add_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modi_user_id INT,
    modi_date DATETIME
  )
`;

// Ensure the `sub_allotment` table exists
const createSubAllotmentTableQuery = `
  CREATE TABLE IF NOT EXISTS sub_allotment (
    code INT AUTO_INCREMENT PRIMARY KEY,
    fileno VARCHAR(80) DEFAULT NULL,
    alloted_date DATE NOT NULL,
    alloted_by INT DEFAULT NULL,
    alloted_to INT DEFAULT NULL,
    task_name VARCHAR(80) NOT NULL,
    description TEXT,
    completed TINYINT(1) DEFAULT '0',
    completion_date DATE DEFAULT NULL,
    add_user_id VARCHAR(50) DEFAULT NULL,
    add_date DATE DEFAULT NULL,
    modi_user_id VARCHAR(50) DEFAULT NULL,
    modi_date DATETIME DEFAULT NULL,
    KEY fk_sub_allotment_client (fileno),
    KEY fk_sub_allotment_by (alloted_by),
    KEY fk_sub_allotment_to (alloted_to),
    CONSTRAINT fk_sub_allotment_by FOREIGN KEY (alloted_by) REFERENCES user_details (code),
    CONSTRAINT fk_sub_allotment_client FOREIGN KEY (fileno) REFERENCES client_master (fileno),
    CONSTRAINT fk_sub_allotment_to FOREIGN KEY (alloted_to) REFERENCES user_details (code)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
`;

(async () => {
  try {
    // Ensure the `client_master` table exists
    await db.query(createClientMasterTableQuery);
    console.log("✅ Table `client_master` ensured to exist.");

    // Create the `sub_allotment` table
    await db.query(createSubAllotmentTableQuery);
    console.log("✅ Table `sub_allotment` ensured to exist.");
  } catch (err) {
    console.error("❌ Failed to create tables:", err);
  }
})();

// CREATE - Add a new sub-allotment entry
router.post("/", async (req, res) => {
  const {
    fileno,
    alloted_date,
    alloted_by,
    alloted_to,
    task_name,
    description,
    completed,
    completion_date,
    add_user_id,
    add_date,
  } = req.body;

  if (!fileno || !task_name || !alloted_date) {
    return res.status(400).json({ error: "File number, Task name, and Alloted date are required." });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO sub_allotment 
      (fileno, alloted_date, alloted_by, alloted_to, task_name, description, completed, completion_date, add_user_id, add_date) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fileno,
        alloted_date,
        alloted_by || null,
        alloted_to || null,
        task_name,
        description,
        completed ? 1 : 0,
        completion_date || null,
        add_user_id,
        add_date,
      ]
    );
    res.status(201).json({
      success: true,
      message: "Sub-allotment entry added successfully",
      code: result.insertId,
    });
  } catch (err) {
    console.error("❌ Error adding sub-allotment entry:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// READ - Get all sub-allotment entries
router.get("/", async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM sub_allotment ORDER BY code DESC");
    res.json(results);
  } catch (err) {
    console.error("❌ Error fetching sub-allotment entries:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// READ - Get a single sub-allotment entry by code
router.get("/:code", async (req, res) => {
  const { code } = req.params;

  try {
    const [results] = await db.query("SELECT * FROM sub_allotment WHERE code = ?", [code]);
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ error: "Sub-allotment entry not found" });
    }
  } catch (err) {
    console.error("❌ Error fetching sub-allotment entry:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// UPDATE - Modify a sub-allotment entry
router.put("/:code", async (req, res) => {
  const { code } = req.params;
  const {
    fileno,
    alloted_date,
    alloted_by,
    alloted_to,
    task_name,
    description,
    completed,
    completion_date,
    modi_user_id,
    modi_date,
  } = req.body;

  if (!alloted_date || !task_name) {
    return res.status(400).json({ error: "Alloted date and task name are required" });
  }

  try {
    const [result] = await db.query(
      `UPDATE sub_allotment 
      SET fileno = ?, alloted_date = ?, alloted_by = ?, alloted_to = ?, task_name = ?, description = ?, completed = ?, completion_date = ?, modi_user_id = ?, modi_date = ? 
      WHERE code = ?`,
      [fileno, alloted_date, alloted_by, alloted_to, task_name, description, completed, completion_date, modi_user_id, modi_date, code]
    );

    if (result.affectedRows > 0) {
      res.json({ success: true, message: "Sub-allotment entry updated successfully" });
    } else {
      res.status(404).json({ error: "Sub-allotment entry not found" });
    }
  } catch (err) {
    console.error("❌ Error updating sub-allotment entry:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE - Remove a sub-allotment entry by code
router.delete("/:code", async (req, res) => {
  const { code } = req.params;

  try {
    const [result] = await db.query("DELETE FROM sub_allotment WHERE code = ?", [code]);

    if (result.affectedRows > 0) {
      res.json({ success: true, message: "Sub-allotment entry deleted successfully" });
    } else {
      res.status(404).json({ error: "Sub-allotment entry not found" });
    }
  } catch (err) {
    console.error("❌ Error deleting sub-allotment entry:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;