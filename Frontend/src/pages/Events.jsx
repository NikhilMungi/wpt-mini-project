// ==============================================================================
// 🎪 LIVE EVENTS CATALOG PAGE (Events.jsx)
// ==============================================================================
// PURPOSE:
// Displays all available live entertainment events (music festivals, standup comedy,
// conferences, theater).
// Features:
// 1. Dynamic event cards with banner, category badge, venue location, date, and ticket price.
// 2. Direct seat reservation flow: Clicking "Select Seats & Book" opens the interactive
//    seat matrix configured specifically for that live event (`/event-seats/:eventId`).
// ==============================================================================

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Events() {
    // --------------------------------------------------------------------------
    // STATE HOOKS
    // --------------------------------------------------------------------------
    // `events`: Array of event objects from MySQL `events` table
    const [events, setEvents] = useState([]);

    // `loading`: Tracks network status
    const [loading, setLoading] = useState(true);

    // `error`: Error notice if backend fails
    const [error, setError] = useState("");

    // Fallback concert banner in case an admin leaves the poster URL empty
    const defaultEventBanner = "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800";

    // --------------------------------------------------------------------------
    // FETCH EVENTS ON COMPONENT LOAD
    // --------------------------------------------------------------------------
    useEffect(() => {
        // Calls backend: `GET http://localhost:5000/api/events`
        api.get("/events")
            .then(response => {
                setEvents(response.data || []);
            })
            .catch((err) => {
                console.error("Failed to load events:", err);
                setError("Unable to load events right now. Please try again later.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    // --------------------------------------------------------------------------
    // LOADING SCREEN
    // --------------------------------------------------------------------------
    if (loading) {
        return (
            <div className="container py-5 text-center my-5">
                <div className="spinner-border text-danger" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted mt-2">Loading upcoming live events...</p>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <h2 className="section-title mb-4">🎪 Upcoming Live Events</h2>

            {/* Error Message Display */}
            {error && (
                <div className="alert alert-warning mb-4">{error}</div>
            )}

            {/* Responsive Grid of Event Cards */}
            <div className="row g-4">
                {events.map(event => (
                    <div className="col-md-6 col-lg-4" key={event.event_id}>
                        <div className="card h-100 shadow-sm border-0" style={{ borderRadius: "12px", overflow: "hidden" }}>
                            {/* Event Poster / Banner */}
                            <img
                                src={event.poster_url || defaultEventBanner}
                                className="card-img-top"
                                alt={event.title}
                                style={{ height: "210px", objectFit: "cover" }}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = defaultEventBanner;
                                }}
                            />

                            <div className="card-body d-flex flex-column p-4">
                                {/* Category Badge & Venue */}
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="badge bg-danger px-2 py-1">
                                        {event.category}
                                    </span>
                                    <span className="text-muted small text-truncate ms-2" title={event.venue}>
                                        📍 {event.venue}
                                    </span>
                                </div>

                                {/* Event Title */}
                                <h4 className="fw-bold mt-1 mb-2">{event.title}</h4>

                                {/* Event Description */}
                                <p className="text-secondary small flex-grow-1 mb-3" style={{ lineHeight: "1.6" }}>
                                    {event.description}
                                </p>

                                {/* Scheduled Date & Time Card */}
                                <div className="bg-light p-3 rounded mb-3 small">
                                    <div className="text-dark">
                                        🗓️ <strong>Date:</strong> {new Date(event.event_date).toLocaleString([], {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </div>

                                {/* Pricing & Direct Seat Booking Action */}
                                <div className="d-flex justify-content-between align-items-center mt-auto pt-2">
                                    <h4 className="text-danger fw-bold mb-0">₹{parseFloat(event.ticket_price).toFixed(0)}</h4>
                                    {/* Routes directly into SeatSelection with isEvent=true */}
                                    <Link
                                        to={`/event-seats/${event.event_id}`}
                                        className="btn btn-danger px-3 fw-semibold"
                                    >
                                        Select Seats &rarr;
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Events;