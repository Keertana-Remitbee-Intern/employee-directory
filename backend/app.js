const express = require("express");
const cors = require("cors");
const path = require("path");
const sequelize = require("./config/database");
const authRoutes = require("./routes/auth.routes");
const employeeRoutes = require("./routes/employee.routes");
const leaveRoutes = require("./routes/leave.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const logger = require("./middleware/logger.middleware");
const errorHandler = require("./middleware/error.middleware");
const { swaggerUi, swaggerSpec } = require("./swagger/swagger");

require("./jobs/dailyLogReport");

const app = express();

app.use(cors({
    origin: "http://localhost:3001",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);

app.use((req, res, next) => {
    logger.info("Incoming request", {
        method: req.method,
        path: req.originalUrl
    });

    next();
});

// Swagger documentation
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);

// API routes
app.use("/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Employee Directory API is running"
    });
});

app.use(errorHandler);

module.exports = app;
