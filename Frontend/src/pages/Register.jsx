// ==============================================================================
// 📝 NEW USER REGISTRATION PAGE (Register.jsx)
// ==============================================================================
// PURPOSE:
// Provides the sign-up form for new customers.
// Features:
// 1. Client-Side Input Validation:
//    - Ensures password and confirmPassword match.
//    - Validates 10-digit phone number format via regex.
//    - Enforces 6+ character minimum password length.
// 2. Submits clean user payload to backend: POST /api/auth/register.
// 3. On success, alerts user and redirects to `/login`.
// ==============================================================================

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
    const navigate = useNavigate();

    // --------------------------------------------------------------------------
    // REGISTRATION FORM STATE
    // --------------------------------------------------------------------------
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Handles user keystrokes in any form input
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // --------------------------------------------------------------------------
    // FORM SUBMISSION & CLIENT-SIDE VALIDATION
    // --------------------------------------------------------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Check 1: Do the two passwords match?
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match. Please re-enter.");
            return;
        }

        // Check 2: Is phone number a valid 10-digit number?
        if (!/^\d{10}$/.test(formData.phone)) {
            setError("Please enter a valid 10-digit mobile phone number.");
            return;
        }

        setLoading(true);

        try {
            // Strip `confirmPassword` from the payload before sending to backend (database does not need it)
            const { confirmPassword, ...userData } = formData;

            // Send registration data to POST /api/auth/register
            await api.post("/auth/register", userData);

            alert("Registration successful! Please login with your credentials.");
            navigate("/login");
        } catch (error) {
            console.error("Registration error:", error);
            setError(
                error.response?.data?.message ||
                "Registration failed. An account with this email or phone may already exist."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Create Account</h2>
                <p>Join CineBook today to book movie and event tickets!</p>

                {/* Validation Error Alert */}
                {error && (
                    <div className="alert alert-danger py-2 small mb-3">
                        {error}
                    </div>
                )}

                {/* Sign Up Form */}
                <form onSubmit={handleSubmit}>
                    {/* Full Name */}
                    <label className="form-label">Full Name</label>
                    <input
                        type="text"
                        name="full_name"
                        className="form-control mb-3"
                        placeholder="e.g. Rahul Sharma"
                        value={formData.full_name}
                        onChange={handleChange}
                        required
                    />

                    {/* Email */}
                    <label className="form-label">Email Address</label>
                    <input
                        type="email"
                        name="email"
                        className="form-control mb-3"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    {/* Mobile Phone */}
                    <label className="form-label">Phone Number</label>
                    <input
                        type="tel"
                        name="phone"
                        className="form-control mb-3"
                        placeholder="10-digit mobile number"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                    />

                    {/* Password */}
                    <label className="form-label">Password</label>
                    <input
                        type="password"
                        name="password"
                        className="form-control mb-3"
                        placeholder="Create strong password (min 6 chars)"
                        value={formData.password}
                        onChange={handleChange}
                        minLength="6"
                        required
                    />

                    {/* Confirm Password */}
                    <label className="form-label">Confirm Password</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        className="form-control mb-3"
                        placeholder="Re-enter password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="btn btn-danger w-100 mt-2 py-2"
                        disabled={loading}
                    >
                        {loading ? "Creating account..." : "Register"}
                    </button>
                </form>

                {/* Back to Login link */}
                <p className="auth-link">
                    Already have an account?
                    <Link to="/login"> Login</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;