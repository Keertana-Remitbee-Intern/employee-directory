const multer = require("multer");
const logger = require("./logger.middleware");

const errorHandler = (err,req,res,next) => {
    logger.error("Application error", {
        message: err.message,
        method: req.method,
        path: req.originalUrl
    });
    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            message: err.message
        });
    }
    if (
        err.message === "Only JPG, JPEG and PNG files are allowed"
    ) {
        return res.status(400).json({
            message: err.message
        });
    }
    res.status(500).json({
        message: "Internal server error"
    });
};

module.exports = errorHandler;