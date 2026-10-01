const authService = require("../services/auth.service");
const logger = require("../middleware/logger.middleware");

const sanitizeUser = (user) => {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        department: user.department,
        role: user.role,
        photo: user.photo
    };
};

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
        res.status(201).json({
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
        const result = await authService.login(
            email,
            password
        );
        if (!result) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }
        logger.info("User logged in", {
            userId: result.user.id,
            email: result.user.email
        });
        res.status(200).json({
            message: "Login successful",
            token: result.token,
            user: sanitizeUser(result.user)
        });
    } catch (error) {
        next(error);
    }
};