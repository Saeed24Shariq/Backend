import express from "express";
import DBConnection from "./db/dbConnection.js"
import dotenv from "dotenv"

dotenv.config();

const app = express();


DBConnection();

const port = process.env.PORT;

app.listen( port, () =>{
    console.log(`Server is Listening at http://localhost:${port}`);
} );