// ==============================================================================
// 🧭 APPLICATION ROUTING & LAYOUT (App.jsx)
// ==============================================================================
// PURPOSE:
// This is the primary component that orchestrates client-side routing for CineBook.
// It uses `react-router-dom` to create a Single Page Application (SPA).
//
// SPA CONCEPT FOR VIVA:
// Unlike traditional websites where clicking a link reloads the entire page from the server,
// React Router intercepts URL changes in the browser and swaps the active page component
// instantly without any white screen flashes or browser reloads.
// ==============================================================================

import { BrowserRouter, Routes, Route } from "react-router-dom";

// Global Layout Components (rendered on every single page)
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Page Views
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Movies from "./pages/Movies";
import MovieDetails from "./pages/MovieDetails";
import Events from "./pages/Events";
import SeatSelection from "./pages/SeatSelection";
import MyBookings from "./pages/MyBookings";
import AdminDashboard from "./pages/AdminDashboard";
import About from "./pages/About";
import Contact from "./pages/Contact";

function App() {
    return (
        // BrowserRouter connects our React app to the browser's address bar history
        <BrowserRouter>
            {/* Top Navigation Bar: Displays logo, links, dynamic user greeting, and logout */}
            <Navbar />

            {/* Routes: Evaluates the current URL and renders the first matching <Route /> */}
            <Routes>
                {/* 1. Homepage: Hero banner, trending movies, recommended screenings */}
                <Route path="/" element={<Home />} />

                {/* 2. Authentication Pages */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* 3. Movie Catalog & Details */}
                <Route path="/movies" element={<Movies />} />
                {/* `:id` is a dynamic route parameter captured via useParams() */}
                <Route path="/movies/:id" element={<MovieDetails />} />

                {/* 4. Live Events Catalog (Concerts, Standup Comedy) */}
                <Route path="/events" element={<Events />} />

                {/* 5. Interactive Seat Matrices */}
                {/* Movie show seat selection */}
                <Route path="/seats/:showId" element={<SeatSelection />} />
                {/* Event seat selection with `isEvent={true}` prop */}
                <Route path="/event-seats/:eventId" element={<SeatSelection isEvent={true} />} />

                {/* 6. Customer Ticket History */}
                <Route path="/my-bookings" element={<MyBookings />} />

                {/* 7. Administrator Management Center */}
                <Route path="/admin" element={<AdminDashboard />} />

                {/* 8. Static Informational Pages */}
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
            </Routes>

            {/* Bottom Footer: Copyright, platform links, and developer attribution */}
            <Footer />
        </BrowserRouter>
    );
}

export default App;