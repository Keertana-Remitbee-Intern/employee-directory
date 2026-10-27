const multer = require("multer");
const path = require("path");

const uploadPath = path.join(__dirname,"..","uploads");
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() +
            "-" +
            file.originalname;
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes =
        /jpeg|jpg|png/;
    const extension =
        allowedTypes.test(
            path.extname(
                file.originalname
            ).toLowerCase()
        );
    const mimeType =
        allowedTypes.test(
            file.mimetype
        );
    if (extension && mimeType) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Only JPG, JPEG and PNG files are allowed"
            )
        );
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

module.exports = upload;