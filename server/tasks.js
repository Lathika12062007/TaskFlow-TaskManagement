const express = require("express");
const db = require("./db");

const router = express.Router();

function checkLogin(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({
            message: "Please login first"
        });
    }

    next();
}

router.use(checkLogin);

// Get all tasks
router.get("/", (req, res) => {
    const sql = "SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC";

    db.query(sql, [req.session.userId], (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Unable to fetch tasks"
            });
        }

        res.json(results);
    });
});

// Create task
router.post("/", (req, res) => {
    const {
        title,
        description,
        status,
        priority,
        due_date
    } = req.body;

    if (!title) {
        return res.status(400).json({
            message: "Task title is required"
        });
    }

    const sql = `
        INSERT INTO tasks
        (user_id, title, description, status, priority, due_date)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            req.session.userId,
            title,
            description || "",
            status || "Pending",
            priority || "Medium",
            due_date || null
        ],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: "Task creation failed"
                });
            }

            res.json({
                success: true,
                message: "Task created successfully",
                taskId: result.insertId
            });
        }
    );
});

// Update task
router.put("/:id", (req, res) => {
    const {
        title,
        description,
        status,
        priority,
        due_date
    } = req.body;

    const sql = `
        UPDATE tasks
        SET title = ?, description = ?, status = ?, priority = ?, due_date = ?
        WHERE id = ? AND user_id = ?
    `;

    db.query(
        sql,
        [
            title,
            description || "",
            status,
            priority,
            due_date || null,
            req.params.id,
            req.session.userId
        ],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: "Task update failed"
                });
            }

            res.json({
                success: true,
                message: "Task updated successfully"
            });
        }
    );
});

// Delete task
router.delete("/:id", (req, res) => {
    db.query(
        "DELETE FROM tasks WHERE id = ? AND user_id = ?",
        [req.params.id, req.session.userId],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: "Task deletion failed"
                });
            }

            res.json({
                success: true,
                message: "Task deleted successfully"
            });
        }
    );
});

module.exports = router;