// ==============================================================================
// 💺 INTERACTIVE SEAT SELECTION & CHECKOUT (SeatSelection.jsx)
// ==============================================================================
// PURPOSE:
// This is the interactive booking matrix where users select their seats.
//
// UNIFIED DUAL-MODE ARCHITECTURE FOR VIVA DEFENSE:
// This single component supports BOTH Movie Screenings and Live Events:
// 1. Movie Mode (default): Reads `:showId` from URL -> calls GET /api/bookings/shows/:showId/seats
// 2. Event Mode (`isEvent=true`): Reads `:eventId` from URL -> calls GET /api/bookings/events/:eventId/seats
//
// FEATURES:
// - Real-time seat status: Green (Available), Red (Selected), Grey (Booked/Disabled).
// - Dynamic price ticker: Multiplies selected seats by ticket price automatically.
// - Transactional checkout: Posts reservation to POST /api/bookings with JWT authentication.
// ==============================================================================

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

function SeatSelection({ isEvent = false }) {
    const navigate = useNavigate();

    // Extract dynamic URL route parameters
    const { showId, eventId } = useParams();

    // --------------------------------------------------------------------------
    // STATE DECLARATIONS
    // --------------------------------------------------------------------------
    // `seats`: Array of all 20 seat objects (seat_id, seat_label, status)
    const [seats, setSeats] = useState([]);

    // `selectedSeats`: Array of seat_ids currently selected by the customer [e.g. 1, 2]
    const [selectedSeats, setSelectedSeats] = useState([]);

    // `price`: Ticket price per seat (e.g. 280.00)
    const [price, setPrice] = useState(0);

    // Title & venue metadata
    const [title, setTitle] = useState(isEvent ? "Event Seats" : "Movie Seats");
    const [venue, setVenue] = useState("");

    // Loading flag
    const [loading, setLoading] = useState(true);

    // --------------------------------------------------------------------------
    // 1. FETCH SEATS FROM BACKEND
    // --------------------------------------------------------------------------
    useEffect(() => {
        const fetchSeats = async () => {
            try {
                // Dynamically select API endpoint depending on whether this is a Movie or Event
                const endpoint = isEvent 
                    ? `/bookings/events/${eventId}/seats` 
                    : `/bookings/shows/${showId}/seats`;

                const response = await api.get(endpoint);

                setSeats(response.data.seats || []);
                setPrice(Number(response.data.ticket_price) || 0);
                if (response.data.title) setTitle(response.data.title);
                if (response.data.venue) setVenue(response.data.venue);

            } catch (error) {
                console.error("Seat loading failed", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSeats();
    }, [showId, eventId, isEvent]);

    // --------------------------------------------------------------------------
    // 2. TOGGLE SEAT SELECTION
    // --------------------------------------------------------------------------
    const toggleSeat = (seat) => {
        // Guard: If the seat is already booked by another customer, ignore clicks
        if (seat.status !== "AVAILABLE") return;

        setSelectedSeats(previous =>
            // If already selected, remove it from array (unselect); otherwise add it
            previous.includes(seat.seat_id)
                ? previous.filter(id => id !== seat.seat_id)
                : [...previous, seat.seat_id]
        );
    };

    // --------------------------------------------------------------------------
    // 3. CONFIRM BOOKING & CHECKOUT
    // --------------------------------------------------------------------------
    const confirmBooking = async () => {
        // Check if user has an active session token in localStorage
        const token = localStorage.getItem("cinebookToken");
        if (!token) {
            alert("Please login first to book tickets!");
            navigate("/login");
            return;
        }

        if (!selectedSeats.length) {
            alert("Please select at least one seat.");
            return;
        }

        try {
            // Build request payload for backend transaction
            const payload = isEvent
                ? { event_id: Number(eventId), seat_ids: selectedSeats }
                : { show_id: Number(showId), seat_ids: selectedSeats };

            // Send POST request with JWT Bearer Token in Authorization header
            const response = await api.post(
                "/bookings",
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert(response.data.message || "Booking created successfully!");
            // Reset local selection and redirect to tickets page
            setSelectedSeats([]);
            navigate("/my-bookings");

        } catch (error) {
            console.error("Booking submission error:", error);
            alert(
                error.response?.data?.message ||
                "Booking failed. Please login and try again."
            );
        }
    };

    // Loading indicator while seats are retrieved from MySQL
    if (loading) {
        return (
            <div className="container py-5 text-center my-5">
                <div className="spinner-border text-danger" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted mt-2">Loading seat matrix...</p>
            </div>
        );
    }

    // Dynamic grand total: selected count * unit ticket price
    const totalAmount = selectedSeats.length * price;

    return (
        <div className="container py-5">
            {/* Header / Meta Info */}
            <div className="text-center mb-4">
                <span className="badge bg-danger mb-2 px-3 py-2">{isEvent ? "Live Event" : "Movie Show"}</span>
                <h2 className="fw-bold text-dark">{title}</h2>
                {venue && <p className="text-muted mb-1">📍 Venue: {venue}</p>}
                <p className="text-secondary">Select your preferred seats below</p>
            </div>

            {/* Cinema Screen / Event Stage Curve */}
            <div className="screen">
                {isEvent ? "STAGE THIS WAY" : "SCREEN THIS WAY"}
            </div>

            {/* Interactive Seat Matrix (Grid of 20 seats: A1-D5) */}
            <div className="seat-container mb-4">
                <div className="d-flex flex-wrap justify-content-center gap-2" style={{ maxWidth: "450px", margin: "auto" }}>
                    {seats.map(seat => {
                        const isSelected = selectedSeats.includes(seat.seat_id);
                        const isBooked = seat.status === "BOOKED";

                        return (
                            <button
                                key={seat.seat_id}
                                disabled={isBooked}
                                onClick={() => toggleSeat(seat)}
                                className={`seat ${
                                    isBooked 
                                        ? "booked" 
                                        : isSelected 
                                            ? "selected" 
                                            : "available"
                                }`}
                                title={`Seat ${seat.seat_label} - ₹${price}`}
                            >
                                {seat.seat_label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Visual Color Legend */}
            <div className="d-flex justify-content-center gap-4 mb-4 small text-secondary">
                <div className="d-flex align-items-center gap-2">
                    <span className="seat available" style={{ width: "24px", height: "24px", fontSize: "10px", pointerEvents: "none" }}></span>
                    <span>Available</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <span className="seat selected" style={{ width: "24px", height: "24px", fontSize: "10px", pointerEvents: "none" }}></span>
                    <span>Selected</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <span className="seat booked" style={{ width: "24px", height: "24px", fontSize: "10px", pointerEvents: "none" }}></span>
                    <span>Booked</span>
                </div>
            </div>

            {/* Real-time Order Summary Bar */}
            <div className="booking-summary">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <small className="text-muted d-block">Selected Seats</small>
                        <strong className="fs-5">{selectedSeats.length > 0 ? selectedSeats.length : "0"}</strong>
                    </div>
                    <div>
                        <small className="text-muted d-block">Price per seat</small>
                        <strong className="fs-5">₹{price}</strong>
                    </div>
                    <div className="text-end">
                        <small className="text-muted d-block">Total</small>
                        <h4 className="text-danger fw-bold d-inline mb-0">₹{totalAmount}</h4>
                    </div>
                </div>

                {/* Checkout Button */}
                <button
                    onClick={confirmBooking}
                    disabled={selectedSeats.length === 0}
                    className="btn btn-danger btn-lg w-100 py-3"
                >
                    Confirm Booking ({selectedSeats.length} {selectedSeats.length === 1 ? "seat" : "seats"})
                </button>
            </div>
        </div>
    );
}

export default SeatSelection;