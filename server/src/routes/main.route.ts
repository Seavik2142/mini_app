import { Router } from "express";
import UserRoute from "./user.route";
import ShopRoute from "./shop.route";
import AdminRoute from "./admin.route";

const MainRoute = Router();
MainRoute.use("/user", UserRoute);
MainRoute.use("/shop", ShopRoute);
MainRoute.use("/admin-api", AdminRoute);

export default MainRoute;