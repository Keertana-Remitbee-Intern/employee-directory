const express = require("express");
const authController = require( "../controllers/auth.controller");
const {signupValidator,loginValidator} = require("../validators/auth.validator");
const validate = require("../middleware/validation.middleware");
const router = express.Router();

router.post(
    "/signup",
    signupValidator,
    validate,
    authController.signup
);
router.post(
    "/login",
    loginValidator,
    validate,
    authController.login
);

module.exports = router;
