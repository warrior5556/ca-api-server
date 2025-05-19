const express = require("express");
const router = express.Router();
const db = require("../db/db");

// Ensure the suballotments table exists
const createSubAllotmentsTableQuery = `
  CREATE TABLE IF NOT EXISTS suballotments (
    code INT AUTO_INCREMENT PRIMARY KEY,
    file_name VARCHAR(255),
    alloted_by VARCHAR(255),
    alloted_to VARCHAR(255),
    task_name VARCHAR(255),
    description TEXT,
    alloted_date DATE,
    completed ENUM('yes', 'no') DEFAULT 'no',
    completion_date DATE,
    add_user_id VARCHAR(100),
    add_date DATE,
    modi_user_id VARCHAR(100),
    modi_date DATE
  )
`;

(async () => {
  try {
    await db.query(createSubAllotmentsTableQuery);
    console.log("✅ Table `suballotments` ensured to exist.");
  } catch (err) {
    console.error("❌ Failed to create `suballotments` table:", err);
  }
})();

// CREATE
router.post("/", async (req, res) => {
  console.log("Incoming req.body:", req.body);
  const {
    file_name,
    alloted_by,
    alloted_to,
    task_name,
    description,
    alloted_date,
    completed,
    completion_date,
    add_user_id,
    add_date,
  } = req.body;

  if (!file_name || !task_name || !alloted_date) {
    return res.status(400).json({ error: "File name, Task name, and Alloted date are required." });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO suballotments 
      (file_name, alloted_by, alloted_to, task_name, description, alloted_date, completed, completion_date, add_user_id, add_date) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        file_name,
        alloted_by,
        alloted_to,
        task_name,
        description,
        alloted_date,
        completed === "yes" ? "yes" : "no",
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
    console.error("❌ Error adding suballotment:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// READ all
router.get("/", async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM suballotments ORDER BY code DESC");
    res.json(results);
  } catch (err) {
    console.error("❌ Error fetching suballotments:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// READ by code
router.get("/:code", async (req, res) => {
  const { code } = req.params;
  try {
    const [results] = await db.query("SELECT * FROM suballotments WHERE code = ?", [code]);
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ error: "Suballotment not found" });
    }
  } catch (err) {
    console.error("❌ Error fetching suballotment:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// UPDATE
router.put("/:code", async (req, res) => {
  const { code } = req.params;
  const {
    file_name,
    alloted_by,
    alloted_to,
    task_name,
    description,
    alloted_date,
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
      `UPDATE suballotments 
       SET file_name = ?, alloted_by = ?, alloted_to = ?, task_name = ?, description = ?, alloted_date = ?, completed = ?, completion_date = ?, modi_user_id = ?, modi_date = ?
       WHERE code = ?`,
      [
        file_name,
        alloted_by,
        alloted_to,
        task_name,
        description,
        alloted_date,
        completed === "yes" ? "yes" : "no",
        completion_date || null,
        modi_user_id,
        modi_date,
        code,
      ]
    );

    if (result.affectedRows > 0) {
      res.json({ success: true, message: "Suballotment updated successfully" });
    } else {
      res.status(404).json({ error: "Suballotment not found" });
    }
  } catch (err) {
    console.error("❌ Error updating suballotment:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE
router.delete("/:code", async (req, res) => {
  const { code } = req.params;
  try {
    const [result] = await db.query("DELETE FROM suballotments WHERE code = ?", [code]);

    if (result.affectedRows > 0) {
      res.json({ success: true, message: "Suballotment deleted successfully" });
    } else {
      res.status(404).json({ error: "Suballotment not found" });
    }
  } catch (err) {
    console.error("❌ Error deleting suballotment:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
