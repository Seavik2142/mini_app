import { Router } from "express";
import user from "../module/user.services";
import { UserVaildation } from "../utils/Middleware";

const UserRoute = Router();

// ── New Telegram Bot Deep Link OTP ──────────────────
UserRoute.post("/otp/request", user.requestOtp);   // Step 1: get sessionId + deepLink
UserRoute.post("/otp/verify",  user.verifyOtp);    // Step 2: verify code

// ── Legacy phone-based OTP (kept for compatibility) ─
UserRoute.post("/send-sms",    user.sendSms);
UserRoute.post("/verify-sms",  user.verifySms);

// ── Auth ─────────────────────────────────────────────
UserRoute.post("/login",       user.create_user);
UserRoute.get("/me",           UserVaildation, user.getUser);
UserRoute.patch("/intro",      UserVaildation, user.introShowed);
UserRoute.patch("/wallet",     UserVaildation, user.storeAddress);

export default UserRoute;