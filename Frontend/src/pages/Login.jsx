// ==============================================================================
// 🔑 USER LOGIN PAGE (Login.jsx)
// ==============================================================================
// PURPOSE:
// Provides the authentication entry point for CineBook customers and administrators.
// Workflow:
// 1. User submits email and password.
// 2. Client sends POST request to `/api/auth/login`.
// 3. On success, stores the returned JWT token and user profile object into `localStorage`.
// 4. Redirects the user back to the homepage (`/`).
// ==============================================================================

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
    const navigate = useNavigate();

    // --------------------------------------------------------------------------
    // FORM STATE
    // --------------------------------------------------------------------------
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Unified input change handler
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Helper: auto-populates credentials for fast evaluation / viva defense demo
    const handleQuickFill = (email, password) => {
        setFormData({ email, password });
    };

    // --------------------------------------------------------------------------
    // SUBMISSION HANDLER
    // --------------------------------------------------------------------------
    const handleSubmit = async (e) => {
        // Prevent default browser HTML form reload
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // Send login request to backend
            const response = await api.post("/auth/login", formData);

            // SAVE CREDENTIALS TO BROWSER LOCALSTORAGE
            // `cinebookToken`: Cryptographically signed JWT used for subsequent authorized API calls
            // `cinebookUser`: Serialized profile JSON ({ user_id, full_name, email, role })
            localStorage.setItem("cinebookToken", response.data.token);
            localStorage.setItem("cinebookUser", JSON.stringify(response.data.user));

            // Redirect user to homepage
            navigate("/");
        } catch (error) {
            console.error("Login failure:", error);
            setError(
                error.response?.data?.message ||
                "Unable to login. Please verify your email and password."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Welcome Back!</h2>
                <p>Login to your CineBook account</p>

                {/* Error Banner */}
                {error && (
                    <div className="alert alert-danger py-2 small mb-3">
                        {error}
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit}>
                    {/* Email Input */}
                    <label className="form-label">Email Address</label>
                    <input
                        type="email"
                        name="email"
                        className="form-control mb-3"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    {/* Password Input */}
                    <label className="form-label">Password</label>
                    <input
                        type="password"
                        name="password"
                        className="form-control mb-3"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="btn btn-danger w-100 mt-2 py-2"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                {/* Viva Demo Quick-Fill Buttons */}
                <div className="p-2 bg-light rounded mt-3 text-center border">
                    <small className="text-muted d-block mb-1">⚡ Quick Fill Demo Accounts:</small>
                    <div className="d-flex justify-content-center gap-2">
                        <button
                            type="button"
                            onClick={() => handleQuickFill("admin@cinebook.com", "Admin@123")}
                            className="btn btn-outline-dark btn-sm py-0 px-2"
                            style={{ fontSize: "12px" }}
                        >
                            Admin Demo
                        </button>
                        <button
                            type="button"
                            onClick={() => handleQuickFill("user@cinebook.com", "User@123")}
                            className="btn btn-outline-secondary btn-sm py-0 px-2"
                            style={{ fontSize: "12px" }}
                        >
                            User Demo
                        </button>
                    </div>
                </div>

                {/* Registration Link */}
                <div className="auth-link">
                    Don't have an account? <Link to="/register">Sign up</Link>
                </div>
            </div>
        </div>
    );
}

export default Login;