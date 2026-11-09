// ==============================================================================
// 🎟️ CUSTOMER BOOKING HISTORY & TICKET MANAGEMENT (MyBookings.jsx)
// ==============================================================================
// PURPOSE:
// Displays all past and current reservations made by the logged-in user.
// Features:
// 1. Digital Ticket Display: Movie/Event title, booking reference #, seat labels (A1, A2),
//    reservation timestamp, and total price paid.
// 2. Status Badges: 'CONFIRMED' (Green) or 'CANCELLED' (Red).
// 3. One-Click Cancellation: Users can self-cancel active tickets with automatic
//    immediate release of those seats back to the public pool.
// ==============================================================================

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function MyBookings() {
    // --------------------------------------------------------------------------
    // STATE HOOKS
    // --------------------------------------------------------------------------
    // `bookings`: Array of customer reservation records from MySQL
    const [bookings, setBookings] = useState([]);

    // `loading`: Tracks API request completion
    const [loading, setLoading] = useState(true);

    // --------------------------------------------------------------------------
    // FETCH USER BOOKINGS
    // --------------------------------------------------------------------------
    const fetchBookings = async () => {
        try {
            // Retrieve JWT token from browser localStorage
            const token = localStorage.getItem("cinebookToken");

            // HTTP GET request to protected endpoint with Bearer token header
            const response = await api.get("/bookings/my-bookings", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setBookings(response.data || []);
        } catch (error) {
            console.error("Unable to fetch bookings:", error);
        } finally {
            setLoading(false);
        }
    };

    // Load ticket history on page mount
    useEffect(() => {
        fetchBookings();
    }, []);

    // --------------------------------------------------------------------------
    // CANCEL RESERVATION HANDLER
    // --------------------------------------------------------------------------
    const handleCancel = async (bookingId) => {
        // Confirmation modal prevents accidental cancellations
        if (!window.confirm("Are you sure you want to cancel this booking? The seats will be released back to other users.")) return;

        try {
            const token = localStorage.getItem("cinebookToken");

            // Calls backend: `PUT /api/bookings/:id/cancel`
            const response = await api.put(`/bookings/${bookingId}/cancel`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            alert(response.data.message || "Booking cancelled successfully!");
            // Re-fetch bookings so UI reflects the updated 'CANCELLED' status
            fetchBookings();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to cancel booking. Please try again.");
        }
    };

    // Loading screen
    if (loading) {
        return (
            <div className="container py-5 text-center my-5">
                <div className="spinner-border text-danger" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted mt-2">Loading your tickets...</p>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <h2 className="section-title mb-4">🎟️ My Bookings</h2>

            {bookings.length === 0 ? (
                // Empty state if user has never purchased any tickets yet
                <div className="alert alert-info py-4 text-center">
                    <p className="mb-2 fs-5">You have no active bookings yet.</p>
                    <Link to="/movies" className="btn btn-primary btn-sm">
                        Explore Movies & Book Tickets
                    </Link>
                </div>
            ) : (
                // Grid of digital ticket cards
                <div className="row g-4">
                    {bookings.map(booking => (
                        <div className="col-md-6" key={booking.booking_id}>
                            <div className="card shadow-sm border-0 h-100" style={{ borderRadius: "12px" }}>
                                <div className="card-body p-4">
                                    {/* Header: Title & Status Badge */}
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            <span className="badge bg-secondary mb-1">
                                                {booking.type || "Ticket"}
                                            </span>
                                            <h5 className="card-title fw-bold text-dark mb-0">{booking.title}</h5>
                                        </div>
                                        {/* Status badge: Green for CONFIRMED, Red for CANCELLED */}
                                        <span className={`badge ${booking.status === 'CONFIRMED' ? 'bg-success' : 'bg-danger'} px-3 py-2`}>
                                            {booking.status}
                                        </span>
                                    </div>

                                    <hr />

                                    {/* Ticket Details */}
                                    <p className="text-muted small mb-2">
                                        Booking Reference: <strong className="text-dark">#{booking.booking_id}</strong>
                                    </p>
                                    <p className="mb-2 small">
                                        Seats Reserved: <strong className="text-primary">{booking.seats || "General Admission"}</strong>
                                    </p>
                                    <p className="mb-2 small text-muted">
                                        Purchased On: {new Date(booking.booking_date).toLocaleString()}
                                    </p>
                                    <h5 className="text-danger fw-bold mt-3 mb-0">
                                        Total Paid: ₹{parseFloat(booking.total_amount).toFixed(0)}
                                    </h5>

                                    {/* Cancel Button: Displayed ONLY if booking is still CONFIRMED */}
                                    {booking.status === "CONFIRMED" && (
                                        <button
                                            onClick={() => handleCancel(booking.booking_id)}
                                            className="btn btn-outline-danger btn-sm mt-3 w-100"
                                        >
                                            Cancel Reservation
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyBookings;