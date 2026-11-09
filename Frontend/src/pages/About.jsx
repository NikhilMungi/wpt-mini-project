// ==============================================================================
// ℹ️ ABOUT US & PROJECT ARCHITECTURE PAGE (About.jsx)
// ==============================================================================
// PURPOSE:
// Serves as an academic and promotional overview of CineBook.
// It clearly outlines:
// 1. Mission statement and business domain (Cinema & Live Events ticketing).
// 2. Core architectural capabilities (Interactive seat matrix, RBAC security, ACID transactions).
// 3. Complete technology stack breakdown (React 19, Node.js/Express, MySQL 3NF, JWT, Bcrypt).
// ==============================================================================

function About() {
    return (
        <div className="container py-5">
            {/* Header Banner */}
            <div className="text-center mb-5">
                <h1 className="fw-bold text-danger">🎬 About CineBook</h1>
                <p className="lead text-secondary">
                    Your premier all-in-one destination for movie tickets and live event experiences.
                </p>
            </div>

            {/* Mission & Feature Highlights */}
            <div className="row g-4 mb-5 align-items-center">
                {/* Left Column: Platform Mission */}
                <div className="col-lg-6">
                    <h3 className="fw-bold mb-3">Our Mission</h3>
                    <p className="text-secondary" style={{ lineHeight: "1.7" }}>
                        CineBook was developed as a modern, high-performance web platform designed to streamline online ticket reservations. 
                        By providing dynamic seat selection, real-time availability tracking, instant booking confirmations, and hassle-free 
                        cancellations, CineBook eliminates physical queuing and simplifies leisure planning.
                    </p>
                    <p className="text-secondary" style={{ lineHeight: "1.7" }}>
                        Whether it’s the latest blockbuster movie in IMAX or an exclusive live comedy show, CineBook connects audiences with 
                        unforgettable entertainment.
                    </p>
                </div>

                {/* Right Column: Key Architecture Highlights */}
                <div className="col-lg-6">
                    <div className="card bg-dark text-white p-4 shadow border-0" style={{ borderRadius: "14px" }}>
                        <h4 className="text-warning mb-3">⚡ Platform Highlights</h4>
                        <ul className="list-unstyled mb-0 d-flex flex-column gap-3">
                            <li className="d-flex align-items-start gap-2">
                                <span className="fs-5">🎟️</span>
                                <div>
                                    <strong>Interactive Seat Matrix:</strong>
                                    <p className="text-light small mb-0">Real-time visual seat booking with zero double-booking risk via ACID transactions.</p>
                                </div>
                            </li>
                            <li className="d-flex align-items-start gap-2">
                                <span className="fs-5">🔐</span>
                                <div>
                                    <strong>Role-Based Security:</strong>
                                    <p className="text-light small mb-0">Segregated user journeys for standard patrons and platform administrators.</p>
                                </div>
                            </li>
                            <li className="d-flex align-items-start gap-2">
                                <span className="fs-5">🔄</span>
                                <div>
                                    <strong>Instant Cancellation:</strong>
                                    <p className="text-light small mb-0">One-click reservation cancel with automatic seat release.</p>
                                </div>
                            </li>
                            <li className="d-flex align-items-start gap-2">
                                <span className="fs-5">🎪</span>
                                <div>
                                    <strong>Unified Catalog:</strong>
                                    <p className="text-light small mb-0">Seamless browsing across both movie screenings and live concerts.</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Technology Architecture Section */}
            <div className="card shadow-sm p-4 mb-5 border-0" style={{ borderRadius: "14px" }}>
                <h3 className="fw-bold mb-4 text-center">💻 Technology Architecture</h3>
                <div className="row g-4 text-center">
                    {/* 1. Frontend */}
                    <div className="col-md-3">
                        <div className="p-3 bg-light rounded h-100">
                            <h5 className="fw-bold text-danger">Frontend</h5>
                            <p className="small text-muted mb-0">React 19, Vite, React Router v7, Bootstrap 5, Axios</p>
                        </div>
                    </div>
                    {/* 2. Backend */}
                    <div className="col-md-3">
                        <div className="p-3 bg-light rounded h-100">
                            <h5 className="fw-bold text-primary">Backend</h5>
                            <p className="small text-muted mb-0">Node.js, Express.js RESTful API Architecture, Multer</p>
                        </div>
                    </div>
                    {/* 3. Database */}
                    <div className="col-md-3">
                        <div className="p-3 bg-light rounded h-100">
                            <h5 className="fw-bold text-success">Database</h5>
                            <p className="small text-muted mb-0">MySQL Relational DB, Normalized to 3NF</p>
                        </div>
                    </div>
                    {/* 4. Security */}
                    <div className="col-md-3">
                        <div className="p-3 bg-light rounded h-100">
                            <h5 className="fw-bold text-warning">Security</h5>
                            <p className="small text-muted mb-0">JSON Web Tokens (JWT), Bcrypt Password Hashing</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default About;