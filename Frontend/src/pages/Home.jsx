import { Link } from "react-router-dom";

const movies = [
  {
    id: 1,
    name: "Avengers",
    genre: "Action / Adventure",
    image: "https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg"
  },

  {
    id: 2,
    name: "Inception",
    genre: "Sci-Fi / Thriller",
    image: "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg"
  },

  {
    id: 3,
    name: "Intersteller",
    genre: "Sci-Fir / Drama",
    image: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg"
  },

  {
    id: 4,
    name: "The Dark Knight",
    genre: "Action / Crime",
    image: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg"
  }
];

function Home() {
  return (
    <>
      <section className="hero-section">
        <div className="container">
          <h1>Book Your Next Experience</h1>
          <p>
            Discover movies, concerts and exciting events.
          </p>

          <Link to="/movies" className="btn btn-danger btn-lg">
            Emplore Movies
          </Link>
        </div>

      </section>

      <section className="container py-5">
        <h2 className="section-title">
          Recommended Movies
        </h2>

        <div className="row g-4">

          {movies.map((movie) => (
            <div className="col-md-6 col-lg-3" key={movie.id}>

              <div className="card movie-card h-100">
                <img
                  src={movie.image}
                  className="card-img-top movie-image"
                  alt={movie.name}
                />

                <div className="card-body">

                  <h5 className="card-title">
                    {movie.name}
                  </h5>

                  <p className="text-secondary">
                    {movie.genre}
                  </p>

                  <Link
                    to={`/movies/${movie.id}`}
                    className="btn btn-danger w-100"
                  >
                    Book Tickets
                  </Link>

                </div>
              </div>

            </div>
          ))}
        </div>
      </section >
    </>
  );
}

export default Home;