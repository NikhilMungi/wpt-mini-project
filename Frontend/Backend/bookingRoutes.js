// ==============================================================================
// 🎟️ BOOKING & SEAT ROUTES (bookingRoutes.js)
// ==============================================================================
// PURPOSE:
// This router manages all seat availability checks, ticket reservations,
// booking history lookups, and reservation cancellations.
// Mounted in Server.js at `/api/bookings`.
// ==============================================================================

const express = require("express");
const router = express.Router();

// Import authentication middleware so protected routes can identify the logged-in user
const verifyToken = require("./authMiddleware");

// Import booking operations from bookingController.js
const {
    getSeatsByShow,
    getSeatsByEvent,
    createBooking,
    getMyBookings,
    cancelBooking
} = require("./bookingController");

// ------------------------------------------------------------------------------
// PUBLIC ROUTES (No login required - guests can preview seat matrices)
// ------------------------------------------------------------------------------

// GET /api/bookings/shows/:showId/seats
// Returns 20 seats (A1-D5) with their real-time status (AVAILABLE or BOOKED) for a movie show
router.get("/shows/:showId/seats", getSeatsByShow);

// GET /api/bookings/events/:eventId/seats
// Returns 20 seats with status for a live event (concert/comedy gig)
router.get("/events/:eventId/seats", getSeatsByEvent);


// ------------------------------------------------------------------------------
// PROTECTED ROUTES (Login required - user must send valid JWT Bearer token)
// ------------------------------------------------------------------------------

// POST /api/bookings
// Reserves selected seats using atomic database transactions (prevents double-booking)
router.post("/", verifyToken, createBooking);

// GET /api/bookings/my-bookings
// Fetches all past and active tickets reserved by the currently logged-in user
router.get("/my-bookings", verifyToken, getMyBookings);

// PUT /api/bookings/:id/cancel
// Cancels a specific confirmed booking and releases its seats back to 'AVAILABLE'
router.put("/:id/cancel", verifyToken, cancelBooking);

// Export router to be mounted in Server.js
module.exports = router;