import { verifyToken } from "../utils/jwt.js";

export const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw { status: 401, message: "No token provided" };
        }

        const token = authHeader.split(" ")[1];
        const decoded = verifyToken(token);

        req.context = {
            storeId: decoded.storeId,
            role: decoded.role,
            userId: decoded.userId
        };

        next();
    } catch (err) {
        next(err);
    }
};

export const authorize = (roles = []) => {
    return (req, res, next) => {
        if (!req.context || !req.context.role) {
            return next({ status: 401, message: "Unauthorized" });
        }

        if (roles.length && !roles.includes(req.context.role)) {
            return next({ status: 403, message: "Forbidden" });
        }

        next();
    };
};
