import { Router } from "express";
import { getProducts, getCategories, getProductById, createOrder, createAbaPayment, abaWebhook, createPaypalPayment } from "../module/shop.services";

const ShopRoute = Router();

ShopRoute.get("/products", getProducts);
ShopRoute.get("/products/:id", getProductById);
ShopRoute.get("/categories", getCategories);
ShopRoute.post("/orders", createOrder);
ShopRoute.post("/aba-checkout", createAbaPayment);
ShopRoute.post("/aba-webhook", abaWebhook);
ShopRoute.post("/paypal-checkout", createPaypalPayment);

export default ShopRoute;
