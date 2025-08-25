import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
const DBConnection = async () => {
    try{
        console.log(`${process.env.DATABASE_URI}${DB_NAME}`);
        const connectionInstance = await mongoose.connect(`${process.env.DATABASE_URI}${DB_NAME}`);
        console.log(`Connection Created || Host: ${connectionInstance.connection.host}`);
    }
    catch(error){
        console.error("DB Connection Failed", error);
        throw error;
    }
}

export default DBConnection;