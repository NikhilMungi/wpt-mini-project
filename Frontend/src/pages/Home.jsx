// ==============================================================================
// 🏠 HOMEPAGE COMPONENT (Home.jsx)
// ==============================================================================
// PURPOSE:
// This is the main landing page of CineBook.
// It features:
// 1. Hero Section: High-impact banner with calls-to-action ("Explore Movies", "Browse Events").
// 2. 🔥 Recommended Movies Section: Displays top 4 featured movies with ratings and synopsis.
// 3. 🎟️ Recommended Shows Section: Displays upcoming movie screenings with exact showtimes,
//    screen names (e.g. "Audi 1 - IMAX"), ticket pricing, and direct "Book Seats" links.
// ==============================================================================

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Home() {
    // --------------------------------------------------------------------------
    // REACT STATE HOOKS (useState)
    // --------------------------------------------------------------------------
    // `movies`: Stores array of movie objects retrieved from GET /api/movies
    const [movies, setMovies] = useState([]);

    // `shows`: Stores array of scheduled screening objects from GET /api/shows/recommended
    const [shows, setShows] = useState([]);

    // Loading states: Controls whether to display a spinning loader while waiting for backend
    const [loadingMovies, setLoadingMovies] = useState(true);
    const [loadingShows, setLoadingShows] = useState(true);

    // Fallback poster image URL if a movie or show does not specify an image
    const defaultPoster = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500";

    // --------------------------------------------------------------------------
    // SIDE EFFECT HOOK (useEffect)
    // --------------------------------------------------------------------------
    // Runs automatically when the Homepage first mounts on screen.
    // The empty dependency array `[]` ensures it only triggers once.
    useEffect(() => {
        // 1. Fetch top movies from backend
        api.get("/movies")
            .then(res => {
                // Slice top 4 movies for a clean, non-cluttered showcase on the homepage
                setMovies(res.data.slice(0, 4));
            })
            .catch(err => {
                console.error("Home movies load failed", err);
            })
            .finally(() => {
                setLoadingMovies(false);
            });

        // 2. Fetch recommended upcoming showtimes
        api.get("/shows/recommended")
            .then(res => {
                setShows(res.data);
            })
            .catch(err => {
                console.error("Home shows load failed", err);
            })
            .finally(() => {
                setLoadingShows(false);
            });
    }, []);

    return (
        <>
            {/* ==================================================================
               1. HERO BANNER
               ================================================================== */}
            <section className="hero-section text-center text-white py-5">
                <div className="container py-4">
                    <h1 className="display-4 fw-bold mb-3">Book Your Next Experience</h1>
                    <p className="lead mb-4 text-light">
                        Discover top blockbusters, live concerts, and exclusive performances in your city.
                    </p>
                    <div className="d-flex justify-content-center gap-3">
                        <Link to="/movies" className="btn btn-danger btn-lg px-4">
                            Explore Movies
                        </Link>
                        <Link to="/events" className="btn btn-outline-light btn-lg px-4">
                            Browse Events
                        </Link>
                    </div>
                </div>
            </section>

            {/* ==================================================================
               2. RECOMMENDED MOVIES SECTION
               ================================================================== */}
            <section className="container py-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="section-title mb-0">🔥 Recommended Movies</h2>
                    <Link to="/movies" className="text-danger fw-bold text-decoration-none">
                        View All Movies &rarr;
                    </Link>
                </div>

                {/* Conditional Rendering: Show spinner while loading, else render grid */}
                {loadingMovies ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-danger" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted mt-2">Loading movies...</p>
                    </div>
                ) : (
                    <div className="row g-4">
                        {movies.map((movie) => (
                            <div className="col-md-6 col-lg-3" key={movie.movie_id}>
                                <div className="movie-card">
                                    <img
                                        src={movie.poster_url || defaultPoster}
                                        className="movie-poster"
                                        alt={movie.title}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = defaultPoster;
                                        }}
                                    />
                                    <div className="movie-card-content">
                                        <h5 title={movie.title}>{movie.title}</h5>
                                        <p className="text-secondary small mb-1">{movie.genre} | {movie.language}</p>
                                        <div className="d-flex justify-content-between align-items-center mt-auto pt-2">
                                            <span className="badge bg-warning text-dark">
                                                ⭐ {movie.rating || "N/A"}
                                            </span>
                                            <Link
                                                to={`/movies/${movie.movie_id}`}
                                                className="btn btn-outline-danger btn-sm"
                                            >
                                                Book Tickets
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* ==================================================================
               3. RECOMMENDED SHOWS & SCREENINGS SECTION
               ================================================================== */}
            <section className="container pb-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="section-title mb-1">🎟️ Recommended Shows & Screenings</h2>
                        <p className="text-muted mb-0 small">Upcoming showtimes with instant seat booking</p>
                    </div>
                    <Link to="/movies" className="text-danger fw-bold text-decoration-none">
                        Browse All Screenings &rarr;
                    </Link>
                </div>

                {loadingShows ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-danger" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted mt-2">Loading shows...</p>
                    </div>
                ) : shows.length === 0 ? (
                    <div className="alert alert-light text-center py-4 border rounded-3">
                        <p className="mb-0 text-muted">No scheduled shows at the moment. Check back soon!</p>
                    </div>
                ) : (
                    <div className="row g-4">
                        {shows.map((show) => {
                            // Format show datetime nicely for display
                            const dateObj = new Date(show.show_datetime);
                            const formattedDate = isNaN(dateObj.getTime())
                                ? show.show_datetime
                                : dateObj.toLocaleDateString("en-IN", {
                                      weekday: "short",
                                      month: "short",
                                      day: "numeric",
                                  });
                            const formattedTime = isNaN(dateObj.getTime())
                                ? ""
                                : dateObj.toLocaleTimeString("en-IN", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                  });

                            return (
                                <div className="col-md-6 col-lg-4" key={show.show_id}>
                                    <div
                                        className="card h-100 shadow-sm border-0 rounded-3 overflow-hidden d-flex flex-column"
                                        style={{ transition: "transform 0.2s ease, box-shadow 0.2s ease" }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = "translateY(-4px)";
                                            e.currentTarget.style.boxShadow = "0 10px 24px rgba(0,0,0,0.1)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = "translateY(0)";
                                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)";
                                        }}
                                    >
                                        <div className="row g-0 flex-grow-1">
                                            {/* Poster Thumbnail Column */}
                                            <div className="col-4">
                                                <img
                                                    src={show.poster_url || defaultPoster}
                                                    alt={show.movie_title}
                                                    className="img-fluid h-100 w-100"
                                                    style={{ objectFit: "cover", minHeight: "150px" }}
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = defaultPoster;
                                                    }}
                                                />
                                            </div>
                                            {/* Screening Details Column */}
                                            <div className="col-8">
                                                <div className="card-body p-3 d-flex flex-column h-100">
                                                    <div className="d-flex justify-content-between align-items-start mb-1">
                                                        <span className="badge bg-danger-subtle text-danger border border-danger-subtle small">
                                                            {show.screen_name || "Audi 1"}
                                                        </span>
                                                        <span className="fw-bold text-dark">
                                                            ₹{parseFloat(show.ticket_price).toFixed(0)}
                                                        </span>
                                                    </div>
                                                    <h6 className="card-title fw-bold text-truncate mb-1" title={show.movie_title}>
                                                        {show.movie_title}
                                                    </h6>
                                                    <p className="text-secondary small mb-2 text-truncate">
                                                        {show.genre} • {show.language}
                                                    </p>
                                                    <div className="mt-auto">
                                                        <div className="text-muted small mb-2 d-flex align-items-center gap-1">
                                                            <span>🕒 {formattedDate}</span>
                                                            {formattedTime && <span>• {formattedTime}</span>}
                                                        </div>
                                                        {/* Direct Instant Action: Opens seat matrix for this specific show */}
                                                        <Link
                                                            to={`/seats/${show.show_id}`}
                                                            className="btn btn-danger btn-sm w-100 fw-semibold"
                                                        >
                                                            Book Seats &rarr;
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </>
    );
}

export default Home;