const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500
    let message = err.message || "Server error"

    if (err.name === "CastError" && err.kind === "ObjectId") {
        statusCode = 404
        message = "Resource not found"
    }

    if (err.name === "ValidationError") {
        statusCode = 400
        message = Object.values(err.errors)
            .map((value) => value.message)
            .join(", ")
    }

    if (err.code === 11000) {
        statusCode = 409
        message = "Duplicate field value"
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    })
}

export default errorHandler
