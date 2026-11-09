// ==============================================================================
// 🎟️ BOOKING CONTROLLER (bookingController.js)
// ==============================================================================
// PURPOSE:
// This is the core operational engine of the CineBook ticketing system.
// It handles:
// 1. getSeatsByShow: Retrieves all 20 seats for a movie screening (auto-populates if missing).
// 2. getSeatsByEvent: Retrieves all 20 seats for a live event (auto-populates if missing).
// 3. createBooking: Transaction-safe ticket reservation preventing double bookings.
// 4. getMyBookings: Fetches the authenticated user's order history with joined seat numbers.
// 5. cancelBooking: Releases reserved seats back to 'AVAILABLE' in an atomic transaction.
// ==============================================================================

const db = require("./config/db");

/**
 * ------------------------------------------------------------------------------
 * 1. GET SEATS FOR A MOVIE SHOW
 * Endpoint: GET /api/bookings/shows/:showId/seats
 * ------------------------------------------------------------------------------
 */
exports.getSeatsByShow = async (req, res) => {
    try {
        // Step 1: Read showId from URL parameter (:showId)
        const { showId } = req.params;

        // Step 2: Confirm that the show actually exists in our database
        const [shows] = await db.query(
            "SELECT ticket_price FROM shows WHERE show_id = ?",
            [showId]
        );

        if (shows.length === 0) {
            return res.status(404).json({ message: "Show not found" });
        }

        // Step 3: Fetch all existing seats configured for this show
        let [seats] = await db.query(
            "SELECT seat_id, show_id, row_name, seat_number, seat_label, status FROM seats WHERE show_id = ? ORDER BY row_name, seat_number",
            [showId]
        );

        // Step 4: AUTO-GENERATION SAFETY MECHANISM
        // If an admin created a show manually without initializing seats,
        // we automatically generate a standardized 4-row x 5-column grid (Rows A-D, seats 1-5 = 20 seats)
        // so that users never see an empty seat matrix!
        if (seats.length === 0) {
            const rows = ['A', 'B', 'C', 'D'];
            const seatValues = [];
            for (const r of rows) {
                for (let num = 1; num <= 5; num++) {
                    // [show_id, event_id, row_name, seat_number, seat_label, status]
                    seatValues.push([showId, null, r, num, `${r}${num}`, 'AVAILABLE']);
                }
            }

            // Bulk INSERT all 20 seats in a single SQL operation
            await db.query(
                "INSERT INTO seats (show_id, event_id, row_name, seat_number, seat_label, status) VALUES ?",
                [seatValues]
            );

            // Re-fetch the freshly generated seats to send to the browser
            [seats] = await db.query(
                "SELECT seat_id, show_id, row_name, seat_number, seat_label, status FROM seats WHERE show_id = ? ORDER BY row_name, seat_number",
                [showId]
            );
        }

        // Return the ticket price and the array of 20 seat objects
        res.json({
            ticket_price: shows[0].ticket_price,
            seats: seats
        });

    } catch (error) {
        console.error("Error fetching seats:", error);
        res.status(500).json({ message: "Unable to load seats" });
    }
};

/**
 * ------------------------------------------------------------------------------
 * 2. GET SEATS FOR A LIVE CONCERT / EVENT
 * Endpoint: GET /api/bookings/events/:eventId/seats
 * ------------------------------------------------------------------------------
 */
exports.getSeatsByEvent = async (req, res) => {
    try {
        const { eventId } = req.params;

        // Verify the event exists and is currently ACTIVE
        const [events] = await db.query(
            "SELECT title, ticket_price, venue FROM events WHERE event_id = ? AND status = 'ACTIVE'",
            [eventId]
        );

        if (events.length === 0) {
            return res.status(404).json({ message: "Event not found" });
        }

        let [seats] = await db.query(
            "SELECT seat_id, event_id, row_name, seat_number, seat_label, status FROM seats WHERE event_id = ? ORDER BY row_name, seat_number",
            [eventId]
        );

        // Auto-generate 20 seats if none exist yet for this event
        if (seats.length === 0) {
            const rows = ['A', 'B', 'C', 'D'];
            const seatValues = [];
            for (const r of rows) {
                for (let num = 1; num <= 5; num++) {
                    seatValues.push([null, eventId, r, num, `${r}${num}`, 'AVAILABLE']);
                }
            }

            await db.query(
                "INSERT INTO seats (show_id, event_id, row_name, seat_number, seat_label, status) VALUES ?",
                [seatValues]
            );

            [seats] = await db.query(
                "SELECT seat_id, event_id, row_name, seat_number, seat_label, status FROM seats WHERE event_id = ? ORDER BY row_name, seat_number",
                [eventId]
            );
        }

        res.json({
            title: events[0].title,
            venue: events[0].venue,
            ticket_price: events[0].ticket_price,
            seats: seats
        });

    } catch (error) {
        console.error("Error fetching event seats:", error);
        res.status(500).json({ message: "Unable to load event seats" });
    }
};

/**
 * ------------------------------------------------------------------------------
 * 3. CREATE BOOKING (TRANSACTION SAFE - PREVENTS DOUBLE BOOKING)
 * Endpoint: POST /api/bookings
 * ------------------------------------------------------------------------------
 * VIVA DEFENSE TIP:
 * Why do we use `connection.beginTransaction()`?
 * If User A and User B select seat A1 at the exact same millisecond:
 * 1. The transaction locks the rows.
 * 2. It verifies all chosen seats have status = 'AVAILABLE'.
 * 3. If even 1 seat was already grabbed, `connection.rollback()` cancels everything!
 * 4. Only if all seats are free does `connection.commit()` permanently lock them.
 * This guarantees the ACID principle of Atomicity (all-or-nothing).
 * ------------------------------------------------------------------------------
 */
exports.createBooking = async (req, res) => {
    // Borrow a dedicated single connection from the pool so we can control the transaction
    const connection = await db.getConnection();
    try {
        // Authenticated user ID injected by authMiddleware.js
        const userId = req.user.user_id;
        // Destructure show/event ID and array of selected seat IDs e.g. [1, 2]
        const { show_id, event_id, seat_ids } = req.body;

        if (!seat_ids || !Array.isArray(seat_ids) || seat_ids.length === 0) {
            return res.status(400).json({ message: "Please select at least one seat before booking" });
        }

        // START DATABASE TRANSACTION
        await connection.beginTransaction();

        let ticketPrice = 0;

        // ----------------------------------------------------------------------
        // BRANCH A: Event Ticket Reservation
        // ----------------------------------------------------------------------
        if (event_id) {
            const [events] = await connection.query(
                "SELECT ticket_price FROM events WHERE event_id = ? AND status = 'ACTIVE'",
                [event_id]
            );

            if (events.length === 0) {
                await connection.rollback();
                return res.status(404).json({ message: "Event not found" });
            }

            ticketPrice = Number(events[0].ticket_price);

            // CRITICAL CHECK: Verify every requested seat is currently AVAILABLE
            const [availableSeats] = await connection.query(
                "SELECT seat_id FROM seats WHERE seat_id IN (?) AND event_id = ? AND status = 'AVAILABLE'",
                [seat_ids, event_id]
            );

            // If the count of available seats does NOT match requested count, someone else booked it!
            if (availableSeats.length !== seat_ids.length) {
                await connection.rollback(); // Cancel and undo
                return res.status(400).json({ message: "One or more selected seats were just taken. Please select different seats." });
            }

            // Calculate total price: Price per ticket * Number of seats
            const totalAmount = ticketPrice * seat_ids.length;

            // 1. Insert master record into `bookings` table
            const [bookingResult] = await connection.query(
                "INSERT INTO bookings (user_id, event_id, total_amount, status) VALUES (?, ?, ?, 'CONFIRMED')",
                [userId, event_id, totalAmount]
            );
            const bookingId = bookingResult.insertId;

            // 2. Link each seat to the booking in `booking_seats` bridge table
            const seatValues = seat_ids.map(seatId => [bookingId, seatId]);
            await connection.query(
                "INSERT INTO booking_seats (booking_id, seat_id) VALUES ?",
                [seatValues]
            );

            // 3. Mark the seats as 'BOOKED' so no one else can purchase them
            await connection.query(
                "UPDATE seats SET status = 'BOOKED' WHERE seat_id IN (?)",
                [seat_ids]
            );

            // All steps succeeded! COMMIT the transaction to make changes permanent in MySQL
            await connection.commit();

            return res.status(201).json({
                message: "🎉 Event seats booked successfully!",
                booking_id: bookingId
            });
        }

        // ----------------------------------------------------------------------
        // BRANCH B: Movie Ticket Reservation
        // ----------------------------------------------------------------------
        if (!show_id) {
            await connection.rollback();
            return res.status(400).json({ message: "Show or event reference is required" });
        }

        const [shows] = await connection.query(
            "SELECT ticket_price FROM shows WHERE show_id = ?",
            [show_id]
        );

        if (shows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Show not found" });
        }

        ticketPrice = Number(shows[0].ticket_price);
        const totalAmount = ticketPrice * seat_ids.length;

        // Check availability of chosen seats for this movie show
        const [availableSeats] = await connection.query(
            "SELECT seat_id FROM seats WHERE seat_id IN (?) AND show_id = ? AND status = 'AVAILABLE'",
            [seat_ids, show_id]
        );

        if (availableSeats.length !== seat_ids.length) {
            await connection.rollback();
            return res.status(400).json({ message: "One or more selected seats are no longer available. Please choose other seats." });
        }

        // 1. Insert master booking record
        const [bookingResult] = await connection.query(
            "INSERT INTO bookings (user_id, show_id, total_amount, status) VALUES (?, ?, ?, 'CONFIRMED')",
            [userId, show_id, totalAmount]
        );
        const bookingId = bookingResult.insertId;

        // 2. Link each seat to booking in `booking_seats`
        const seatValues = seat_ids.map(seatId => [bookingId, seatId]);
        await connection.query(
            "INSERT INTO booking_seats (booking_id, seat_id) VALUES ?",
            [seatValues]
        );

        // 3. Lock seats to 'BOOKED'
        await connection.query(
            "UPDATE seats SET status = 'BOOKED' WHERE seat_id IN (?)",
            [seat_ids]
        );

        // Commit transaction
        await connection.commit();

        res.status(201).json({
            message: "🎉 Movie booking confirmed successfully!",
            booking_id: bookingId
        });

    } catch (error) {
        // If anything fails during execution, rollback all changes
        await connection.rollback();
        console.error("Booking error:", error);
        res.status(500).json({ message: "Booking transaction failed. Please try again." });
    } finally {
        // ALWAYS release the connection back to the connection pool
        connection.release();
    }
};

/**
 * ------------------------------------------------------------------------------
 * 4. GET LOGGED-IN USER'S BOOKING HISTORY
 * Endpoint: GET /api/bookings/my-bookings
 * ------------------------------------------------------------------------------
 */
exports.getMyBookings = async (req, res) => {
    try {
        const userId = req.user.user_id;

        // SQL Explanation for Viva:
        // - `COALESCE(m.title, e.title)` picks movie title if it exists, otherwise event title.
        // - `GROUP_CONCAT(st.seat_label ...)` aggregates multiple seat rows (e.g. A1, A2) into one string.
        // - `LEFT JOIN` ensures bookings display even if movie or event metadata changes.
        const [bookings] = await db.query(
            `SELECT
                b.booking_id,
                b.booking_date,
                b.total_amount,
                b.status,
                COALESCE(m.title, e.title) AS title,
                CASE 
                    WHEN e.event_id IS NOT NULL THEN 'Event'
                    ELSE 'Movie'
                END AS type,
                GROUP_CONCAT(st.seat_label ORDER BY st.seat_label SEPARATOR ', ') AS seats
            FROM bookings b
            LEFT JOIN shows s ON b.show_id = s.show_id
            LEFT JOIN movies m ON s.movie_id = m.movie_id
            LEFT JOIN events e ON b.event_id = e.event_id
            LEFT JOIN booking_seats bs ON b.booking_id = bs.booking_id
            LEFT JOIN seats st ON bs.seat_id = st.seat_id
            WHERE b.user_id = ?
            GROUP BY b.booking_id
            ORDER BY b.booking_date DESC`,
            [userId]
        );

        res.json(bookings);

    } catch (error) {
        console.error("Booking fetch error:", error);
        res.status(500).json({ message: "Unable to fetch booking history" });
    }
};

/**
 * ------------------------------------------------------------------------------
 * 5. CANCEL BOOKING & RELEASE SEATS
 * Endpoint: PUT /api/bookings/:id/cancel
 * ------------------------------------------------------------------------------
 */
exports.cancelBooking = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const userId = req.user.user_id;
        const bookingId = req.params.id;

        // Security check: Verify that this booking actually belongs to the requesting user!
        const [bookings] = await connection.query(
            "SELECT * FROM bookings WHERE booking_id = ? AND user_id = ?",
            [bookingId, userId]
        );

        if (bookings.length === 0) {
            return res.status(404).json({ message: "Booking not found or does not belong to you" });
        }

        if (bookings[0].status === "CANCELLED") {
            return res.status(400).json({ message: "This booking has already been cancelled" });
        }

        // Start transaction for atomic cancellation and seat release
        await connection.beginTransaction();

        // 1. Update the booking status to CANCELLED
        await connection.query(
            "UPDATE bookings SET status = 'CANCELLED' WHERE booking_id = ?",
            [bookingId]
        );

        // 2. Free up the reserved seats by setting status back to 'AVAILABLE'
        await connection.query(
            `UPDATE seats SET status = 'AVAILABLE' 
             WHERE seat_id IN (SELECT seat_id FROM booking_seats WHERE booking_id = ?)`,
            [bookingId]
        );

        // Commit transaction
        await connection.commit();

        res.json({ message: "Booking cancelled successfully and seats released back to available" });

    } catch (error) {
        await connection.rollback();
        console.error("Cancel error:", error);
        res.status(500).json({ message: "Unable to process booking cancellation" });
    } finally {
        connection.release();
    }
};