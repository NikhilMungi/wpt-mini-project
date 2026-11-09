// ==============================================================================
// 🚪 AUTHENTICATION ROUTES (authRoutes.js)
// ==============================================================================
// PURPOSE:
// This router acts like a traffic director for all authentication requests.
// When a browser sends an HTTP POST request to:
// - /api/auth/register -> hands it to the `register` controller function
// - /api/auth/login    -> hands it to the `login` controller function
// ==============================================================================

const express = require("express");
// Create an isolated Express router instance
const router = express.Router();

// Import the actual business logic from authController.js
const { register, login } = require("./authController");

// Route 1: POST /api/auth/register
// Invoked when a new visitor fills out the Sign Up form
router.post("/register", register);

// Route 2: POST /api/auth/login
// Invoked when a user submits their email and password on the Login form
router.post("/login", login);

// Export router so Server.js can mount it under `app.use("/api/auth", authRoutes);`
module.exports = router;