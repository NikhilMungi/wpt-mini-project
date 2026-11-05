// import { BrowserRouter, Routes, Route } from "react-router-dom";

// import Navbar from "./components/Navbar";
// import Footer from "./components/Footer";

// import Home from "./pages/Home";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import About from "./pages/About";
// import Contact from "./pages/Contact";
// import Movies from "./pages/Movies";
// import Events from "./pages/Events";
// import MovieDetails from "./pages/MovieDetails";
// import SeatSelection from "./pages/SeatSelection";
// import MyBookings from "./pages/MyBookings";
// import AdminDashboard from "./pages/AdminDashboard";

// function App() {
//   return (
//     <BrowserRouter>

//       <Navbar />

//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/about" element={<About />} />
//         <Route path="/register" element={<Register />} />
//         <Route path="/contact" element={<Contact />} />
//         <Route path="/movies" element={<Movies />} />
//         <Route path="/events" element={<Events />} />
//         <Route path="/movies/:id" element={<MovieDetails />} />
//         <Route path="/seats/:showId" element={<SeatSelection />} />
//         <Route path="/my-bookings" element={<MyBookings />} />
//         <Route path="/admin" element={<AdminDashboard />} />
//       </Routes>

//       <Footer />

//     </BrowserRouter>
//   );
// }

// export default App;
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Movies from "./pages/Movies";
import Events from "./pages/Events";
import MovieDetails from "./pages/MovieDetails";
import SeatSelection from "./pages/SeatSelection";
import MyBookings from "./pages/MyBookings";
import AdminDashboard from "./pages/AdminDashboard";

import About from "./pages/About";
import Contact from "./pages/Contact";

function App() {

    return (

        <BrowserRouter>

            <Navbar />

            <Routes>

                <Route path="/" element={<Home />} />

                <Route path="/login" element={<Login />} />

                <Route path="/register" element={<Register />} />

                <Route path="/movies" element={<Movies />} />

                <Route path="/movies/:id" element={<MovieDetails />} />

                <Route path="/events" element={<Events />} />

                <Route path="/seats/:showId" element={<SeatSelection />} />

                <Route path="/my-bookings" element={<MyBookings />} />

                <Route path="/admin" element={<AdminDashboard />} />

                <Route path="/about" element={<About />} />

                <Route path="/contact" element={<Contact />} />

            </Routes>

            <Footer />

        </BrowserRouter>

    );

}

export default App;