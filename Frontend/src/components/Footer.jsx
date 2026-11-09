// ==============================================================================
// 📄 GLOBAL FOOTER COMPONENT (Footer.jsx)
// ==============================================================================
// PURPOSE:
// Displayed at the bottom of every page in the CineBook application.
// Provides brand reinforcement, platform navigation links, and dynamic copyright year.
// ==============================================================================

import { Link } from "react-router-dom";

function Footer() {
    return (
        <footer className="footer text-center text-white">
            <div className="container py-4">
                {/* Brand Name */}
                <h4 className="fw-bold mb-2">🎬 CineBook</h4>
                <p className="text-secondary small mb-3">
                    Your one-stop destination for movies, screenings, and live events.
                </p>

                {/* Footer Navigation Links */}
                <div className="d-flex justify-content-center gap-3 mb-3 small">
                    <Link to="/" className="text-secondary text-decoration-none">Home</Link>
                    <Link to="/movies" className="text-secondary text-decoration-none">Movies</Link>
                    <Link to="/events" className="text-secondary text-decoration-none">Events</Link>
                    <Link to="/about" className="text-secondary text-decoration-none">About</Link>
                    <Link to="/contact" className="text-secondary text-decoration-none">Contact</Link>
                </div>

                {/* Dynamic Copyright (always reflects current calendar year) */}
                <p className="mb-0 text-muted small">
                    © {new Date().getFullYear()} CineBook Inc. Built with React 19, Express, and MySQL.
                </p>
            </div>
        </footer>
    );
}

export default Footer;