const express = require("express");
const router = express.Router();
const db = require("../db/db"); // MySQL connection

// Ensure table exists with the exact structure
const createDocumentsTableQuery = `
  CREATE TABLE IF NOT EXISTS documents (
    code INT NOT NULL AUTO_INCREMENT,
    task_code INT NOT NULL,
    doc_name VARCHAR(255) NOT NULL,
    description TEXT,
    add_user_id INT DEFAULT NULL,
    add_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    modi_user_id INT DEFAULT NULL,
    modi_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (code),
    KEY fk_task_code (task_code),
    CONSTRAINT fk_task_code FOREIGN KEY (task_code) REFERENCES tasks_allotment_master (code) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
`;

(async () => {
  try {
    await db.query(createDocumentsTableQuery);
    console.log("✅ Table `documents` ensured to exist.");
  } catch (err) {
    console.error("❌ Failed to create `documents` table:", err);
  }
})();


// CREATE (POST)
router.post("/", async (req, res) => {
  try {
    const { task_code, doc_name, description, add_user_id } = req.body;

    if (!task_code || !doc_name) {
      return res.status(400).json({ error: "task_code and doc_name are required" });
    }

    // Convert add_user_id to integer if it's a string
    let userId = add_user_id;
    if (typeof add_user_id === 'string') {
      // If it's a numeric string, convert to number
      if (!isNaN(add_user_id)) {
        userId = parseInt(add_user_id, 10);
      } else {
        // If it's a username like 'admin', you need to look up the user ID
        // For now, we'll set it to null to avoid the error
        console.log(`Warning: Non-numeric user ID provided: ${add_user_id}`);
        userId = null;
      }
    }

    const sql = `
      INSERT INTO documents (task_code, doc_name, description, add_user_id)
      VALUES (?, ?, ?, ?)`;
    const values = [task_code, doc_name, description || null, userId];

    console.log("Executing SQL with values:", values);

    const [result] = await db.query(sql, values);
    res.status(201).json({ 
      success: true,
      message: "Document created", 
      code: result.insertId 
    });
  } catch (err) {
    console.error("❌ POST /documents error:", err);
    res.status(500).json({ error: "Failed to create document" });
  }
});


// READ ALL (GET)
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT d.*, t.prime_taskname 
      FROM documents d
      LEFT JOIN tasks_allotment_master t ON d.task_code = t.code
      ORDER BY d.code DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("❌ GET /documents error:", err);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});


// READ ONE (GET /:code)
router.get("/:code", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT d.*, t.prime_taskname 
      FROM documents d
      LEFT JOIN tasks_allotment_master t ON d.task_code = t.code
      WHERE d.code = ?
    `, [req.params.code]);
    
    if (rows.length === 0) return res.status(404).json({ error: "Document not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("❌ GET /documents/:code error:", err);
    res.status(500).json({ error: "Failed to fetch document" });
  }
});


// UPDATE (PUT /:code)
router.put("/:code", async (req, res) => {
  try {
    const { task_code, doc_name, description, modi_user_id } = req.body;

    if (!task_code || !doc_name) {
      return res.status(400).json({ error: "task_code and doc_name are required" });
    }

    // Convert modi_user_id to integer if it's a string
    let userId = modi_user_id;
    if (typeof modi_user_id === 'string') {
      // If it's a numeric string, convert to number
      if (!isNaN(modi_user_id)) {
        userId = parseInt(modi_user_id, 10);
      } else {
        // If it's a username like 'admin', you need to look up the user ID
        // For now, we'll set it to null to avoid the error
        console.log(`Warning: Non-numeric user ID provided: ${modi_user_id}`);
        userId = null;
      }
    }

    const sql = `
      UPDATE documents SET
        task_code = ?, doc_name = ?, description = ?, modi_user_id = ?
      WHERE code = ?`;

    const values = [
      task_code,
      doc_name,
      description || null,
      userId,
      req.params.code
    ];

    const [result] = await db.query(sql, values);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Document not found" });

    res.json({ 
      success: true,
      message: "Document updated" 
    });
  } catch (err) {
    console.error("❌ PUT /documents/:code error:", err);
    res.status(500).json({ error: "Failed to update document" });
  }
});


// DELETE (DELETE /:code)
router.delete("/:code", async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM documents WHERE code = ?", [req.params.code]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Document not found" });

    res.json({ 
      success: true,
      message: "Document deleted" 
    });
  } catch (err) {
    console.error("❌ DELETE /documents/:code error:", err);
    res.status(500).json({ error: "Failed to delete document" });
  }
});

module.exports = router;
