import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

function SeatSelection() {

    const { showId } = useParams();

    const [seats, setSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [price, setPrice] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const fetchSeats = async () => {

            try {

                const response = await api.get(`/bookings/shows/${showId}/seats`);

                setSeats(response.data.seats);
                setPrice(Number(response.data.ticket_price));

            } catch (error) {

                console.error("Seat loading failed", error);

            } finally {

                setLoading(false);

            }

        };

        fetchSeats();

    }, [showId]);

    const toggleSeat = (seat) => {

        if (seat.status !== "AVAILABLE") return;

        setSelectedSeats(previous =>
            previous.includes(seat.seat_id)
                ? previous.filter(id => id !== seat.seat_id)
                : [...previous, seat.seat_id]
        );

    };

    const confirmBooking = async () => {

        if (!selectedSeats.length) {
            alert("Please select seats");
            return;
        }

        try {

            const token = localStorage.getItem("cinebookToken");

            const response = await api.post(
                "/bookings",
                {
                    show_id: Number(showId),
                    seat_ids: selectedSeats
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert(response.data.message || "Booking created successfully!");

            setSelectedSeats([]);

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Booking failed. Please login and try again."
            );

        }

    };

    if (loading) {
        return <div className="container py-5">Loading seats...</div>;
    }

    return (

        <div className="container py-5">

            <h2 className="text-center">Select Your Seats</h2>

            <div className="screen">SCREEN THIS WAY</div>

            <div className="seat-container">

                <div className="d-flex flex-wrap justify-content-center gap-2">

                    {seats.map(seat => {

                        const isSelected = selectedSeats.includes(seat.seat_id);

                        return (

                            <button
                                key={seat.seat_id}
                                disabled={seat.status !== "AVAILABLE"}
                                onClick={() => toggleSeat(seat)}
                                className={`seat ${
                                    seat.status === "BOOKED" ||
                                    seat.status === "LOCKED"
                                        ? "booked"
                                        : isSelected
                                        ? "selected"
                                        : "available"
                                }`}
                            >
                                {seat.seat_number}

                            </button>

                        );

                    })}

                </div>

            </div>

            <div className="booking-summary">

                <h5>Booking Summary</h5>

                <p>Selected Seats: {selectedSeats.length}</p>

                <p>Price per seat: ₹{price}</p>

                <h4>Total: ₹{selectedSeats.length * price}</h4>

                <button
                    className="btn btn-danger"
                    onClick={confirmBooking}
                >
                    Confirm Booking
                </button>

            </div>

        </div>

    );

}

export default SeatSelection;