
export const errorMiddleware = (err, req, res, next) => {
    let statuscode = err.statuscode || 500;
    let message = err.message || "Internal Server Error";


    res.status(statuscode).json({
        success: false,
        message,
    });
};

