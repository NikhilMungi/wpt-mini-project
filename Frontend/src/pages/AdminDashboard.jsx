// ==============================================================================
// 🛠️ ADMIN CONTROL PANEL COMPONENT (AdminDashboard.jsx)
// ==============================================================================
// PURPOSE:
// This is the complete back-office administrative cockpit for CineBook.
// It is partitioned into 5 functional tabs:
// 1. 📊 Overview: Live KPI metric counters (Active Movies, Events, Bookings, Users).
// 2. 🎬 Manage Movies: Add new movie (with auto-generated show & 20 seats), Edit, Soft-delete.
// 3. 🎪 Manage Events: Add concert/comedy gig, Edit, Soft-delete.
// 4. 🕒 Schedule Shows: Pick any active movie, schedule new auditorium showtime, auto-generate seats.
// 5. 📑 All Bookings Audit: Transaction-level audit of all customer ticket purchases.
//
// FILE UPLOAD INTEGRATION:
// Features direct local PNG/JPEG file uploading via Multer (`POST /api/admin/upload`),
// displaying an instant thumbnail preview while maintaining an optional web URL fallback.
// ==============================================================================

import { useEffect, useState } from "react";
import api from "../services/api";

function AdminDashboard() {
    // --------------------------------------------------------------------------
    // 1. NAVIGATION & KPI STATE
    // --------------------------------------------------------------------------
    // `activeTab`: Controls which tab view is currently visible ('overview'|'movies'|'events'|'shows'|'bookings')
    const [activeTab, setActiveTab] = useState("overview");

    // `stats`: Live metrics from GET /api/admin/dashboard
    const [stats, setStats] = useState({ movies: 0, events: 0, bookings: 0, users: 0 });

    // Master lists fetched from backend
    const [movies, setMovies] = useState([]);
    const [events, setEvents] = useState([]);
    const [bookings, setBookings] = useState([]);

    // Banner alert message for user feedback (e.g. "✅ Movie updated successfully!")
    const [message, setMessage] = useState("");

    // --------------------------------------------------------------------------
    // 2. FORM STATES (CREATE & EDIT MODES)
    // --------------------------------------------------------------------------
    // Movie Form State: `editingMovieId` is null in create mode, or holds the movie_id in edit mode
    const [editingMovieId, setEditingMovieId] = useState(null);
    const [movieForm, setMovieForm] = useState({
        title: "", description: "", genre: "", language: "English", duration: 120, rating: 8.0, poster_url: "", initial_price: 280
    });

    // Event Form State
    const [editingEventId, setEditingEventId] = useState(null);
    const [eventForm, setEventForm] = useState({
        title: "", description: "", category: "Music Concert", venue: "", event_date: "", ticket_price: 499, poster_url: ""
    });

    // Show Scheduling Form State
    const [showForm, setShowForm] = useState({
        movie_id: "", screen_name: "Audi 1 - IMAX", show_datetime: "", ticket_price: 300
    });

    // Upload loading state spinners
    const [uploadingMoviePoster, setUploadingMoviePoster] = useState(false);
    const [uploadingEventPoster, setUploadingEventPoster] = useState(false);

    // Retrieve admin authentication token from browser storage
    const token = localStorage.getItem("cinebookToken");
    const authHeader = { headers: { Authorization: `Bearer ${token}` } };

    // --------------------------------------------------------------------------
    // 3. FILE UPLOAD HANDLER (MULTER INTEGRATION)
    // --------------------------------------------------------------------------
    // Uploads physical PNG/JPEG files from the admin's device to the backend server
    const handleFileUpload = async (file, target) => {
        if (!file) return;

        // Security check: restrict allowed image MIME types
        const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
        if (!validTypes.includes(file.type)) {
            alert("Please select a valid image file (PNG, JPEG, JPG, or WEBP)");
            return;
        }

        // File size check: reject files larger than 5 MB
        if (file.size > 5 * 1024 * 1024) {
            alert("File size must be under 5 MB");
            return;
        }

        // Pack the binary file into a FormData object
        const formData = new FormData();
        formData.append("poster", file);

        if (target === "movie") setUploadingMoviePoster(true);
        if (target === "event") setUploadingEventPoster(true);

        try {
            // Post multipart/form-data to POST /api/admin/upload
            const res = await api.post("/admin/upload", formData, {
                headers: {
                    ...authHeader.headers,
                    "Content-Type": "multipart/form-data"
                }
            });

            // Store the returned public static URL in the form state
            if (target === "movie") {
                setMovieForm(prev => ({ ...prev, poster_url: res.data.imageUrl }));
            } else if (target === "event") {
                setEventForm(prev => ({ ...prev, poster_url: res.data.imageUrl }));
            }
        } catch (err) {
            console.error("Upload error:", err);
            alert(err.response?.data?.message || "Poster upload failed. Please try again.");
        } finally {
            if (target === "movie") setUploadingMoviePoster(false);
            if (target === "event") setUploadingEventPoster(false);
        }
    };

    // --------------------------------------------------------------------------
    // 4. DATA SYNCHRONIZATION HELPERS
    // --------------------------------------------------------------------------
    const fetchStats = async () => {
        try {
            const res = await api.get("/admin/dashboard", authHeader);
            setStats(res.data);
        } catch (err) {
            console.error("Dashboard metrics failed", err);
        }
    };

    const fetchMovies = async () => {
        try {
            const res = await api.get("/admin/movies", authHeader);
            setMovies(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchEvents = async () => {
        try {
            const res = await api.get("/admin/events", authHeader);
            setEvents(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchBookings = async () => {
        try {
            const res = await api.get("/admin/bookings", authHeader);
            setBookings(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    // Fetch all administrative records when the dashboard loads
    useEffect(() => {
        fetchStats();
        fetchMovies();
        fetchEvents();
        fetchBookings();
    }, []);

    // --------------------------------------------------------------------------
    // 5. MOVIE CRUD HANDLERS
    // --------------------------------------------------------------------------
    // Save Movie (Handles both Create and Update)
    const handleSaveMovie = async (e) => {
        e.preventDefault();
        setMessage("");
        try {
            if (editingMovieId) {
                // UPDATE: PUT /api/admin/movies/:id
                await api.put(`/admin/movies/${editingMovieId}`, movieForm, authHeader);
                setMessage("✅ Movie updated successfully! Changes are live for all users.");
                setEditingMovieId(null);
            } else {
                // CREATE: POST /api/admin/movies (auto-schedules show & generates 20 seats)
                await api.post("/admin/movies", movieForm, authHeader);
                setMessage("🎉 Movie added & initial showtime with 20 seats created!");
            }
            // Reset form
            setMovieForm({ title: "", description: "", genre: "", language: "English", duration: 120, rating: 8.0, poster_url: "", initial_price: 280 });
            fetchMovies();
            fetchStats();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to save movie");
        }
    };

    // Populate form with existing movie data for editing
    const handleEditMovieClick = (m) => {
        setEditingMovieId(m.movie_id);
        setMovieForm({
            title: m.title,
            description: m.description || "",
            genre: m.genre,
            language: m.language,
            duration: m.duration,
            rating: m.rating,
            poster_url: m.poster_url || "",
            initial_price: 280
        });
        window.scrollTo({ top: 150, behavior: "smooth" });
    };

    const handleCancelMovieEdit = () => {
        setEditingMovieId(null);
        setMovieForm({ title: "", description: "", genre: "", language: "English", duration: 120, rating: 8.0, poster_url: "", initial_price: 280 });
    };

    // Soft-deactivates movie without deleting historic foreign key rows
    const handleDeleteMovie = async (id) => {
        if (!window.confirm("Deactivate this movie? It will be hidden from customer catalogs.")) return;
        try {
            await api.delete(`/admin/movies/${id}`, authHeader);
            fetchMovies();
            fetchStats();
        } catch (err) {
            alert("Delete failed");
        }
    };

    // --------------------------------------------------------------------------
    // 6. EVENT CRUD HANDLERS
    // --------------------------------------------------------------------------
    const handleSaveEvent = async (e) => {
        e.preventDefault();
        setMessage("");
        try {
            if (editingEventId) {
                // UPDATE: PUT /api/admin/events/:id
                await api.put(`/admin/events/${editingEventId}`, eventForm, authHeader);
                setMessage("✅ Event updated successfully!");
                setEditingEventId(null);
            } else {
                // CREATE: POST /api/admin/events
                await api.post("/admin/events", eventForm, authHeader);
                setMessage("🎉 Event added successfully!");
            }
            setEventForm({ title: "", description: "", category: "Music Concert", venue: "", event_date: "", ticket_price: 499, poster_url: "" });
            fetchEvents();
            fetchStats();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to save event");
        }
    };

    const handleEditEventClick = (ev) => {
        setEditingEventId(ev.event_id);
        setEventForm({
            title: ev.title,
            description: ev.description || "",
            category: ev.category,
            venue: ev.venue,
            event_date: ev.event_date ? new Date(ev.event_date).toISOString().slice(0, 16) : "",
            ticket_price: ev.ticket_price,
            poster_url: ev.poster_url || ""
        });
        window.scrollTo({ top: 150, behavior: "smooth" });
    };

    const handleCancelEventEdit = () => {
        setEditingEventId(null);
        setEventForm({ title: "", description: "", category: "Music Concert", venue: "", event_date: "", ticket_price: 499, poster_url: "" });
    };

    const handleDeleteEvent = async (id) => {
        if (!window.confirm("Deactivate this event?")) return;
        try {
            await api.delete(`/admin/events/${id}`, authHeader);
            fetchEvents();
            fetchStats();
        } catch (err) {
            alert("Delete failed");
        }
    };

    // --------------------------------------------------------------------------
    // 7. SHOW SCHEDULING HANDLER
    // --------------------------------------------------------------------------
    const handleScheduleShow = async (e) => {
        e.preventDefault();
        setMessage("");
        try {
            // POST /api/admin/shows
            await api.post("/admin/shows", showForm, authHeader);
            setMessage("✅ Extra show scheduled and 20 seats generated!");
            setShowForm({ movie_id: "", screen_name: "Audi 1 - IMAX", show_datetime: "", ticket_price: 300 });
        } catch (err) {
            alert(err.response?.data?.message || "Failed to schedule show");
        }
    };

    // Quick action: pre-fills movie in the show scheduler tab
    const handleQuickScheduleMovie = (movieId) => {
        setShowForm({ ...showForm, movie_id: movieId });
        setActiveTab("shows");
    };

    return (
        <div className="container py-5">
            {/* Header with Admin Privilege Badge */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold">🛠️ Admin Control Center</h2>
                <span className="badge bg-danger fs-6 px-3 py-2">ADMIN PRIVILEGES</span>
            </div>

            {/* Notification Alert */}
            {message && <div className="alert alert-success">{message}</div>}

            {/* ==================================================================
               OVERVIEW KPI METRIC CARDS
               ================================================================== */}
            <div className="row g-4 mb-4">
                <div className="col-md-3 col-6">
                    <div className="admin-stat">
                        <h6>Active Movies</h6>
                        <h2>{stats.movies}</h2>
                    </div>
                </div>
                <div className="col-md-3 col-6">
                    <div className="admin-stat">
                        <h6>Active Events</h6>
                        <h2 style={{ color: "#f59e0b" }}>{stats.events}</h2>
                    </div>
                </div>
                <div className="col-md-3 col-6">
                    <div className="admin-stat">
                        <h6>Total Bookings</h6>
                        <h2 style={{ color: "#10b981" }}>{stats.bookings}</h2>
                    </div>
                </div>
                <div className="col-md-3 col-6">
                    <div className="admin-stat">
                        <h6>Total Users</h6>
                        <h2 style={{ color: "#38bdf8" }}>{stats.users}</h2>
                    </div>
                </div>
            </div>

            {/* ==================================================================
               NAVIGATION PILL TABS
               ================================================================== */}
            <ul className="nav nav-pills mb-4 gap-2">
                <li className="nav-item">
                    <button className={`nav-link fw-semibold px-3 py-2 ${activeTab === 'overview' ? 'active bg-danger text-white' : 'text-dark bg-white shadow-sm border'}`} onClick={() => setActiveTab('overview')}>
                        📊 Overview
                    </button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link fw-semibold px-3 py-2 ${activeTab === 'movies' ? 'active bg-danger text-white' : 'text-dark bg-white shadow-sm border'}`} onClick={() => setActiveTab('movies')}>
                        🎬 Manage Movies
                    </button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link fw-semibold px-3 py-2 ${activeTab === 'events' ? 'active bg-danger text-white' : 'text-dark bg-white shadow-sm border'}`} onClick={() => setActiveTab('events')}>
                        🎪 Manage Events
                    </button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link fw-semibold px-3 py-2 ${activeTab === 'shows' ? 'active bg-danger text-white' : 'text-dark bg-white shadow-sm border'}`} onClick={() => setActiveTab('shows')}>
                        🕒 Schedule Shows
                    </button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link fw-semibold px-3 py-2 ${activeTab === 'bookings' ? 'active bg-danger text-white' : 'text-dark bg-white shadow-sm border'}`} onClick={() => setActiveTab('bookings')}>
                        📑 All Bookings Audit
                    </button>
                </li>
            </ul>

            {/* ==================================================================
               TAB 1: OVERVIEW & INSTRUCTIONS
               ================================================================== */}
            {activeTab === 'overview' && (
                <div className="card p-4 shadow-sm border-0" style={{ borderRadius: "12px" }}>
                    <h4 className="fw-bold mb-3">Admin Instructions</h4>
                    <p className="text-secondary">Welcome to the CineBook Management Panel. From here you can:</p>
                    <ul className="text-secondary">
                        <li><strong>Manage Movies:</strong> Add new movies (automatically schedules show & 20 seats!), edit details, or deactivate titles.</li>
                        <li><strong>Manage Events:</strong> Add live concerts, comedy nights, or conferences.</li>
                        <li><strong>Schedule Shows:</strong> Assign additional showtimes with auto-generated seats.</li>
                        <li><strong>Audit Bookings:</strong> Review transactions across all registered users.</li>
                    </ul>
                </div>
            )}

            {/* ==================================================================
               TAB 2: MANAGE MOVIES (FORM + TABLE)
               ================================================================== */}
            {activeTab === 'movies' && (
                <div className="row g-4">
                    {/* Left: Movie Form */}
                    <div className="col-md-5">
                        <div className="card p-4 shadow-sm border-0" style={{ borderRadius: "12px" }}>
                            <h5 className="fw-bold">{editingMovieId ? "✏️ Edit Movie Details" : "➕ Add New Movie"}</h5>
                            <p className="small text-muted mb-3">
                                {editingMovieId ? "Update metadata for this movie." : "Adding a movie will automatically create a showtime with 20 bookable seats!"}
                            </p>
                            <form onSubmit={handleSaveMovie}>
                                <label className="form-label small fw-semibold">Movie Title</label>
                                <input className="form-control mb-2" placeholder="e.g. Gladiator II" value={movieForm.title} onChange={e => setMovieForm({...movieForm, title: e.target.value})} required />

                                <label className="form-label small fw-semibold">Genre</label>
                                <input className="form-control mb-2" placeholder="e.g. Action / Adventure" value={movieForm.genre} onChange={e => setMovieForm({...movieForm, genre: e.target.value})} required />

                                <div className="row g-2 mb-2">
                                    <div className="col-6">
                                        <label className="form-label small fw-semibold">Language</label>
                                        <input className="form-control" placeholder="English" value={movieForm.language} onChange={e => setMovieForm({...movieForm, language: e.target.value})} required />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label small fw-semibold">Duration (mins)</label>
                                        <input type="number" className="form-control" placeholder="148" value={movieForm.duration} onChange={e => setMovieForm({...movieForm, duration: Number(e.target.value)})} required />
                                    </div>
                                </div>

                                <div className="row g-2 mb-2">
                                    <div className="col-6">
                                        <label className="form-label small fw-semibold">Rating (⭐ / 10)</label>
                                        <input type="number" step="0.1" className="form-control" placeholder="8.5" value={movieForm.rating} onChange={e => setMovieForm({...movieForm, rating: Number(e.target.value)})} />
                                    </div>
                                    {!editingMovieId && (
                                        <div className="col-6">
                                            <label className="form-label small fw-semibold">Show Ticket Price (₹)</label>
                                            <input type="number" className="form-control" placeholder="280" value={movieForm.initial_price} onChange={e => setMovieForm({...movieForm, initial_price: Number(e.target.value)})} />
                                        </div>
                                    )}
                                </div>

                                {/* PNG / JPEG Poster File Upload */}
                                <div className="mb-3">
                                    <label className="form-label small fw-semibold d-flex justify-content-between align-items-center mb-1">
                                        <span>🎬 Poster Image (PNG / JPEG)</span>
                                        {movieForm.poster_url && (
                                            <span className="text-success small fw-normal">✓ Ready</span>
                                        )}
                                    </label>
                                    <input
                                        type="file"
                                        className="form-control mb-2"
                                        accept="image/png, image/jpeg, image/jpg, image/webp"
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) {
                                                handleFileUpload(e.target.files[0], "movie");
                                            }
                                        }}
                                        disabled={uploadingMoviePoster}
                                    />
                                    {uploadingMoviePoster && (
                                        <div className="text-danger small mb-2 d-flex align-items-center gap-2">
                                            <span className="spinner-border spinner-border-sm" role="status"></span>
                                            <span>Uploading poster from your device...</span>
                                        </div>
                                    )}
                                    {/* Thumbnail Preview */}
                                    {movieForm.poster_url && (
                                        <div className="d-flex align-items-center gap-3 p-2 bg-light rounded border mb-2">
                                            <img
                                                src={movieForm.poster_url}
                                                alt="Poster preview"
                                                style={{ width: "45px", height: "60px", objectFit: "cover", borderRadius: "4px" }}
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                            <div className="flex-grow-1 overflow-hidden">
                                                <p className="mb-0 small fw-semibold text-truncate">{movieForm.poster_url}</p>
                                                <span className="badge bg-success-subtle text-success small">Ready</span>
                                            </div>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-secondary"
                                                onClick={() => setMovieForm(prev => ({ ...prev, poster_url: "" }))}
                                                title="Remove image"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )}
                                    {/* External URL Fallback */}
                                    <details className="mt-1">
                                        <summary className="small text-muted" style={{ cursor: "pointer" }}>
                                            Or paste an image URL instead
                                        </summary>
                                        <input
                                            className="form-control form-control-sm mt-1"
                                            placeholder="https://..."
                                            value={movieForm.poster_url}
                                            onChange={e => setMovieForm({...movieForm, poster_url: e.target.value})}
                                        />
                                    </details>
                                </div>

                                <label className="form-label small fw-semibold">Overview / Description</label>
                                <textarea className="form-control mb-3" placeholder="Brief synopsis..." rows="3" value={movieForm.description} onChange={e => setMovieForm({...movieForm, description: e.target.value})}></textarea>

                                <div className="d-flex gap-2">
                                    <button type="submit" className="btn btn-danger flex-grow-1">
                                        {editingMovieId ? "Update Movie" : "Save Movie & Create Seats"}
                                    </button>
                                    {editingMovieId && (
                                        <button type="button" onClick={handleCancelMovieEdit} className="btn btn-secondary">
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Right: Existing Movies Table */}
                    <div className="col-md-7">
                        <div className="card p-4 shadow-sm border-0" style={{ borderRadius: "12px" }}>
                            <h5 className="fw-bold mb-3">🎬 Existing Movies</h5>
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead>
                                        <tr>
                                            <th>Title</th>
                                            <th>Genre</th>
                                            <th>Status</th>
                                            <th className="text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {movies.map(m => (
                                            <tr key={m.movie_id}>
                                                <td>
                                                    <strong>{m.title}</strong><br/>
                                                    <small className="text-muted">{m.language} | {m.duration}m | ⭐{m.rating}</small>
                                                </td>
                                                <td>{m.genre}</td>
                                                <td>
                                                    <span className={`badge ${m.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'}`}>{m.status}</span>
                                                </td>
                                                <td className="text-end">
                                                    <div className="btn-group btn-group-sm">
                                                        <button onClick={() => handleEditMovieClick(m)} className="btn btn-outline-primary">
                                                            Edit
                                                        </button>
                                                        <button onClick={() => handleQuickScheduleMovie(m.movie_id)} className="btn btn-outline-success">
                                                            +Show
                                                        </button>
                                                        {m.status === 'ACTIVE' && (
                                                            <button onClick={() => handleDeleteMovie(m.movie_id)} className="btn btn-outline-danger">
                                                                Deactivate
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ==================================================================
               TAB 3: MANAGE EVENTS (FORM + TABLE)
               ================================================================== */}
            {activeTab === 'events' && (
                <div className="row g-4">
                    {/* Left: Event Form */}
                    <div className="col-md-5">
                        <div className="card p-4 shadow-sm border-0" style={{ borderRadius: "12px" }}>
                            <h5 className="fw-bold">{editingEventId ? "✏️ Edit Event Details" : "➕ Add New Event"}</h5>
                            <form onSubmit={handleSaveEvent}>
                                <label className="form-label small fw-semibold">Event Title</label>
                                <input className="form-control mb-2" placeholder="e.g. Arijit Singh Live" value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} required />

                                <label className="form-label small fw-semibold">Category</label>
                                <input className="form-control mb-2" placeholder="Music Concert, Comedy, Conference" value={eventForm.category} onChange={e => setEventForm({...eventForm, category: e.target.value})} required />

                                <label className="form-label small fw-semibold">Venue Location</label>
                                <input className="form-control mb-2" placeholder="Stadium, Hall name, City" value={eventForm.venue} onChange={e => setEventForm({...eventForm, venue: e.target.value})} required />

                                <div className="row g-2 mb-2">
                                    <div className="col-7">
                                        <label className="form-label small fw-semibold">Date & Time</label>
                                        <input type="datetime-local" className="form-control" value={eventForm.event_date} onChange={e => setEventForm({...eventForm, event_date: e.target.value})} required />
                                    </div>
                                    <div className="col-5">
                                        <label className="form-label small fw-semibold">Price (₹)</label>
                                        <input type="number" className="form-control" placeholder="499" value={eventForm.ticket_price} onChange={e => setEventForm({...eventForm, ticket_price: Number(e.target.value)})} required />
                                    </div>
                                </div>

                                {/* PNG / JPEG Event Poster File Upload */}
                                <div className="mb-3">
                                    <label className="form-label small fw-semibold d-flex justify-content-between align-items-center mb-1">
                                        <span>🎪 Poster Image (PNG / JPEG)</span>
                                        {eventForm.poster_url && (
                                            <span className="text-success small fw-normal">✓ Ready</span>
                                        )}
                                    </label>
                                    <input
                                        type="file"
                                        className="form-control mb-2"
                                        accept="image/png, image/jpeg, image/jpg, image/webp"
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) {
                                                handleFileUpload(e.target.files[0], "event");
                                            }
                                        }}
                                        disabled={uploadingEventPoster}
                                    />
                                    {uploadingEventPoster && (
                                        <div className="text-danger small mb-2 d-flex align-items-center gap-2">
                                            <span className="spinner-border spinner-border-sm" role="status"></span>
                                            <span>Uploading poster from your device...</span>
                                        </div>
                                    )}
                                    {eventForm.poster_url && (
                                        <div className="d-flex align-items-center gap-3 p-2 bg-light rounded border mb-2">
                                            <img
                                                src={eventForm.poster_url}
                                                alt="Event poster preview"
                                                style={{ width: "45px", height: "60px", objectFit: "cover", borderRadius: "4px" }}
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                            <div className="flex-grow-1 overflow-hidden">
                                                <p className="mb-0 small fw-semibold text-truncate">{eventForm.poster_url}</p>
                                                <span className="badge bg-success-subtle text-success small">Ready</span>
                                            </div>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-secondary"
                                                onClick={() => setEventForm(prev => ({ ...prev, poster_url: "" }))}
                                                title="Remove image"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )}
                                    <details className="mt-1">
                                        <summary className="small text-muted" style={{ cursor: "pointer" }}>
                                            Or paste an image URL instead
                                        </summary>
                                        <input
                                            className="form-control form-control-sm mt-1"
                                            placeholder="https://..."
                                            value={eventForm.poster_url}
                                            onChange={e => setEventForm({...eventForm, poster_url: e.target.value})}
                                        />
                                    </details>
                                </div>

                                <label className="form-label small fw-semibold">Description</label>
                                <textarea className="form-control mb-3" placeholder="Event details..." rows="3" value={eventForm.description} onChange={e => setEventForm({...eventForm, description: e.target.value})}></textarea>

                                <div className="d-flex gap-2">
                                    <button type="submit" className="btn btn-danger flex-grow-1">
                                        {editingEventId ? "Update Event" : "Save Event"}
                                    </button>
                                    {editingEventId && (
                                        <button type="button" onClick={handleCancelEventEdit} className="btn btn-secondary">
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Right: Existing Events Table */}
                    <div className="col-md-7">
                        <div className="card p-4 shadow-sm border-0" style={{ borderRadius: "12px" }}>
                            <h5 className="fw-bold mb-3">🎪 Existing Events</h5>
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead>
                                        <tr>
                                            <th>Title</th>
                                            <th>Venue</th>
                                            <th>Price</th>
                                            <th className="text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {events.map(ev => (
                                            <tr key={ev.event_id}>
                                                <td>
                                                    <strong>{ev.title}</strong><br/>
                                                    <small className="text-muted">{ev.category}</small>
                                                </td>
                                                <td>{ev.venue}</td>
                                                <td className="fw-bold text-danger">₹{parseFloat(ev.ticket_price).toFixed(0)}</td>
                                                <td className="text-end">
                                                    <div className="btn-group btn-group-sm">
                                                        <button onClick={() => handleEditEventClick(ev)} className="btn btn-outline-primary">
                                                            Edit
                                                        </button>
                                                        {ev.status === 'ACTIVE' && (
                                                            <button onClick={() => handleDeleteEvent(ev.event_id)} className="btn btn-outline-danger">
                                                                Deactivate
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ==================================================================
               TAB 4: SCHEDULE SHOW (FORM)
               ================================================================== */}
            {activeTab === 'shows' && (
                <div className="card p-4 shadow-sm border-0 mx-auto" style={{ maxWidth: "600px", borderRadius: "12px" }}>
                    <h5 className="fw-bold mb-2">🎟️ Schedule Movie Show</h5>
                    <p className="text-muted small mb-3">Publishing a show will automatically generate 20 bookable seats (Rows A to D) for that screening.</p>
                    <form onSubmit={handleScheduleShow}>
                        <label className="form-label small fw-semibold">Select Movie</label>
                        <select className="form-select mb-3" value={showForm.movie_id} onChange={e => setShowForm({...showForm, movie_id: e.target.value})} required>
                            <option value="">-- Choose Movie --</option>
                            {movies.filter(m => m.status === 'ACTIVE').map(m => (
                                <option key={m.movie_id} value={m.movie_id}>{m.title}</option>
                            ))}
                        </select>

                        <label className="form-label small fw-semibold">Auditorium / Screen</label>
                        <input className="form-control mb-3" placeholder="Audi 1 - IMAX" value={showForm.screen_name} onChange={e => setShowForm({...showForm, screen_name: e.target.value})} required />

                        <label className="form-label small fw-semibold">Date & Time</label>
                        <input type="datetime-local" className="form-control mb-3" value={showForm.show_datetime} onChange={e => setShowForm({...showForm, show_datetime: e.target.value})} required />

                        <label className="form-label small fw-semibold">Ticket Price (₹)</label>
                        <input type="number" className="form-control mb-4" placeholder="300" value={showForm.ticket_price} onChange={e => setShowForm({...showForm, ticket_price: Number(e.target.value)})} required />

                        <button type="submit" className="btn btn-danger w-100 py-2">Publish Show & Generate 20 Seats</button>
                    </form>
                </div>
            )}

            {/* ==================================================================
               TAB 5: ALL BOOKINGS AUDIT (TRANSACTION TABLE)
               ================================================================== */}
            {activeTab === 'bookings' && (
                <div className="card p-4 shadow-sm border-0" style={{ borderRadius: "12px" }}>
                    <h5 className="fw-bold mb-3">📋 Customer Bookings Audit</h5>
                    <div className="table-responsive">
                        <table className="table table-striped table-hover align-middle">
                            <thead>
                                <tr>
                                    <th>Ref</th>
                                    <th>Customer</th>
                                    <th>Title</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map(b => (
                                    <tr key={b.booking_id}>
                                        <td>#{b.booking_id}</td>
                                        <td>
                                            <strong>{b.customer_name}</strong><br/>
                                            <small className="text-muted">{b.customer_email}</small>
                                        </td>
                                        <td>{b.title}</td>
                                        <td>{new Date(b.booking_date).toLocaleString()}</td>
                                        <td className="fw-bold text-danger">₹{parseFloat(b.total_amount).toFixed(0)}</td>
                                        <td>
                                            <span className={`badge ${b.status === 'CONFIRMED' ? 'bg-success' : 'bg-danger'}`}>
                                                {b.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;