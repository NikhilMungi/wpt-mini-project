// ==============================================================================
// 🎬 ALL MOVIES CATALOG PAGE (Movies.jsx)
// ==============================================================================
// PURPOSE:
// Displays the full catalog of active movies available for booking.
// Features:
// 1. Live Instant Search: Filters movies in real-time as the user types
//    across movie titles, genres, and languages.
// 2. Responsive 4-Column Grid: Displays movies cleanly across all screen sizes.
// 3. Reusable MovieCard Integration: Renders posters, star ratings, and links.
// ==============================================================================

import { useEffect, useState } from "react";
import api from "../services/api";
import MovieCard from "../components/MovieCard";

function Movies() {
    // --------------------------------------------------------------------------
    // STATE DECLARATIONS
    // --------------------------------------------------------------------------
    // `movies`: Master list of movies fetched from backend database
    const [movies, setMovies] = useState([]);

    // `search`: Current query string typed into the search bar
    const [search, setSearch] = useState("");

    // `loading`: Tracks whether the network request is still pending
    const [loading, setLoading] = useState(true);

    // `error`: Stores any network failure message for the user
    const [error, setError] = useState("");

    // --------------------------------------------------------------------------
    // DATA FETCHING ON MOUNT
    // --------------------------------------------------------------------------
    useEffect(() => {
        const fetchMovies = async () => {
            try {
                // HTTP GET request to backend: `GET http://localhost:5000/api/movies`
                const response = await api.get("/movies");
                setMovies(response.data || []);
            } catch (error) {
                console.error("Fetch movies error:", error);
                setError("Unable to load movies right now. Please check if the backend server is running.");
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();
    }, []);

    // --------------------------------------------------------------------------
    // CLIENT-SIDE REAL-TIME FILTERING
    // --------------------------------------------------------------------------
    // Evaluates every movie against the search string (case-insensitive)
    const filteredMovies = movies.filter(movie =>
        movie.title.toLowerCase().includes(search.toLowerCase()) ||
        (movie.genre && movie.genre.toLowerCase().includes(search.toLowerCase())) ||
        (movie.language && movie.language.toLowerCase().includes(search.toLowerCase()))
    );

    // --------------------------------------------------------------------------
    // LOADING SCREEN
    // --------------------------------------------------------------------------
    if (loading) {
        return (
            <div className="container py-5 text-center my-5">
                <div className="spinner-border text-danger" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted mt-2">Loading movie catalog...</p>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <h2 className="section-title">Explore Movies</h2>

            {/* Error Notification Banner */}
            {error && (
                <div className="alert alert-warning mb-4">{error}</div>
            )}

            {/* Live Search Bar */}
            <div className="mb-4">
                <input
                    type="text"
                    className="form-control form-control-lg shadow-sm"
                    placeholder="Search movies by title, genre, or language..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ borderRadius: "10px", fontSize: "16px" }}
                />
            </div>

            {/* Movies Grid */}
            <div className="row g-4">
                {filteredMovies.length > 0 ? (
                    // Render a reusable <MovieCard /> for each filtered item
                    filteredMovies.map(movie => (
                        <div
                            className="col-md-6 col-lg-3"
                            key={movie.movie_id}
                        >
                            <MovieCard movie={movie} />
                        </div>
                    ))
                ) : (
                    // Empty search result fallback
                    <div className="col-12 text-center py-5">
                        <p className="text-muted fs-5">No movies found matching "{search}".</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Movies;