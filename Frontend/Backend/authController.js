// ==============================================================================
// 👥 AUTHENTICATION CONTROLLER (authController.js)
// ==============================================================================
// PURPOSE:
// This controller contains the business logic for user management:
// 1. register: Validates input, hashes passwords, checks duplicates, creates new user.
// 2. login: Verifies email, checks bcrypt hash, issues a signed JWT token.
// ==============================================================================

const db = require("./config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**
 * ------------------------------------------------------------------------------
 * 1. REGISTER NEW USER
 * Endpoint: POST /api/auth/register
 * ------------------------------------------------------------------------------
 */
exports.register = async (req, res) => {
    try {
        // Step 1: Destructure user input submitted in the request body
        const { full_name, email, phone, password } = req.body;

        // Step 2: Validate that all required fields are present
        if (!full_name || !email || !phone || !password) {
            // HTTP 400 = Bad Request (missing required parameters)
            return res.status(400).json({
                message: "All fields (full name, email, phone, password) are required"
            });
        }

        // Step 3: Validate Indian 10-digit mobile number format
        // Regular expression: exactly 10 digits from 0-9
        if (!/^\d{10}$/.test(phone)) {
            return res.status(400).json({
                message: "Please enter a valid 10-digit mobile phone number"
            });
        }

        // Step 4: Ensure password meets minimum length security standard
        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters long for security"
            });
        }

        // Step 5: Check if email or phone is already taken in the database
        // NOTE: We use parameterized queries `[email, phone]` to prevent SQL Injection attacks!
        const [existingUsers] = await db.query(
            "SELECT user_id FROM users WHERE email = ? OR phone = ?",
            [email, phone]
        );

        if (existingUsers.length > 0) {
            // HTTP 409 = Conflict (resource already exists)
            return res.status(409).json({
                message: "An account with this email address or phone number already exists"
            });
        }

        // Step 6: Hash the password using bcrypt with 10 salt rounds
        // SECURITY NOTE FOR VIVA:
        // We NEVER store plaintext passwords. If the database were ever compromised,
        // attackers cannot read hashed passwords because bcrypt is a one-way mathematical function.
        const hashedPassword = await bcrypt.hash(password, 10);

        // Step 7: Insert the new user record into the database
        // Default role is always set to 'USER' (Admins must be configured manually by superadmins)
        await db.query(
            `INSERT INTO users
            (full_name, email, phone, password, role)
            VALUES (?, ?, ?, ?, 'USER')`,
            [full_name, email, phone, hashedPassword]
        );

        // Step 8: Respond with HTTP 201 Created
        return res.status(201).json({
            message: "Registration successful! You can now log in to your account."
        });

    } catch (error) {
        console.error("Registration error:", error);
        // HTTP 500 = Internal Server Error
        return res.status(500).json({
            message: "A server error occurred during registration. Please try again later."
        });
    }
};


/**
 * ------------------------------------------------------------------------------
 * 2. LOGIN USER & GENERATE JWT
 * Endpoint: POST /api/auth/login
 * ------------------------------------------------------------------------------
 */
exports.login = async (req, res) => {
    try {
        // Step 1: Destructure credentials from request body
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide both email address and password"
            });
        }

        // Step 2: Query database for a user matching the provided email
        const [users] = await db.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        // If no user matches the email, reject
        if (users.length === 0) {
            // HTTP 401 = Unauthorized
            // Security Tip: We intentionally say "Invalid email or password" (ambiguous)
            // so malicious actors cannot enumerate which emails exist in our system.
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = users[0];

        // Step 3: Compare submitted password against the stored bcrypt hash
        // `bcrypt.compare` hashes the submitted password with the original salt and verifies if they match.
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Step 4: Generate a signed JSON Web Token (JWT)
        // Payload contains the user ID and their role ('USER' or 'ADMIN')
        // Expires in 1 day ("1d")
        const token = jwt.sign(
            {
                user_id: user.user_id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // Step 5: Send back the token and public profile info
        // (Notice we NEVER return the password field in the response!)
        return res.json({
            message: "Login successful",
            token,
            user: {
                user_id: user.user_id,
                full_name: user.full_name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            message: "A server error occurred during login. Please try again later."
        });
    }
};