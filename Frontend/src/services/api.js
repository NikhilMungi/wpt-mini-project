// ==============================================================================
// 🌐 CENTRAL HTTP API CLIENT (api.js)
// ==============================================================================
// PURPOSE:
// In modern web applications, the frontend (React) communicates with the backend (Express)
// by sending HTTP network requests (GET, POST, PUT, DELETE).
//
// Instead of manually writing `fetch("http://localhost:5000/api/movies")` in dozens of
// different React files, we create a single, centralized Axios client here.
//
// BENEFITS FOR VIVA DEFENSE:
// 1. DRY Principle (Don't Repeat Yourself): The base URL is configured in exactly one place.
// 2. Production Ready: When deploying to cloud/production, we only have to change `baseURL` here.
// 3. Easy Usage: Any component can simply write `api.get("/movies")` or `api.post("/auth/login")`.
// ==============================================================================

import axios from "axios";

// Create an Axios instance with pre-configured default settings
const api = axios.create({
    // All requests made with `api` will automatically prepend this URL
    baseURL: "http://localhost:5000/api",
    
    // Optional timeout in milliseconds: cancels the request if backend takes > 10 seconds
    timeout: 10000
});

// Export the configured instance for use throughout all React pages and components
export default api;