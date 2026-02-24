const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.context || !req.context.role) {
            return next({ status: 401, message: "Unauthorized" });
        }

        const userRole = req.context.role;
        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

        if (!roles.includes(userRole)) {
            return next({ status: 403, message: "Forbidden: Insufficient permissions" });
        }

        next();
    };
};

export default requireRole;
