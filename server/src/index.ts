import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import Utility from "./utils/Utilite";
import MainRoute from "./routes/main.route";
import cookieParser from "cookie-parser";
import path from "path";

export const app = express();
export const prisma = new PrismaClient();

const allowedOrigins = new Set([
    "https://mgdigitalkeys.store",
    "https://www.mgdigitalkeys.store",
    "https://admin.mgdigitalkeys.store",
    "https://mini-app-mzu6.onrender.com",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173"
]);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.has(origin)) {
            callback(null, true);
            return;
        }

        // Allow common preview and local development hosts.
        if (origin.includes("vercel.app") || origin.includes("netlify.app") || origin.includes("localhost") || origin.includes("127.0.0.1")) {
            callback(null, true);
            return;
        }

        callback(null, false);
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

app.get("/ping-db", async (req, res) => {
    try {
        const count = await prisma.product.count();
        res.json({ success: true, count });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message, stack: e.stack });
    }
});

app.use(MainRoute);

app.use(Utility.Error_Handler);
app.use(Utility.NotFound);

