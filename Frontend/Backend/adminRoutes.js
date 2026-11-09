// ==============================================================================
// 🛠️ ADMIN CONTROL PANEL ROUTES (adminRoutes.js)
// ==============================================================================
// PURPOSE:
// This router defines all protected administrative endpoints for the CineBook
// control center:
// - Dashboard KPIs / Metrics
// - Movie CRUD (Create, Read, Update, Delete)
// - Event CRUD (Concerts, Standup Comedy)
// - Show Scheduling & Seat Auto-Generation
// - Booking & User Audits
// - Poster File Uploads (PNG/JPEG via Multer)
// Mounted in Server.js at `/api/admin`.
// ==============================================================================

const express = require("express");
const router = express.Router();

// 1. Import security middlewares
const verifyToken = require("./authMiddleware");
const adminOnly = require("./adminMiddleware");

// 2. Import business logic handlers from adminController.js
const {
    getDashboardStats,
    getAdminMovies,
    createMovie,
    updateMovie,
    deleteMovie,
    getAdminEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    createShow,
    getAllBookings,
    getAllUsers
} = require("./adminController");

// 3. Import Multer upload middleware for poster images
const upload = require("./uploadMiddleware");

// ==============================================================================
// 🛡️ SECURITY GATEWAY
// All routes registered below this line automatically require a valid JWT token
// AND an account with role = 'ADMIN'. Unauthorized requests are immediately blocked!
// ==============================================================================
router.use(verifyToken, adminOnly);

// ------------------------------------------------------------------------------
// 1. DASHBOARD METRICS (KPIs)
// ------------------------------------------------------------------------------
// GET /api/admin/dashboard -> Counts of active movies, events, bookings, and users
router.get("/dashboard", getDashboardStats);

// ------------------------------------------------------------------------------
// 2. MOVIE MANAGEMENT (CRUD)
// ------------------------------------------------------------------------------
// GET    /api/admin/movies     -> Fetch all movies (both ACTIVE and INACTIVE)
router.get("/movies", getAdminMovies);

// POST   /api/admin/movies     -> Add new movie, schedules initial show, generates 20 seats
router.post("/movies", createMovie);

// PUT    /api/admin/movies/:id -> Update title, genre, poster, or rating
router.put("/movies/:id", updateMovie);

// DELETE /api/admin/movies/:id -> Soft delete (sets status = 'INACTIVE' without losing foreign keys)
router.delete("/movies/:id", deleteMovie);

// ------------------------------------------------------------------------------
// 3. EVENT MANAGEMENT (CRUD)
// ------------------------------------------------------------------------------
// GET    /api/admin/events     -> Fetch all live concerts/events
router.get("/events", getAdminEvents);

// POST   /api/admin/events     -> Add new event with venue, date, price, poster
router.post("/events", createEvent);

// PUT    /api/admin/events/:id -> Update event details
router.put("/events/:id", updateEvent);

// DELETE /api/admin/events/:id -> Soft delete event (status = 'INACTIVE')
router.delete("/events/:id", deleteEvent);

// ------------------------------------------------------------------------------
// 4. SHOW SCHEDULING
// ------------------------------------------------------------------------------
// POST   /api/admin/shows      -> Schedule additional showtimes and auto-generate 20 seats
router.post("/shows", createShow);

// ------------------------------------------------------------------------------
// 5. AUDIT LOGS (TRANSACTIONS & USERS)
// ------------------------------------------------------------------------------
// GET    /api/admin/bookings   -> System-wide audit of all ticket bookings across all users
router.get("/bookings", getAllBookings);

// GET    /api/admin/users      -> Directory of all registered customer & admin accounts
router.get("/users", getAllUsers);

// ------------------------------------------------------------------------------
// 6. POSTER IMAGE UPLOAD (PNG / JPEG / WEBP)
// ------------------------------------------------------------------------------
// POST   /api/admin/upload     -> Uploads physical image file to disk using Multer
router.post("/upload", (req, res) => {
    // Invoke the multer single file handler expecting field name "poster"
    upload.single("poster")(req, res, (err) => {
        if (err) {
            // Returns 400 Bad Request if file is invalid or exceeds 5 MB
            return res.status(400).json({ message: err.message || "File upload failed" });
        }
        if (!req.file) {
            return res.status(400).json({ message: "No image file provided in upload" });
        }

        // Construct the full publicly accessible URL for the newly saved image
        const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;

        res.json({
            message: "Poster uploaded successfully",
            imageUrl: fileUrl,
            filename: req.file.filename
        });
    });
});

module.exports = router;
