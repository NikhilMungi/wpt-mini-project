import { useEffect, useState } from "react";
import api from "../services/api";

function AdminDashboard() {

    const [stats, setStats] = useState({
        movies: 0,
        events: 0,
        bookings: 0,
        users: 0
    });

    useEffect(() => {

        const fetchDashboard = async () => {

            try {

                const token = localStorage.getItem("cinebookToken");

                const response = await api.get("/admin/dashboard", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setStats(response.data);

            } catch (error) {

                console.error("Dashboard loading failed", error);

            }

        };

        fetchDashboard();

    }, []);

    const cards = [
        { title: "Total Movies", value: stats.movies },
        { title: "Total Events", value: stats.events },
        { title: "Total Bookings", value: stats.bookings },
        { title: "Total Users", value: stats.users }
    ];

    return (

        <div className="container py-5">

            <h2 className="mb-4">Admin Dashboard</h2>

            <div className="row g-4">

                {cards.map(card => (

                    <div className="col-md-3" key={card.title}>

                        <div className="admin-stat">

                            <h5>{card.title}</h5>

                            <h2>{card.value}</h2>

                        </div>

                    </div>

                ))}

            </div>

            <div className="card p-4 mt-5">

                <h4>Admin Management</h4>

                <p>Manage movies, events, users and bookings.</p>

                <p>
                    Movie and event CRUD operations will be connected
                    to backend APIs.
                </p>

            </div>

        </div>

    );

}

export default AdminDashboard;