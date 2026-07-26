import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import Utility from "./utils/Utilite";
import MainRoute from "./routes/main.route";
import cookieParser from "cookie-parser";
import path from "path";

export const app = express();
export const prisma = new PrismaClient();

app.use(cors({
    origin: (origin, callback) => {
        // Dynamically allow requesting origin (Telegram WebApps, Vercel preview URLs, localhost)
        callback(null, true);
    },
    credentials: true
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// Serve static Admin Dashboard files from root /admin directory
app.use("/admin", express.static(path.join(__dirname, "../../admin")));

app.get("/", Utility.CatchAsync(async (req, res) => {
    res.send({
        code: 200,
        msg: "Server is runing",
        data:[]
    })
}))

app.use(MainRoute);

app.use(Utility.Error_Handler);
app.use(Utility.NotFound);

