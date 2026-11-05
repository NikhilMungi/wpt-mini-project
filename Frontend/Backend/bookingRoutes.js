const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const {
    getMyBookings
} = require("../controllers/bookingController");

router.get("/my-bookings", verifyToken, getMyBookings);

module.exports = router;