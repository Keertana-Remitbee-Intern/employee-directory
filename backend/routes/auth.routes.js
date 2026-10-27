const express = require("express");
const authController = require( "../controllers/auth.controller");
const {signupValidator,loginValidator} = require("../validators/auth.validator");
const validate = require("../middleware/validation.middleware");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication endpoints
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupRequest'
 *     responses:
 *       201:
 *         description: Signup successful
 *       409:
 *         description: User already exists
 *       422:
 *         description: Validation failed
 */
router.post(
    "/signup",
    signupValidator,
    validate,
    authController.signup
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid email or password
 *       422:
 *         description: Validation failed
 */
router.post(
    "/login",
    loginValidator,
    validate,
    authController.login
);

module.exports = router;
