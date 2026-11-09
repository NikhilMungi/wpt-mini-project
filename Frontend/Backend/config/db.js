// ==============================================================================
// 🗄️ DATABASE CONFIGURATION (db.js)
// ==============================================================================
// PURPOSE:
// This file establishes and manages our connection to the MySQL relational database.
// It uses a "Connection Pool" so that multiple users can query the database simultaneously
// without crashing the server or suffering performance delays.
// ==============================================================================

// 1. Import the mysql2 library with Promise support.
// "Promise support" allows us to use modern JavaScript `async/await` syntax
// instead of messy, hard-to-read nested callback functions.
const mysql = require("mysql2/promise");

// 2. Load environment variables from the `.env` file into `process.env`.
// This keeps sensitive secrets (like DB passwords) safe and outside of git commits.
require("dotenv").config();

// 3. Create a Connection Pool.
// A pool is a collection of pre-established, reusable connections to MySQL.
// Instead of creating a brand-new connection for every single incoming web request
// (which is very slow), the server borrows a connection from this pool, runs the query,
// and immediately returns the connection back to the pool for the next user.
const pool = mysql.createPool({
    // Hostname where MySQL is running (usually "localhost" or "127.0.0.1")
    host: process.env.DB_HOST,

    // MySQL username (e.g., "root")
    user: process.env.DB_USER,

    // MySQL password configured in your .env file
    password: process.env.DB_PASSWORD,

    // Name of our application's database (e.g., "cinebook")
    database: process.env.DB_NAME,

    // If all connections are currently busy, wait in a queue rather than throwing an error
    waitForConnections: true,

    // Maximum number of simultaneous connections the pool can keep open at once
    connectionLimit: 10,

    // Max number of requests allowed to wait in the queue when connections are saturated
    queueLimit: 0
});

// 4. Export the pool so other files (controllers, routes) can import it using `require('./config/db')`
// and run queries like: `const [rows] = await db.query("SELECT * FROM movies");`
module.exports = pool;