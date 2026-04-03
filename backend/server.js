const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// ── DB CONNECTION ──────────────────────────────────────────
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "maritime",
});

db.connect((err) => {
  if (err) { console.error("DB connection failed:", err); return; }
  console.log("Connected to MySQL");

  // Create users table if it doesn't exist
  db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id         INT PRIMARY KEY AUTO_INCREMENT,
      name       VARCHAR(100) NOT NULL,
      email      VARCHAR(100) NOT NULL UNIQUE,
      password   VARCHAR(255) NOT NULL,
      role       ENUM('admin', 'officer', 'viewer') DEFAULT 'officer',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error("Failed to create users table:", err);
    else console.log("Users table ready");
  });
});

const JWT_SECRET = process.env.JWT_SECRET || "maritime_dominion_secret_2024";

// ── MIDDLEWARE: verify token ───────────────────────────────
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// ── AUTH ROUTES ────────────────────────────────────────────

// POST /auth/signup
app.post("/auth/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ message: "All fields are required" });

  if (password.length < 6)
    return res.status(400).json({ message: "Password must be at least 6 characters" });

  try {
    const hashed = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashed],
      (err, result) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY")
            return res.status(409).json({ message: "Email already registered" });
          return res.status(500).json({ message: "Database error" });
        }

        const token = jwt.sign(
          { id: result.insertId, name, email },
          JWT_SECRET,
          { expiresIn: "7d" }
        );

        res.status(201).json({ token, name, email });
      }
    );
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /auth/login
app.post("/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (results.length === 0)
        return res.status(401).json({ message: "Invalid email or password" });

      const user = results[0];
      const match = await bcrypt.compare(password, user.password);

      if (!match)
        return res.status(401).json({ message: "Invalid email or password" });

      const token = jwt.sign(
        { id: user.id, name: user.name, email: user.email },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({ token, name: user.name, email: user.email });
    }
  );
});

// ── VESSEL ROUTES ──────────────────────────────────────────

// GET /vessels — protected
app.get("/vessels", authenticate, (req, res) => {
  db.query("SELECT * FROM vessels", (err, result) => {
    if (err) return res.status(500).json({ message: "Error fetching vessels" });
    res.json(result);
  });
});

// POST /add-vessel — protected
app.post("/add-vessel", authenticate, (req, res) => {
  const { name, imo_number, flag_state, type } = req.body;

  if (!name || !imo_number)
    return res.status(400).json({ message: "Name and IMO number are required" });

  db.query(
    "INSERT INTO vessels (name, imo_number, flag_state, type) VALUES (?, ?, ?, ?)",
    [name, imo_number, flag_state || null, type || null],
    (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY")
          return res.status(409).json({ message: "IMO number already exists" });
        return res.status(500).json({ message: "Error adding vessel" });
      }
      res.status(201).json({ message: "Vessel added", id: result.insertId });
    }
  );
});

// ── LOG ROUTES ─────────────────────────────────────────────

// GET /logs — protected
app.get("/logs", authenticate, (req, res) => {
  const q = `
    SELECT logs.*, vessels.name AS vessel_name
    FROM logs
    LEFT JOIN vessels ON logs.vessel_id = vessels.id
    ORDER BY logs.timestamp DESC
  `;
  db.query(q, (err, result) => {
    if (err) return res.status(500).json({ message: "Error fetching logs" });
    res.json(result);
  });
});

// POST /add-log — protected
app.post("/add-log", authenticate, (req, res) => {
  const { vessel_id, sulfur_level, waste_amount, port_id, voyage_id } = req.body;

  if (!vessel_id || sulfur_level == null || waste_amount == null)
    return res.status(400).json({ message: "vessel_id, sulfur_level, and waste_amount are required" });

  db.query(
    "INSERT INTO logs (vessel_id, sulfur_level, waste_amount, port_id, voyage_id) VALUES (?, ?, ?, ?, ?)",
    [vessel_id, sulfur_level, waste_amount, port_id || null, voyage_id || null],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Error adding log" });
      res.status(201).json({ message: "Log added", id: result.insertId });
    }
  );
});

// ── TEST ROUTE ─────────────────────────────────────────────
app.get("/test", (req, res) => res.json({ status: "ok", message: "Maritime Dominion API running" }));

// ── START ──────────────────────────────────────────────────
app.listen(3000, () => console.log("Server running on port 3000"));