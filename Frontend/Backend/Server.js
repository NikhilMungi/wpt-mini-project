// const express = require("express");
// const cors = require("cors");
// require("dotenv").config();

// const app = express();

// app.use(cors({
//     origin: "http://localhost:5173"
// }));

// app.use(express.json());

// // Test API
// app.get("/", (req, res) => {
//     res.send("CineBook Backend is Running!");
// });

// // Movies API
// app.get("/api/movies", (req, res) => {
//     res.json([]);
// });

// // Events API
// app.get("/api/events", (req, res) => {
//     res.json([]);
// });

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//     console.log(`CineBook Server running on port ${PORT}`);
// });
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");
const authRoutes = require("./authRoutes");
const bookingRoutes = require("./bookingRoutes");

const app = express();

app.use(cors({
    origin: "http://localhost:5173"
}));

app.use(express.json());

// Test backend
app.get("/", (req, res) => {
    res.send("CineBook Backend is Running!");
});

// Test MySQL connection
app.get("/api/db-test", async (req, res) => {
    try {
        const [result] = await db.query("SELECT 1 AS connected");

        res.json({
            message: "MySQL connected successfully",
            result
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "MySQL connection failed"
        });
    }
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);

// Movies route
app.get("/api/movies", async (req, res) => {
    try {
        const [movies] = await db.query(
            "SELECT * FROM movies WHERE status = 'ACTIVE'"
        );

        res.json(movies);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Unable to fetch movies"
        });
    }
});

// Events route
app.get("/api/events", async (req, res) => {
    try {
        const [events] = await db.query(
            "SELECT * FROM events WHERE status = 'ACTIVE'"
        );

        res.json(events);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Unable to fetch events"
        });
    }
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`CineBook Server running on port ${PORT}`);
});