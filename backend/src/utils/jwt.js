import jwt from "jsonwebtoken";

export const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw { status: 401, message: "Invalid or expired token" };
    }
};

export const signToken = (payload, expiresIn = "1d") => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};
