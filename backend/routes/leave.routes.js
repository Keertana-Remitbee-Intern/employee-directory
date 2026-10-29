const express = require("express");
const leaveController = require("../controllers/leave.controller");
const {
    authenticate,
    authorize
} = require("../middleware/auth.middleware");

const router = express.Router();

router.get(
    "/",
    authenticate,
    authorize("admin"),
    leaveController.getAllLeaves
);

router.get(
    "/mine",
    authenticate,
    authorize("employee"),
    leaveController.getMyLeaves
);

router.post(
    "/",
    authenticate,
    authorize("employee"),
    leaveController.createLeave
);

router.patch(
    "/:id/status",
    authenticate,
    authorize("admin"),
    leaveController.updateLeaveStatus
);

module.exports = router;
