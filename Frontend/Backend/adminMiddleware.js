// ==============================================================================
// 👑 ADMIN AUTHORIZATION MIDDLEWARE (adminMiddleware.js)
// ==============================================================================
// PURPOSE:
// This middleware implements "Role-Based Access Control" (RBAC).
// While `authMiddleware.js` confirms *who* a user is (Authentication),
// this middleware confirms *what permissions* they have (Authorization).
// It ensures that only accounts with role = 'ADMIN' can add movies, cancel user
// reservations, schedule shows, or upload posters.
// ==============================================================================

/**
 * adminOnly Middleware
 * Must always be used AFTER verifyToken, because it relies on `req.user`.
 */
const adminOnly = (req, res, next) => {
    // Check if the user object exists on the request AND their role is strictly 'ADMIN'
    if (!req.user || req.user.role !== "ADMIN") {
        // HTTP 403 Forbidden: The client is authenticated, but does not have permission
        // to perform administrative actions.
        return res.status(403).json({
            message: "Access forbidden: Admin privileges required to perform this action."
        });
    }

    // User is confirmed to be an ADMIN, so permit them through to the admin controller!
    next();
};

// Export for use in adminRoutes: `router.use(verifyToken, adminOnly)`
module.exports = adminOnly;
