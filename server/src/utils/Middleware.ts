import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "..";
import { CatchAsync } from "./Utilite";

export const UserVaildation: RequestHandler = CatchAsync(async (req, res, next) => {
    const token = req?.cookies?.auth;

    if (!token) {
        throw new Error("User authentication required (cookie missing).");
    }

    const verify: any = jwt.verify(token, process.env.SECRET as string);
    if (verify?.tgId && verify?.id) {
        const user = await prisma.user.findUniqueOrThrow({
            where: {
                id: verify?.id
            }
        });

        req.user = {
            id: user?.id,
            tgId: user?.tgId
        }

        if (user) next();
    } else {
        throw new Error("User token is invalid.");
    }
});

export const AdminValidation: RequestHandler = CatchAsync(async (req, res, next) => {
    const token = req?.cookies?.admin_auth;

    if (!token) {
        res.status(401).json({ code: 401, message: "Admin authentication required." });
        return;
    }

    try {
        const verify: any = jwt.verify(token, process.env.SECRET as string);
        if (verify?.role === "SUPER_ADMIN") {
            next();
        } else {
            res.status(403).json({ code: 403, message: "Forbidden: Not an admin." });
        }
    } catch (e) {
        res.status(401).json({ code: 401, message: "Invalid admin token." });
    }
});
