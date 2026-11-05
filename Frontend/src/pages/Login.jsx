import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();
        setError("");
        setLoading(true);

        try {

            const response = await api.post("/auth/login", formData);

            localStorage.setItem(
                "cinebookToken",
                response.data.token
            );

            localStorage.setItem(
                "cinebookUser",
                JSON.stringify(response.data.user)
            );

            navigate("/");

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Unable to login. Please try again."
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

                {error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <label>Email Address</label>

                    <input
                        type="email"
                        name="email"
                        className="form-control mb-3"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <label>Password</label>

                    <input
                        type="password"
                        name="password"
                        className="form-control mb-3"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <button
                        type="submit"
                        className="btn btn-danger w-100 mt-3"
                        disabled={loading}
                    >

                        {loading ? "Logging in..." : "Login"}

                    </button>

                </form>

                <p className="auth-link">

                    Don't have an account?

                    <Link to="/register"> Register</Link>

                </p>

            </div>

        </div>

    );

}

export default Login;