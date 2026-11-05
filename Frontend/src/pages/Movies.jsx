import { useEffect, useState } from "react";
import api from "../services/api";
import MovieCard from "../components/MovieCard";

function Movies() {

    const [movies, setMovies] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const fetchMovies = async () => {

            try {

                const response = await api.get("/movies");

                setMovies(response.data);

            } catch (error) {

                setError("Unable to load movies. Please try again.");

            } finally {

                setLoading(false);

            }

        };

        fetchMovies();

    }, []);

    const filteredMovies = movies.filter(movie =>
        movie.title.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return <div className="container py-5">Loading movies...</div>;
    }

    return (

        <div className="container py-5">

            <h2 className="section-title">Explore Movies</h2>

            {error && (
                <div className="alert alert-warning">{error}</div>
            )}

            <input
                type="text"
                className="form-control mb-4"
                placeholder="Search movies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <div className="row g-4">

                {filteredMovies.length > 0 ? (

                    filteredMovies.map(movie => (

                        <div
                            className="col-md-6 col-lg-3"
                            key={movie.movie_id}
                        >

                            <MovieCard movie={movie} />

                        </div>

                    ))

                ) : (

                    <p>No movies found.</p>

                )}

            </div>

        </div>

    );

}

export default Movies;