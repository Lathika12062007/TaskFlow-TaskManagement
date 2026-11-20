const express = require("express");
const bcrypt = require("bcrypt");
const db = require("./db");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";

        db.query(sql, [name, email, hashedPassword], (err, result) => {
            if (err) {
                return res.status(400).json({
                    message: "Email already exists or registration failed"
                });
            }

            res.json({
                message: "Registration successful",
                success: true
            });
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error"
        });
    }
});

// Login
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        async (err, results) => {
            if (err || results.length === 0) {
                return res.status(401).json({
                    message: "Invalid email or password"
                });
            }

            const user = results[0];

            const match = await bcrypt.compare(
                password,
                user.password
            );

            if (!match) {
                return res.status(401).json({
                    message: "Invalid email or password"
                });
            }

            req.session.userId = user.id;
            req.session.userName = user.name;

            res.json({
                success: true,
                message: "Login successful",
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            });
        }
    );
});

// Logout
router.post("/logout", (req, res) => {
    req.session.destroy(() => {
        res.json({
            success: true,
            message: "Logged out successfully"
        });
    });
});

// Check user session
router.get("/me", (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            authenticated: false
        });
    }

    res.json({
        authenticated: true,
        user: {
            id: req.session.userId,
            name: req.session.userName
        }
    });
});

module.exports = router;