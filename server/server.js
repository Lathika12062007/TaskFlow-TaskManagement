
const express = require("express");
const session = require("express-session");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

// Serve static files
app.use(express.static(path.join(__dirname, "../public/css")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/css/index.html"));
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server running at http://localhost:${process.env.PORT || 3000}`);
});
