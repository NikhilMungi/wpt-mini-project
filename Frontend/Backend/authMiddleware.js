// ==============================================================================
// 🔐 AUTHENTICATION MIDDLEWARE (authMiddleware.js)
// ==============================================================================
// PURPOSE:
// In web applications, "Middleware" acts like a security guard / bouncer at an entrance.
// Whenever a user tries to access a protected page (like booking seats or viewing their tickets),
// this function runs FIRST to verify whether the user is legitimately logged in.
// It checks the digital badge (JSON Web Token - JWT) sent in the request headers.
// ==============================================================================

const jwt = require("jsonwebtoken");

/**
 * verifyToken Middleware
 * @param {Object} req - The incoming HTTP Request from the client/browser
 * @param {Object} res - The outgoing HTTP Response sent back to the client
 * @param {Function} next - Express function that passes control to the next route handler
 */
const verifyToken = (req, res, next) => {
    try {
        // Step 1: Look for the "authorization" header in the incoming request.
        // The standard convention for sending JWT tokens is:
        // Authorization: Bearer <your_long_encrypted_token_string>
        const authHeader = req.headers.authorization;

        // Step 2: Validate the format of the Authorization header.
        // If there's no header, or if it doesn't begin with "Bearer ", block the request!
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Access Denied: Please login first to access this resource"
            });
        }

        // Step 3: Extract the raw token string by splitting on the space character.
        // "Bearer eyJhbGciOi..." -> split by space -> [0] is "Bearer", [1] is "eyJhbGciOi..."
        const token = authHeader.split(" ")[1];

        // Step 4: Cryptographically verify the token using our secret key.
        // `jwt.verify` checks two things:
        // 1. Has the token been tampered with? (The cryptographic signature must match JWT_SECRET)
        // 2. Has the token expired? (JWT tokens automatically expire after 1 day)
        // If valid, `decoded` contains the payload we stored inside the token: { id, email, role }
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Step 5: Attach the decoded user information directly to the `req` (request) object.
        // This makes `req.user.id`, `req.user.email`, and `req.user.role` instantly available
        // to all subsequent controllers (like bookingController or adminController).
        req.user = decoded;

        // Step 6: Call next() to let the request proceed to the actual controller logic!
        next();

    } catch (error) {
        // If jwt.verify fails (e.g. token expired, malformed, or tampered with), catch the error
        // and return an HTTP 401 Unauthorized response.
        return res.status(401).json({
            message: "Session expired or invalid token. Please log in again."
        });
    }
};

// Export the middleware so routes can use it: `router.get('/my-bookings', verifyToken, ...)`
module.exports = verifyToken;