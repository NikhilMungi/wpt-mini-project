// ==============================================================================
// 🚀 CINEBOOK BACKEND SERVER ENTRY POINT (Server.js)
// ==============================================================================
// PURPOSE:
// This is the main starting point of our Node.js + Express backend application.
// When you run `node Server.js`, this file:
// 1. Boots up the Express HTTP web server.
// 2. Configures CORS (Cross-Origin Resource Sharing) so our React Vite frontend can communicate with it.
// 3. Enables JSON parsing for incoming HTTP POST/PUT request bodies.
// 4. Statically exposes the `/uploads` folder to serve locally stored movie & event posters.
// 5. Mounts modular API sub-routers (/api/auth, /api/bookings, /api/admin).
// 6. Exposes public catalog endpoints (movies list, single movie details, recommended shows, events).
// ==============================================================================

// 1. Core Dependencies
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config(); // Loads environment variables from `.env`

// 2. Import Database Connection Pool
const db = require("./config/db");

// 3. Import Modular Route Handlers
const authRoutes = require("./authRoutes");
const bookingRoutes = require("./bookingRoutes");
const adminRoutes = require("./adminRoutes");

// 4. Initialize Express Application
const app = express();

// ------------------------------------------------------------------------------
// MIDDLEWARE CONFIGURATION
// ------------------------------------------------------------------------------

// (a) CORS Configuration:
// By default, browsers block web pages from making API requests to a different port.
// Because React runs on http://localhost:5173 and Node runs on http://localhost:5000,
// we must explicitly allow origin "http://localhost:5173".
app.use(cors({
    origin: "http://localhost:5173"
}));

// (b) JSON Request Body Parser:
// Converts incoming raw JSON strings from request payloads into readable JavaScript objects (req.body).
app.use(express.json());

// (c) Static File Serving for Uploaded Posters:
// Makes the `Frontend/Backend/uploads/` directory accessible over HTTP.
// For example, an image at `uploads/poster-123.png` can be viewed at:
// `http://localhost:5000/uploads/poster-123.png`
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// ------------------------------------------------------------------------------
// HEALTH & DIAGNOSTIC ENDPOINTS
// ------------------------------------------------------------------------------

// Root Test Endpoint: Confirms backend server is alive
app.get("/", (req, res) => {
    res.send("CineBook Backend is Running!");
});

// MySQL Connection Test Endpoint:
// Executes a lightweight query `SELECT 1` to verify database credentials and network reachability
app.get("/api/db-test", async (req, res) => {
    try {
        const [result] = await db.query("SELECT 1 AS connected");
        res.json({
            message: "MySQL connected successfully",
            result
        });
    } catch (error) {
        console.error("Database connection test error:", error);
        res.status(500).json({
            message: "MySQL connection failed. Check your .env credentials."
        });
    }
});


// ------------------------------------------------------------------------------
// MODULAR API SUB-ROUTERS
// ------------------------------------------------------------------------------
// Any request starting with:
// - /api/auth     -> delegated to authRoutes.js (register, login)
// - /api/bookings -> delegated to bookingRoutes.js (seat matrix, reservations, cancellation)
// - /api/admin    -> delegated to adminRoutes.js (CRUD operations, audits, uploads)
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);


// ------------------------------------------------------------------------------
// PUBLIC CATALOG ENDPOINTS (MOVIES, SHOWS, EVENTS)
// ------------------------------------------------------------------------------

/**
 * GET /api/movies
 * Returns all active movies ordered with newly added movies first.
 */
app.get("/api/movies", async (req, res) => {
    try {
        const [movies] = await db.query(
            "SELECT * FROM movies WHERE status = 'ACTIVE' ORDER BY movie_id DESC"
        );
        res.json(movies);
    } catch (error) {
        console.error("Fetch movies error:", error);
        res.status(500).json({ message: "Unable to fetch movies" });
    }
});

/**
 * GET /api/movies/:id
 * Returns complete metadata for a single movie along with all its scheduled showtimes.
 */
app.get("/api/movies/:id", async (req, res) => {
    try {
        const movieId = req.params.id;

        // Query movie details
        const [movies] = await db.query(
            "SELECT * FROM movies WHERE movie_id = ? AND status = 'ACTIVE'",
            [movieId]
        );

        if (movies.length === 0) {
            return res.status(404).json({ message: "Movie not found" });
        }

        // Query all upcoming showtimes for this movie
        const [shows] = await db.query(
            "SELECT * FROM shows WHERE movie_id = ? ORDER BY show_datetime ASC",
            [movieId]
        );

        // Return combined JSON object
        res.json({
            movie: movies[0],
            shows: shows
        });

    } catch (error) {
        console.error("Movie details error:", error);
        res.status(500).json({ message: "Error fetching movie details" });
    }
});

/**
 * GET /api/shows/recommended
 * Returns top 6 scheduled screenings joined with movie metadata for the homepage.
 * Sorted by `s.show_id DESC` so that shows newly created in the Admin Panel appear first!
 */
app.get("/api/shows/recommended", async (req, res) => {
    try {
        const [shows] = await db.query(`
            SELECT 
                s.show_id,
                s.movie_id,
                s.screen_name,
                s.show_datetime,
                s.ticket_price,
                m.title AS movie_title,
                m.poster_url,
                m.genre,
                m.language,
                m.duration,
                m.rating
            FROM shows s
            JOIN movies m ON s.movie_id = m.movie_id
            WHERE m.status = 'ACTIVE'
            ORDER BY s.show_id DESC
            LIMIT 6
        `);

        res.json(shows);
    } catch (error) {
        console.error("Recommended shows error:", error);
        res.status(500).json({ message: "Unable to fetch recommended shows" });
    }
});

/**
 * GET /api/events
 * Returns all active live concerts, comedy gigs, and cultural performances.
 */
app.get("/api/events", async (req, res) => {
    try {
        const [events] = await db.query(
            "SELECT * FROM events WHERE status = 'ACTIVE' ORDER BY event_id DESC"
        );
        res.json(events);
    } catch (error) {
        console.error("Fetch events error:", error);
        res.status(500).json({ message: "Unable to fetch events" });
    }
});


// ------------------------------------------------------------------------------
// SERVER INITIALIZATION
// ------------------------------------------------------------------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🎬 CineBook Backend Server Running on Port ${PORT}`);
    console.log(`🌐 Base URL: http://localhost:${PORT}`);
    console.log(`📁 Static Uploads: http://localhost:${PORT}/uploads`);
    console.log(`====================================================`);
});