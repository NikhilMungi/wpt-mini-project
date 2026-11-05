// import { Link } from "react-router-dom";

// function Navbar() {
//     return (
//         <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
//             <div className="container">
//                 <Link className="navbar-brand fw-bold" to="/">
//                     CineBook
//                 </Link>

//                 <button className="navbar-toggler"
//                     type="button"
//                     data-bs-toggle="collapse"
//                     data-bs-target="#navbarMenu"
//                 >
//                     <span className="navbar-toggler-icon"></span>
//                 </button>

//                 <div className="collapse navbar-collapse" id="navbarMenu">
//                     <ul className="navbar-nav ms-auto">
//                         <li className="nav-item">
//                             <Link className="nav-link" to="/">Home</Link>
//                         </li>
//                         <li className="nav-item">
//                             <Link className="nav-link" to="/movies">Movies</Link>
//                         </li>
//                         <li className="nav-item">
//                             <Link className="nav-link" to="/events">Events</Link>
//                         </li>
//                         <li className="nav-item">
//                             <Link className="nav-link" to="/about">About</Link>
//                         </li>
//                         <li className="nav-item">
//                             <Link className="nav-link" to="/contact">Contact</Link>
//                         </li>

//                     </ul>

//                     <div className="d-flex gap-2 ms-lg-3">
//                         <Link to="/login" className="btn btn-outline-light">
//                             Login
//                         </Link>

//                         <Link to="/register" className="btn btn-danger">
//                             Register
//                         </Link>

//                     </div>

//                 </div>
//             </div>
//         </nav>
//     );
// }

// export default Navbar;
import { Link } from "react-router-dom";

function Navbar() {

    return (

        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">

            <div className="container">

                <Link className="navbar-brand fw-bold" to="/">
                    CineBook
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarMenu"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarMenu">

                    <ul className="navbar-nav ms-auto">

                        <li className="nav-item">
                            <Link className="nav-link" to="/">Home</Link>
                        </li>

                        <li className="nav-item">
                            <Link className="nav-link" to="/movies">Movies</Link>
                        </li>

                        <li className="nav-item">
                            <Link className="nav-link" to="/events">Events</Link>
                        </li>

                        <li className="nav-item">
                            <Link className="nav-link" to="/my-bookings">My Bookings</Link>
                        </li>

                        <li className="nav-item">
                            <Link className="nav-link" to="/about">About</Link>
                        </li>

                        <li className="nav-item">
                            <Link className="nav-link" to="/contact">Contact</Link>
                        </li>

                    </ul>

                    <div className="d-flex gap-2 ms-lg-3">

                        <Link to="/login" className="btn btn-outline-light">
                            Login
                        </Link>

                        <Link to="/register" className="btn btn-danger">
                            Register
                        </Link>

                    </div>

                </div>

            </div>

        </nav>

    );

}

export default Navbar;