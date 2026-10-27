const express = require("express");
const cors = require("cors");
const path = require("path");
const sequelize = require("./config/database");
const authRoutes = require("./routes/auth.routes");
const employeeRoutes = require("./routes/employee.routes");
const logger = require("./middleware/logger.middleware");
const errorHandler = require("./middleware/error.middleware");
const { swaggerUi, swaggerSpec } = require("./swagger/swagger");

require("./jobs/dailyLogReport");

const app = express();

app.use(express.json());
app.use(cors());

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

app.use("/auth", authRoutes);
app.use("/api/employees", employeeRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Employee Directory API is running"
    });
});

app.use(errorHandler);
module.exports = app;