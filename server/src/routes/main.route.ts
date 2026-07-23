import { Router } from "express";
import UserRoute from "./user.route";
import ShopRoute from "./shop.route";

const MainRoute = Router();
MainRoute.use("/user", UserRoute);
MainRoute.use("/shop", ShopRoute);

export default MainRoute;