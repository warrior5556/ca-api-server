const express = require('express');
const router = express.Router();
const db = require('../db/db'); // Importing the database connection from the db.js file

// Ensure the `doc_type_master` table exists
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS doc_type_master (
    code INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    add_user_id INT NOT NULL,
    add_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modi_user_id INT,
    modi_date DATETIME
  )
`;

(async () => {
  try {
    await db.query(createTableQuery);
    console.log('Table `doc_type_master` ensured to exist.');
  } catch (err) {
    console.error('Error ensuring table `doc_type_master` exists:', err);
  }
})();

// Get all document types
router.get('/', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM doc_type_master ORDER BY code DESC');
    res.json(results);
  } catch (err) {
    console.error("Error fetching document types:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Get a document type by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await db.query('SELECT * FROM doc_type_master WHERE code = ?', [id]);
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ error: "Document type not found" });
    }
  } catch (err) {
    console.error("Error fetching document type:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Add a new document type
router.post('/', async (req, res) => {
  const { name, description, add_user_id } = req.body;
  if (!name || !description || !add_user_id) {
    return res.status(400).json({ error: "Name, description, and add_user_id are required" });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO doc_type_master (name, description, add_user_id, add_date) VALUES (?, ?, ?, CURRENT_DATE())',
      [name, description, add_user_id]
    );
    res.status(201).json({ success: true, message: "Document type added successfully", code: result.insertId });
  } catch (err) {
    console.error("Error inserting document type:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Update a document type
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, modi_user_id } = req.body;

  if (!name || !description || !modi_user_id) {
    return res.status(400).json({ error: "Name, description, and modi_user_id are required" });
  }

  try {
    const [result] = await db.query(
      'UPDATE doc_type_master SET name = ?, description = ?, modi_user_id = ?, modi_date = CURRENT_DATE() WHERE code = ?',
      [name, description, modi_user_id, id]
    );
    if (result.affectedRows > 0) {
      res.json({ success: true, message: "Document type updated successfully" });
    } else {
      res.status(404).json({ error: "Document type not found" });
    }
  } catch (err) {
    console.error("Error updating document type:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Delete a document type
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM doc_type_master WHERE code = ?', [id]);
    if (result.affectedRows > 0) {
      res.json({ success: true, message: "Document type deleted successfully" });
    } else {
      res.status(404).json({ error: "Document type not found" });
    }
  } catch (err) {
    console.error("Error deleting document type:", err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
