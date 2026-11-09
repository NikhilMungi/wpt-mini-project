// ==============================================================================
// 📬 CONTACT & CUSTOMER SUPPORT INQUIRIES (Contact.jsx)
// ==============================================================================
// PURPOSE:
// Provides customers with a direct inquiry and feedback form.
// Features:
// 1. Support Information: Displays headquarters location, support email, phone, and hours.
// 2. Interactive Form: Collects name, email, subject, and message.
// 3. Client Validation: Enforces email pattern matching and complete field submission.
// 4. Instant Visual Feedback: Displays a green success banner upon form submission.
// ==============================================================================

import { useState } from "react";

function Contact() {
    // --------------------------------------------------------------------------
    // FORM STATE HOOKS
    // --------------------------------------------------------------------------
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });

    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    // --------------------------------------------------------------------------
    // SUBMISSION & VALIDATION HANDLER
    // --------------------------------------------------------------------------
    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");

        // Check required fields
        if (!formData.name || !formData.email || !formData.subject || !formData.message) {
            setError("All fields are required.");
            return;
        }

        // Email regex pattern validation
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            setError("Please enter a valid email address.");
            return;
        }

        // Trigger success feedback and clear form fields
        setSubmitted(true);
        setFormData({ name: "", email: "", subject: "", message: "" });
    };

    return (
        <div className="container py-5">
            {/* Page Header */}
            <div className="text-center mb-5">
                <h1 className="fw-bold text-danger">📬 Get In Touch</h1>
                <p className="lead text-secondary">Have questions or feedback? We’d love to hear from you.</p>
            </div>

            <div className="row g-4">
                {/* Left Column: Contact Support Cards */}
                <div className="col-lg-5">
                    <div className="card bg-dark text-white p-4 h-100 shadow border-0" style={{ borderRadius: "14px" }}>
                        <h4 className="text-danger mb-4">Contact Information</h4>

                        <div className="mb-4">
                            <h6 className="text-warning">📍 Location</h6>
                            <p className="text-light mb-0 small">CineBook Headquarters, Tech Park, Pune, Maharashtra</p>
                        </div>

                        <div className="mb-4">
                            <h6 className="text-warning">📧 Email Support</h6>
                            <p className="text-light mb-0 small">support@cinebook.com</p>
                        </div>

                        <div className="mb-4">
                            <h6 className="text-warning">📞 Phone Inquiries</h6>
                            <p className="text-light mb-0 small">+91 (020) 2588-9900</p>
                        </div>

                        <div className="mb-0">
                            <h6 className="text-warning">⏰ Support Hours</h6>
                            <p className="text-light mb-0 small">Monday – Saturday: 9:00 AM – 9:00 PM IST</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Inquiry Message Form */}
                <div className="col-lg-7">
                    <div className="card shadow-sm p-4 border-0" style={{ borderRadius: "14px" }}>
                        <h4 className="mb-3 fw-bold">Send Us a Message</h4>

                        {/* Submission Success Alert */}
                        {submitted && (
                            <div className="alert alert-success">
                                🎉 Thank you! Your message has been received. Our support team will get back to you shortly.
                            </div>
                        )}

                        {/* Error Alert */}
                        {error && (
                            <div className="alert alert-danger">{error}</div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {/* Name */}
                            <div className="mb-3">
                                <label className="form-label small fw-semibold">Full Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter your name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div className="mb-3">
                                <label className="form-label small fw-semibold">Email Address</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Subject */}
                            <div className="mb-3">
                                <label className="form-label small fw-semibold">Subject</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g. Booking Query, Technical Assistance"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Message */}
                            <div className="mb-4">
                                <label className="form-label small fw-semibold">Message</label>
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    placeholder="Write your message here..."
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    required
                                ></textarea>
                            </div>

                            {/* Submit Button */}
                            <button type="submit" className="btn btn-danger w-100 py-2">
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Contact;