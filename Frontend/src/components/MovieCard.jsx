// ==============================================================================
// 🎬 REUSABLE MOVIE CARD COMPONENT (MovieCard.jsx)
// ==============================================================================
// PURPOSE:
// Demonstrates component reusability in React.
// Instead of writing the HTML card structure repeatedly, this component accepts
// a single `movie` object as a "prop" and displays its poster, title, genre,
// language, duration, star rating, and a "View Details" action button.
// ==============================================================================

import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";

/**
 * MovieCard Component
 * @param {Object} props.movie - Movie metadata (movie_id, title, genre, language, duration, rating, poster_url)
 */
function MovieCard({ movie }) {
    // High-quality cinema fallback image in case an admin leaves the poster empty
    const fallbackImage = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500";

    return (
        <div className="movie-card">
            {/* Movie Poster Image with Graceful Error Fallback */}
            <img
                src={movie.poster_url || fallbackImage}
                alt={movie.title}
                className="movie-poster"
                onError={(e) => {
                    // If the web URL is broken (404), swap in the fallback image automatically
                    e.target.onerror = null;
                    e.target.src = fallbackImage;
                }}
            />

            {/* Movie Details Content */}
            <div className="movie-card-content">
                {/* Movie Title (truncated with tooltip for long names) */}
                <h5 title={movie.title}>{movie.title}</h5>

                {/* Genre & Language */}
                <p className="text-secondary small mb-1">
                    {movie.genre} | {movie.language}
                </p>

                {/* Duration */}
                <p className="text-muted small mb-2">
                    {movie.duration ? `${movie.duration} minutes` : "Standard runtime"}
                </p>

                {/* Star Rating Badge */}
                <div className="rating mb-3">
                    <FaStar />
                    <span className="ms-1">{movie.rating ? Number(movie.rating).toFixed(1) : "Not rated"}</span>
                </div>

                {/* Action Button: Routes directly to /movies/:id */}
                <div className="mt-auto">
                    <Link
                        to={`/movies/${movie.movie_id}`}
                        className="btn btn-danger w-100"
                    >
                        View Details & Book
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default MovieCard;