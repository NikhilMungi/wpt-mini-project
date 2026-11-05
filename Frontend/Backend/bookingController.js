const db = require("../config/db");

exports.getMyBookings = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const [bookings] = await db.query(
            `SELECT
                b.booking_id,
                b.booking_date,
                b.total_amount,
                b.status,
                COALESCE(m.title, e.title) AS title
            FROM bookings b
            LEFT JOIN shows s ON b.show_id = s.show_id
            LEFT JOIN movies m ON s.movie_id = m.movie_id
            LEFT JOIN events e ON b.event_id = e.event_id
            WHERE b.user_id = ?
            ORDER BY b.booking_date DESC`,
            [userId]
        );

        res.json(bookings);

    } catch (error) {
        console.error("Booking fetch error:", error);

        res.status(500).json({
            message: "Unable to fetch bookings"
        });
    }
};