// ==============================================================================
// 📽️ MOVIE DETAILS & SHOWTIME SELECTOR PAGE (MovieDetails.jsx)
// ==============================================================================
// PURPOSE:
// When a user clicks a movie from the homepage or catalog, this page loads.
// It displays:
// 1. High-resolution movie poster, title, genre, language, duration, and synopsis.
// 2. All available screening showtimes (Audi name, formatted date, time, and ticket price).
// 3. Direct links from each showtime badge into the interactive seat selection screen (`/seats/:showId`).
// ==============================================================================

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";

function MovieDetails() {
    // --------------------------------------------------------------------------
    // URL PARAMETER EXTRACTION
    // --------------------------------------------------------------------------
    // `useParams()` inspects the current URL (e.g. `/movies/3`) and extracts the `:id` parameter ("3")
    const { id } = useParams();

    // --------------------------------------------------------------------------
    // STATE HOOKS
    // --------------------------------------------------------------------------
    // `movie`: Holds the single movie metadata object from the database
    const [movie, setMovie] = useState(null);

    // `shows`: Holds an array of all upcoming scheduled screenings for this movie
    const [shows, setShows] = useState([]);

    // `loading`: Spinner visibility toggle
    const [loading, setLoading] = useState(true);

    // Fallback poster image URL
    const fallbackPoster = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600";

    // --------------------------------------------------------------------------
    // FETCH DETAILS & SHOWTIMES
    // --------------------------------------------------------------------------
    useEffect(() => {
        const fetchDetails = async () => {
            try {
                // Calls backend: `GET /api/movies/:id`
                const response = await api.get(`/movies/${id}`);
                setMovie(response.data.movie);
                setShows(response.data.shows || []);
            } catch (error) {
                console.error("Failed to load movie details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [id]); // Re-run effect if URL parameter `id` ever changes

    // --------------------------------------------------------------------------
    // LOADING SCREEN
    // --------------------------------------------------------------------------
    if (loading) {
        return (
            <div className="container py-5 text-center my-5">
                <div className="spinner-border text-danger" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted mt-2">Loading movie details & showtimes...</p>
            </div>
        );
    }

    // --------------------------------------------------------------------------
    // 404 NOT FOUND FALLBACK
    // --------------------------------------------------------------------------
    if (!movie) {
        return (
            <div className="container py-5 text-center">
                <div className="alert alert-warning">Movie not found or has been deactivated.</div>
                <Link to="/movies" className="btn btn-danger mt-2">Back to Movies</Link>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="row g-5 align-items-start">
                {/* Left Column: Movie Poster */}
                <div className="col-md-4 text-center text-md-start">
                    <img
                        src={movie.poster_url || fallbackPoster}
                        alt={movie.title}
                        className="details-poster img-fluid w-100"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = fallbackPoster;
                        }}
                    />
                </div>

                {/* Right Column: Metadata & Showtimes */}
                <div className="col-md-8">
                    {/* Movie Title */}
                    <h1 className="fw-bold text-dark mb-2">{movie.title}</h1>

                    {/* Metadata Badges */}
                    <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
                        <span className="badge bg-danger">{movie.genre}</span>
                        <span className="badge bg-secondary">{movie.language}</span>
                        <span className="text-muted small">⏱️ {movie.duration} minutes</span>
                        <span className="text-warning fw-bold small ms-2">⭐ {movie.rating || "Not rated"}</span>
                    </div>

                    <hr className="my-4" />

                    {/* Synopsis */}
                    <h4 className="fw-bold mb-2">About Movie</h4>
                    <p className="text-secondary lead fs-6 mb-4" style={{ lineHeight: "1.7" }}>
                        {movie.description || "No synopsis available for this movie."}
                    </p>

                    {/* Available Showtimes Section */}
                    <h4 className="fw-bold mb-3">Available Shows</h4>

                    {shows.length === 0 ? (
                        <p className="text-muted">No scheduled shows currently available for this title.</p>
                    ) : (
                        <div className="d-flex flex-wrap gap-3">
                            {/* Render a clickable booking card for each scheduled screening */}
                            {shows.map(show => {
                                const showDate = new Date(show.show_datetime);
                                return (
                                    <Link
                                        key={show.show_id}
                                        to={`/seats/${show.show_id}`}
                                        className="btn btn-outline-danger p-3 text-start shadow-sm"
                                        style={{ minWidth: "180px", borderRadius: "10px" }}
                                    >
                                        {/* Show Time (e.g. "06:30 PM") */}
                                        <div className="fw-bold">
                                            {showDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        {/* Screen Name & Date (e.g. "Audi 1 • Nov 10") */}
                                        <small className="text-muted d-block">
                                            {show.screen_name || "Audi 1"} • {showDate.toLocaleDateString([], { month: 'short', day: 'numeric', weekday: 'short' })}
                                        </small>
                                        {/* Ticket Price */}
                                        <div className="mt-2 fw-bold text-danger">
                                            ₹{parseFloat(show.ticket_price).toFixed(0)}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MovieDetails;