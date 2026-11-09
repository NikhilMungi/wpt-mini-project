// ==============================================================================
// 🧭 GLOBAL NAVIGATION BAR (Navbar.jsx)
// ==============================================================================
// PURPOSE:
// The Navbar is pinned to the top of every screen (`sticky-top`).
// It provides:
// 1. Brand logo linking back to the Homepage.
// 2. Navigation links with dynamic active indicators (`nav-link active`).
// 3. Conditional rendering based on authentication state:
//    - Guest: Displays "Login" and "Register" buttons.
//    - Logged-in User: Displays personal greeting, "My Bookings" ticket link, and Logout.
//    - Admin: Displays privileged "⚙️ Admin Panel" shortcut.
// ==============================================================================

import { Link, useLocation, useNavigate } from "react-router-dom";

function Navbar() {
    // Hook to redirect users programmatically (e.g. redirecting to /login after logout)
    const navigate = useNavigate();

    // Hook providing real-time URL path information (e.g. "/movies", "/admin")
    const location = useLocation();

    // --------------------------------------------------------------------------
    // SESSION STATE RETRIEVAL
    // --------------------------------------------------------------------------
    // We retrieve the stored token and serialized user JSON from the browser's localStorage
    const token = localStorage.getItem("cinebookToken");
    const userStr = localStorage.getItem("cinebookUser");
    const user = userStr ? JSON.parse(userStr) : null;

    // --------------------------------------------------------------------------
    // LOGOUT HANDLER
    // --------------------------------------------------------------------------
    const handleLogout = () => {
        // Clear all session credentials from browser storage
        localStorage.removeItem("cinebookToken");
        localStorage.removeItem("cinebookUser");
        alert("Logged out successfully");
        // Redirect user to the login screen
        navigate("/login");
    };

    // Helper function: returns true if the link matches the current active browser path
    const isActive = (path) => location.pathname === path;

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
            <div className="container">
                {/* Brand Logo */}
                <Link className="navbar-brand" to="/">
                    🎬 CineBook
                </Link>

                {/* Mobile Hamburger Toggle Button (Bootstrap 5) */}
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarMenu"
                    aria-controls="navbarMenu"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Collapsible Navigation Menu */}
                <div className="collapse navbar-collapse" id="navbarMenu">
                    <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
                        {/* 1. Home Link */}
                        <li className="nav-item">
                            <Link className={`nav-link ${isActive("/") ? "active" : ""}`} to="/">
                                Home
                            </Link>
                        </li>

                        {/* 2. Movies Catalog Link */}
                        <li className="nav-item">
                            <Link className={`nav-link ${isActive("/movies") ? "active" : ""}`} to="/movies">
                                Movies
                            </Link>
                        </li>

                        {/* 3. Live Events Link */}
                        <li className="nav-item">
                            <Link className={`nav-link ${isActive("/events") ? "active" : ""}`} to="/events">
                                Events
                            </Link>
                        </li>

                        {/* 4. About Us Link */}
                        <li className="nav-item">
                            <Link className={`nav-link ${isActive("/about") ? "active" : ""}`} to="/about">
                                About
                            </Link>
                        </li>

                        {/* 5. Contact Us Link */}
                        <li className="nav-item">
                            <Link className={`nav-link ${isActive("/contact") ? "active" : ""}`} to="/contact">
                                Contact
                            </Link>
                        </li>

                        {/* CONDITIONAL ITEM: Show My Bookings ONLY if user is logged in */}
                        {user && (
                            <li className="nav-item">
                                <Link
                                    className={`nav-link text-warning fw-semibold ${isActive("/my-bookings") ? "active" : ""}`}
                                    to="/my-bookings"
                                >
                                    🎟️ My Bookings
                                </Link>
                            </li>
                        )}

                        {/* CONDITIONAL ITEM: Show Admin Panel ONLY if user has role = 'ADMIN' */}
                        {user && user.role === "ADMIN" && (
                            <li className="nav-item">
                                <Link
                                    className={`nav-link text-info fw-bold ${isActive("/admin") ? "active" : ""}`}
                                    to="/admin"
                                >
                                    ⚙️ Admin Panel
                                </Link>
                            </li>
                        )}
                    </ul>

                    {/* AUTHENTICATION ACTION BUTTONS */}
                    <div className="d-flex align-items-center gap-2 ms-lg-3 mt-2 mt-lg-0">
                        {user ? (
                            // LOGGED IN VIEW: Show customer name & Logout button
                            <>
                                <span className="text-light me-1 small">
                                    Hi, <strong>{user.full_name}</strong>
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="btn btn-outline-danger btn-sm"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            // GUEST VIEW: Show Login and Register buttons
                            <>
                                <Link to="/login" className="btn btn-outline-light btn-sm">
                                    Login
                                </Link>
                                <Link to="/register" className="btn btn-danger btn-sm">
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;