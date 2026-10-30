const authService = require("../services/auth.service");
const logger = require("../middleware/logger.middleware");
const fs = require("fs/promises");
const path = require("path");
const { User } = require("../models");

const sanitizeUser = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    photo: user.photo
});

exports.signup = async (req, res, next) => {
    try {
        const result = await authService.signup(req.body);

        if (result.error === "USER_EXISTS") {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        logger.info("New user registered", {
            userId: result.user.id,
            email: result.user.email
        });

        return res.status(201).json({
            message: "Signup successful",
            user: sanitizeUser(result.user)
        });
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const result = await authService.login(email, password);

        if (!result) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        logger.info("User logged in", {
            userId: result.user.id,
            email: result.user.email
        });

        return res.status(200).json({
            message: "Login successful",
            token: result.token,
            user: sanitizeUser(result.user)
        });
    } catch (error) {
        next(error);
    }
};

exports.uploadProfilePhoto = async (req, res, next) => {
    let newPhotoPath = null;

    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Please select a profile picture."
            });
        }

        newPhotoPath = `/uploads/${req.file.filename}`;
        const user = await User.findByPk(req.user.id);
        if (!user) {
            await fs.unlink(req.file.path).catch(() => {});

            return res.status(404).json({
                message: "User not found."
            });
        }

        const oldPhotoPath = user.photo;
        await user.update({
            photo: newPhotoPath
        });

        if (
            oldPhotoPath &&
            oldPhotoPath.startsWith("/uploads/")
        ) {
            const oldFilename = path.basename(oldPhotoPath);
            const oldFilePath = path.join(
                __dirname,
                "..",
                "uploads",
                oldFilename
            );

            await fs.unlink(oldFilePath).catch((error) => {
                console.error(
                    "Could not delete old profile photo:",
                    error.message
                );
            });
        }

        return res.status(200).json({
            message: "Profile picture updated successfully.",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                photo: user.photo
            }
        });
    } catch (error) {
        if (req.file?.path) {
            await fs.unlink(req.file.path).catch(() => {});
        }
        next(error);
    }
};