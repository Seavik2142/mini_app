import { Router } from "express";
import { getProducts, getCategories, getProductById, createOrder } from "../module/shop.services";

const ShopRoute = Router();

ShopRoute.get("/products", getProducts);
ShopRoute.get("/products/:id", getProductById);
ShopRoute.get("/categories", getCategories);
ShopRoute.post("/orders", createOrder);

export default ShopRoute;
