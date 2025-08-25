import DBConnection from "./db/dbConnection.js"
import dotenv from "dotenv"
import app from "./app.js"

dotenv.config(
    {
        path: "./.env",
    }
);

DBConnection()
.then(() => {
    const port = process.env.PORT || 8080;
    app.on("error", (error) => {
        console.log("ERROR: ", error);
    });
    app.listen(port, () => {
        console.log(`Server is Running at http://localhost:${port}`);
    })
})
.catch((error) => {
    console.log("Database Connection Failed:", error);
})

const port = process.env.PORT;
