const express = require('express');
const router = express.Router();
const db = require('../db/db'); // your mysql2 db connection

// ✅ Create table if not exists (auto-run at startup)
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS client_master (
    code INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    fileno VARCHAR(50) UNIQUE, -- Make fileno unique for FK reference
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

(async () => {
  try {
    await db.query(createTableQuery);
    console.log('Table `client_master` ensured to exist.');
  } catch (err) {
    console.error('Error ensuring table `client_master` exists:', err);
  }
})();

// Get all clients
router.get('/', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM client_master ORDER BY code DESC');
    res.json(results);
  } catch (err) {
    console.error('Error fetching clients:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get client by code
router.get('/:code', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM client_master WHERE code = ?', [req.params.code]);
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ error: 'Client not found' });
    }
  } catch (err) {
    console.error('Error fetching client by code:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a new client
router.post('/', async (req, res) => {
  const { name, fileno, firmname, gstno, pan, address, mob, email, folderpath, add_user_id, add_date } = req.body;

  if (!name || !mob || !email || !add_user_id || !add_date) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO client_master (name, fileno, firmname, gstno, pan, address, mob, email, folderpath, add_user_id, add_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
      [name, fileno, firmname, gstno, pan, address, mob, email, folderpath, add_user_id, add_date]
    );
    res.json({ message: 'Client added successfully!', clientCode: result.insertId });
  } catch (err) {
    console.error('Error adding client:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update client details
router.put('/:code', async (req, res) => {
  const { name, fileno, firmname, gstno, pan, address, mob, email, folderpath, modi_user_id, modi_date } = req.body;
  const clientCode = req.params.code;

  if (!name || !fileno || !firmname || !gstno || !pan || !address || !mob || !email || !folderpath || !modi_user_id || !modi_date) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const [result] = await db.query(
      'UPDATE client_master SET name = ?, fileno = ?, firmname = ?, gstno = ?, pan = ?, address = ?, mob = ?, email = ?, folderpath = ?, modi_user_id = ?, modi_date = ? WHERE code = ?', 
      [name, fileno, firmname, gstno, pan, address, mob, email, folderpath, modi_user_id, modi_date, clientCode]
    );
    
    if (result.affectedRows > 0) {
      res.json({ message: 'Client updated successfully!' });
    } else {
      res.status(404).json({ error: 'Client not found' });
    }
  } catch (err) {
    console.error('Error updating client:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete client
router.delete('/:code', async (req, res) => {
  const clientCode = req.params.code;

  try {
    const [result] = await db.query('DELETE FROM client_master WHERE code = ?', [clientCode]);
    
    if (result.affectedRows > 0) {
      res.json({ message: 'Client deleted successfully!' });
    } else {
      res.status(404).json({ error: 'Client not found' });
    }
  } catch (err) {
    console.error('Error deleting client:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
