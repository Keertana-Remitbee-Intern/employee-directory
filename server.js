require("dotenv").config();
const app = require("./app");
const sequelize = require("./config/database");
const PORT = process.env.PORT || 3000;

async function startServer() {
    try{
        await sequelize.authenticate();
        console.log("Database connected Sucessfully!!");
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error){
        console.error("Unable to connect to the database:", error.message);
        process.exitCode =1;
    }
} 
startServer();