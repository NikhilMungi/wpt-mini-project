import { useEffect, useState } from "react";
import api from "../services/api";

function Events() {

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        api.get("/events")
            .then(response => {
                setEvents(response.data);
            })
            .catch(() => {
                setError("Unable to load events");
            })
            .finally(() => {
                setLoading(false);
            });

    }, []);

    if (loading) {
        return <div className="container py-5">Loading events...</div>;
    }

    return (

        <div className="container py-5">

            <h2 className="section-title">Upcoming Events</h2>

            {error && (
                <div className="alert alert-warning">{error}</div>
            )}

            <div className="row g-4">

                {events.map(event => (

                    <div className="col-md-6 col-lg-4" key={event.event_id}>

                        <div className="card h-100 shadow-sm">

                            <div className="card-body">

                                <span className="badge bg-danger">
                                    {event.category}
                                </span>

                                <h4 className="mt-3">{event.title}</h4>

                                <p>{event.description}</p>

                                <p>
                                    Date: {new Date(event.event_date).toLocaleString()}
                                </p>

                                <h5>₹{event.ticket_price}</h5>

                                <button
                                    className="btn btn-danger w-100"
                                    onClick={() => alert("Event booking will be implemented in the booking module.")}
                                >
                                    Book Event
                                </button>

                            </div>

                        </div>

                    </div>

                ))}

            </div>

        </div>

    );

}

export default Events;