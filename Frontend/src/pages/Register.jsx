import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (!/^\d{10}$/.test(formData.phone)) {
            setError("Enter a valid 10-digit mobile number");
            return;
        }

        setLoading(true);

        try {

            const { confirmPassword, ...userData } = formData;

            await api.post("/auth/register", userData);

            alert("Registration successful!");

            navigate("/login");

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Registration failed"
            );

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="auth-container">

            <div className="auth-card">

                <h2>Create Account</h2>

                <p>Join CineBook today!</p>

                {error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <label>Full Name</label>

                    <input
                        type="text"
                        name="full_name"
                        className="form-control mb-3"
                        placeholder="Enter full name"
                        value={formData.full_name}
                        onChange={handleChange}
                        required
                    />

                    <label>Email</label>

                    <input
                        type="email"
                        name="email"
                        className="form-control mb-3"
                        placeholder="Enter email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <label>Phone Number</label>

                    <input
                        type="tel"
                        name="phone"
                        className="form-control mb-3"
                        placeholder="Enter phone number"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                    />

                    <label>Password</label>

                    <input
                        type="password"
                        name="password"
                        className="form-control mb-3"
                        placeholder="Create password"
                        value={formData.password}
                        onChange={handleChange}
                        minLength="6"
                        required
                    />

                    <label>Confirm Password</label>

                    <input
                        type="password"
                        name="confirmPassword"
                        className="form-control mb-3"
                        placeholder="Confirm password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />

                    <button
                        type="submit"
                        className="btn btn-danger w-100"
                        disabled={loading}
                    >
                        {loading ? "Creating account..." : "Register"}
                    </button>

                </form>

                <p className="auth-link">
                    Already registered?
                    <Link to="/login"> Login</Link>
                </p>

            </div>

        </div>

    );

}

export default Register;