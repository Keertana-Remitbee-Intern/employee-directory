const express = require("express");
const dashboardController = require("../controllers/dashboard.controller");
const { authenticate } = require("../middleware/auth.middleware");
const router = express.Router();

router.get(
    "/summary",
    authenticate,
    dashboardController.getSummary
);
module.exports = router;