export const errorHandler = (err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || "Internal Server Error";
    if (status >= 500) {
        console.error(err);
    }

    res.status(status).json({
        error: {
            message,
            ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
            ...(err.warnings && { warnings: err.warnings }),
        },
    });
};
