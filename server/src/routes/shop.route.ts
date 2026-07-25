import { Router } from "express";
import { getProducts, getCategories, getProductById, createOrder, createAbaPayment, abaWebhook, createPaypalPayment, getBanners, createBanner, updateBanner, deleteBanner } from "../module/shop.services";

const ShopRoute = Router();

ShopRoute.get("/products", getProducts);
ShopRoute.get("/products/:id", getProductById);
ShopRoute.get("/categories", getCategories);
ShopRoute.get("/banners", getBanners);
ShopRoute.post("/banners", createBanner);
ShopRoute.patch("/banners/:id", updateBanner);
ShopRoute.delete("/banners/:id", deleteBanner);
ShopRoute.post("/orders", createOrder);
ShopRoute.post("/aba-checkout", createAbaPayment);
ShopRoute.post("/aba-webhook", abaWebhook);
ShopRoute.post("/paypal-checkout", createPaypalPayment);

export default ShopRoute;
