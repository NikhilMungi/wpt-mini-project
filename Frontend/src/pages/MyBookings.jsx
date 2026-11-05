import { useEffect, useState } from "react";
import api from "../services/api";

function MyBookings() {

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const fetchBookings = async () => {

            try {

                const token = localStorage.getItem("cinebookToken");

                const response = await api.get("/bookings/my-bookings", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setBookings(response.data);

            } catch (error) {

                console.error("Unable to fetch bookings", error);

            } finally {

                setLoading(false);

            }

        };

        fetchBookings();

    }, []);

    if (loading) {
        return <div className="container py-5">Loading bookings...</div>;
    }

    return (

        <div className="container py-5">

            <h2 className="section-title">My Bookings</h2>

            {bookings.length === 0 ? (

                <div className="alert alert-info">
                    No bookings found.
                </div>

            ) : (

                <div className="row g-4">

                    {bookings.map(booking => (

                        <div className="col-md-6" key={booking.booking_id}>

                            <div className="card shadow-sm">

                                <div className="card-body">

                                    <h5>{booking.title}</h5>

                                    <p>
                                        Booking ID: {booking.booking_id}
                                    </p>

                                    <p>
                                        Booking Date: {new Date(booking.booking_date).toLocaleDateString()}
                                    </p>

                                    <p>
                                        Total Amount: ₹{booking.total_amount}
                                    </p>

                                    <span className="badge bg-success">
                                        {booking.status}
                                    </span>

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