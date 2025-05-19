  const express = require("express");
  const router = express.Router();
  const db = require("../db/db"); // Assumes you have a db.js exporting promise pool

  // Ensure the `task_master` table exists
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS task_master (
      code INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description_of_the_task TEXT NOT NULL,
      add_user_id INT NOT NULL,
      add_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      modi_user_id INT,
      modi_date DATETIME
    )
  `;

  (async () => {
    try {
      await db.query(createTableQuery);
      console.log('Table `task_master` ensured to exist.');
    } catch (err) {
      console.error('Error ensuring table `task_master` exists:', err);
    }
  })();

  // Get all task types
  router.get("/", async (req, res) => {
    try {
      const [results] = await db.query("SELECT * FROM task_master ORDER BY code DESC");
      res.json(results);
    } catch (err) {
      console.error("Error fetching task types:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // Get a task type by ID
  router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const [results] = await db.query("SELECT * FROM task_master WHERE code = ?", [id]);

      if (results.length > 0) {
        res.json(results[0]);
      } else {
        res.status(404).json({ error: "Task type not found" });
      }
    } catch (err) {
      console.error("Error fetching task type:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // Add a new task type
  router.post("/", async (req, res) => {
    const { name, description_of_the_task, add_user_id } = req.body;

    if (!name || !description_of_the_task || !add_user_id) {
      return res.status(400).json({ error: "Name, description_of_the_task, and add_user_id are required" });
    }

    try {
      const [result] = await db.query(
        "INSERT INTO task_master (name, description_of_the_task, add_user_id, add_date) VALUES (?, ?, ?, NOW())",
        [name, description_of_the_task, add_user_id]
      );
      res.status(201).json({ success: true, message: "Task type added successfully", code: result.insertId });
    } catch (err) {
      console.error("Error inserting task type:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // Update a task type
  router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { name, description_of_the_task, modi_user_id } = req.body;

    if (!name || !description_of_the_task || !modi_user_id) {
      return res.status(400).json({ error: "Name, description_of_the_task, and modi_user_id are required" });
    }

    try {
      const [result] = await db.query(
        "UPDATE task_master SET name = ?, description_of_the_task = ?, modi_user_id = ?, modi_date = NOW() WHERE code = ?",
        [name, description_of_the_task, modi_user_id, id]
      );

      if (result.affectedRows > 0) {
        res.json({ success: true, message: "Task type updated successfully" });
      } else {
        res.status(404).json({ error: "Task type not found" });
      }
    } catch (err) {
      console.error("Error updating task type:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // Delete a task type
  router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
      const [result] = await db.query("DELETE FROM task_master WHERE code = ?", [id]);

      if (result.affectedRows > 0) {
        res.json({ success: true, message: "Task type deleted successfully" });
      } else {
        res.status(404).json({ error: "Task type not found" });
      }
    } catch (err) {
      console.error("Error deleting task type:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  module.exports = router;
