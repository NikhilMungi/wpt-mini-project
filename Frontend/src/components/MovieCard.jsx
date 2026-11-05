import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";

function MovieCard({ movie }) {

    return (

        <div className="movie-card">

            <img
                src={movie.poster_url}
                alt={movie.title}
                className="movie-poster"
            />

            <div className="movie-card-content">

                <h5>{movie.title}</h5>

                <p>{movie.genre} | {movie.language}</p>

                <p>{movie.duration} minutes</p>

                <div className="rating">

                    <FaStar />

                    {movie.rating || "Not rated"}

                </div>

                <Link
                    to={`/movies/${movie.movie_id}`}
                    className="btn btn-danger w-100 mt-3"
                >
                    View Details
                </Link>

            </div>

        </div>

    );

}

export default MovieCard;