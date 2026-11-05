import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";

function MovieDetails() {

    const { id } = useParams();

    const [movie, setMovie] = useState(null);
    const [shows, setShows] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const fetchDetails = async () => {

            try {

                const response = await api.get(`/movies/${id}`);

                setMovie(response.data.movie);
                setShows(response.data.shows);

            } catch (error) {

                console.log(error);

            } finally {

                setLoading(false);

            }

        };

        fetchDetails();

    }, [id]);

    if (loading) {
        return <div className="container py-5">Loading...</div>;
    }

    if (!movie) {
        return <div className="container py-5">Movie not found.</div>;
    }

    return (

        <div className="container py-5">

            <div className="row g-4">

                <div className="col-md-4">

                    <img
                        src={movie.poster_url}
                        alt={movie.title}
                        className="details-poster"
                    />

                </div>

                <div className="col-md-8">

                    <h1>{movie.title}</h1>

                    <p>
                        {movie.genre} | {movie.language}
                    </p>

                    <p>Duration: {movie.duration} minutes</p>

                    <p>Rating: ⭐ {movie.rating || "Not rated"}</p>

                    <h4>About Movie</h4>

                    <p>{movie.description}</p>

                    <h4>Available Shows</h4>

                    <div className="d-flex flex-wrap gap-3">

                        {shows.map(show => (

                            <Link
                                key={show.show_id}
                                to={`/seats/${show.show_id}`}
                                className="btn btn-outline-danger"
                            >

                                {new Date(show.show_datetime).toLocaleString()}

                                <br />

                                ₹{show.ticket_price}

                            </Link>

                        ))}

                    </div>

                </div>

            </div>

        </div>

    );

}

export default MovieDetails;