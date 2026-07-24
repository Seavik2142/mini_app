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
    origin: true,
    credentials: true
}));

app.use(express.json());
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

