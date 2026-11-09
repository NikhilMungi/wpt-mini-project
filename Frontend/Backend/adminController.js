// ==============================================================================
// 👑 ADMIN CONTROLLER (adminController.js)
// ==============================================================================
// PURPOSE:
// This controller powers the back-office operations for CineBook administrators:
// 1. getDashboardStats: Calculates live KPI cards (total movies, events, bookings, users).
// 2. Movie CRUD: Create movie + auto-schedule show + auto-generate 20 seats; update; soft-delete.
// 3. Event CRUD: Create concert/comedy gigs; update; soft-delete.
// 4. createShow: Manually schedule a new screening with auto-generated seats A1-D5.
// 5. getAllBookings: System-wide financial & reservation audit across all users.
// 6. getAllUsers: Directory of registered users and roles.
// ==============================================================================

const db = require("./config/db");

/**
 * ------------------------------------------------------------------------------
 * 1. DASHBOARD OVERVIEW METRICS (KPIs)
 * Endpoint: GET /api/admin/dashboard
 * ------------------------------------------------------------------------------
 */
exports.getDashboardStats = async (req, res) => {
    try {
        // Execute fast COUNT queries against active records in MySQL
        const [[{ totalMovies }]] = await db.query("SELECT COUNT(*) AS totalMovies FROM movies WHERE status = 'ACTIVE'");
        const [[{ totalEvents }]] = await db.query("SELECT COUNT(*) AS totalEvents FROM events WHERE status = 'ACTIVE'");
        const [[{ totalBookings }]] = await db.query("SELECT COUNT(*) AS totalBookings FROM bookings");
        const [[{ totalUsers }]] = await db.query("SELECT COUNT(*) AS totalUsers FROM users WHERE role = 'USER'");

        // Send back an aggregated summary object for the admin overview stat cards
        res.json({
            movies: totalMovies,
            events: totalEvents,
            bookings: totalBookings,
            users: totalUsers
        });
    } catch (error) {
        console.error("Dashboard stats error:", error);
        res.status(500).json({ message: "Failed to load dashboard metrics" });
    }
};

/**
 * ------------------------------------------------------------------------------
 * 2. MOVIE MANAGEMENT (CRUD)
 * ------------------------------------------------------------------------------
 */

// GET ALL MOVIES (including inactive for admin review)
exports.getAdminMovies = async (req, res) => {
    try {
        const [movies] = await db.query("SELECT * FROM movies ORDER BY movie_id DESC");
        res.json(movies);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch movies" });
    }
};

// CREATE NEW MOVIE + AUTO-SCHEDULE SHOW + AUTO-GENERATE 20 SEATS
exports.createMovie = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { title, description, genre, language, duration, rating, poster_url, initial_price } = req.body;

        // Input validation
        if (!title || !genre || !language || !duration) {
            return res.status(400).json({ message: "Title, genre, language, and duration are required" });
        }

        // Use transaction so if seat generation fails, the movie is not left half-created
        await connection.beginTransaction();

        // 1. Insert movie record
        const [result] = await connection.query(
            `INSERT INTO movies 
            (title, description, genre, language, duration, rating, poster_url, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`,
            [title, description || "", genre, language, duration, rating || 0.0, poster_url || ""]
        );
        const movieId = result.insertId;

        // 2. Automatically schedule an initial showtime for tomorrow at 6:30 PM
        // This ensures the movie is IMMEDIATELY bookable by users on the frontend!
        const price = Number(initial_price) || 280.00;
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(18, 30, 0, 0);

        const [showResult] = await connection.query(
            "INSERT INTO shows (movie_id, screen_name, show_datetime, ticket_price) VALUES (?, 'Audi 1 - Main', ?, ?)",
            [movieId, tomorrow, price]
        );
        const showId = showResult.insertId;

        // 3. Auto-generate 20 bookable seats (Rows A, B, C, D with 5 seats each = A1 to D5)
        const rows = ['A', 'B', 'C', 'D'];
        const seatValues = [];
        for (const r of rows) {
            for (let num = 1; num <= 5; num++) {
                seatValues.push([showId, null, r, num, `${r}${num}`, 'AVAILABLE']);
            }
        }

        await connection.query(
            "INSERT INTO seats (show_id, event_id, row_name, seat_number, seat_label, status) VALUES ?",
            [seatValues]
        );

        // Commit transaction
        await connection.commit();

        res.status(201).json({
            message: "🎉 Movie created & showtime scheduled with 20 bookable seats!",
            movie_id: movieId
        });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: "Failed to create movie" });
    } finally {
        connection.release();
    }
};

// UPDATE MOVIE DETAILS
exports.updateMovie = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, genre, language, duration, rating, poster_url, status } = req.body;

        await db.query(
            `UPDATE movies SET 
            title=?, description=?, genre=?, language=?, duration=?, rating=?, poster_url=?, status=?
            WHERE movie_id=?`,
            [title, description, genre, language, duration, rating, poster_url, status || 'ACTIVE', id]
        );

        res.json({ message: "Movie updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to update movie" });
    }
};

// DEACTIVATE MOVIE (SOFT-DELETE)
// Viva Note: We set status = 'INACTIVE' instead of running `DELETE FROM movies`.
// This preserves past booking history and avoids foreign key constraint errors!
exports.deleteMovie = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("UPDATE movies SET status = 'INACTIVE' WHERE movie_id = ?", [id]);
        res.json({ message: "Movie deactivated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete movie" });
    }
};

/**
 * ------------------------------------------------------------------------------
 * 3. EVENT MANAGEMENT (CRUD)
 * ------------------------------------------------------------------------------
 */

// GET ALL EVENTS
exports.getAdminEvents = async (req, res) => {
    try {
        const [events] = await db.query("SELECT * FROM events ORDER BY event_id DESC");
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch events" });
    }
};

// CREATE NEW EVENT
exports.createEvent = async (req, res) => {
    try {
        const { title, description, category, venue, event_date, ticket_price, poster_url } = req.body;
        if (!title || !category || !venue || !event_date || !ticket_price) {
            return res.status(400).json({ message: "All event details are required" });
        }

        const [result] = await db.query(
            `INSERT INTO events 
            (title, description, category, venue, event_date, ticket_price, poster_url, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`,
            [title, description || "", category, venue, event_date, ticket_price, poster_url || ""]
        );

        res.status(201).json({ message: "Event created successfully", event_id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to create event" });
    }
};

// UPDATE EVENT
exports.updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, category, venue, event_date, ticket_price, poster_url, status } = req.body;

        await db.query(
            `UPDATE events SET 
            title=?, description=?, category=?, venue=?, event_date=?, ticket_price=?, poster_url=?, status=?
            WHERE event_id=?`,
            [title, description, category, venue, event_date, ticket_price, poster_url, status || 'ACTIVE', id]
        );

        res.json({ message: "Event updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to update event" });
    }
};

// DEACTIVATE EVENT (SOFT-DELETE)
exports.deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("UPDATE events SET status = 'INACTIVE' WHERE event_id = ?", [id]);
        res.json({ message: "Event deactivated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete event" });
    }
};

/**
 * ------------------------------------------------------------------------------
 * 4. SCHEDULE SHOW & AUTO-GENERATE SEATS
 * Endpoint: POST /api/admin/shows
 * ------------------------------------------------------------------------------
 */
exports.createShow = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { movie_id, screen_name, show_datetime, ticket_price } = req.body;
        if (!movie_id || !show_datetime || !ticket_price) {
            return res.status(400).json({ message: "Movie, showtime, and price are required" });
        }

        await connection.beginTransaction();

        // 1. Insert new showtime into `shows` table
        const [showResult] = await connection.query(
            "INSERT INTO shows (movie_id, screen_name, show_datetime, ticket_price) VALUES (?, ?, ?, ?)",
            [movie_id, screen_name || 'Audi 1', show_datetime, ticket_price]
        );
        const showId = showResult.insertId;

        // 2. Generate 20 Seats (Rows A-D, seats 1-5) for this specific showtime
        const rows = ['A', 'B', 'C', 'D'];
        const seatValues = [];
        for (const r of rows) {
            for (let num = 1; num <= 5; num++) {
                seatValues.push([showId, r, num, `${r}${num}`, 'AVAILABLE']);
            }
        }

        await connection.query(
            "INSERT INTO seats (show_id, row_name, seat_number, seat_label, status) VALUES ?",
            [seatValues]
        );

        await connection.commit();

        res.status(201).json({
            message: "Show scheduled and 20 seats generated successfully!",
            show_id: showId
        });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: "Failed to schedule show" });
    } finally {
        connection.release();
    }
};

/**
 * ------------------------------------------------------------------------------
 * 5. ALL BOOKINGS AUDIT
 * Endpoint: GET /api/admin/bookings
 * ------------------------------------------------------------------------------
 */
exports.getAllBookings = async (req, res) => {
    try {
        // Joins bookings with customer details and title of movie or event
        const [bookings] = await db.query(
            `SELECT 
                b.booking_id,
                b.booking_date,
                b.total_amount,
                b.status,
                u.full_name AS customer_name,
                u.email AS customer_email,
                COALESCE(m.title, e.title) AS title
            FROM bookings b
            JOIN users u ON b.user_id = u.user_id
            LEFT JOIN shows s ON b.show_id = s.show_id
            LEFT JOIN movies m ON s.movie_id = m.movie_id
            LEFT JOIN events e ON b.event_id = e.event_id
            ORDER BY b.booking_date DESC`
        );
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch bookings list" });
    }
};

/**
 * ------------------------------------------------------------------------------
 * 6. USER DIRECTORY
 * Endpoint: GET /api/admin/users
 * ------------------------------------------------------------------------------
 */
exports.getAllUsers = async (req, res) => {
    try {
        // Excludes hashed passwords for clean user auditing
        const [users] = await db.query(
            "SELECT user_id, full_name, email, phone, role, created_at FROM users ORDER BY user_id DESC"
        );
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch users" });
    }
};
