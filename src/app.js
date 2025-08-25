import cookieParser from "cookie-parser";
import express from "express"
import cors from "cors";
const app = express();

app.use(cors(
    {
        origin: process.env.CORS_ORIGIN,
        credentials: true
    }
));
app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({limit: "16kb"}));
app.use(express.static("public"));
app.use(cookieParser());

// importing Router
import router from "./routes/router.js"


// using router
app.use("/api/v1/user", router);


export default app;