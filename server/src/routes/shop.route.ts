import { Router } from "express";
import { getProducts, getCategories, getProductById, createOrder, createAbaPayment, abaWebhook, createPaypalPayment, getBanners, createBanner, updateBanner, deleteBanner, getPromos, createPromo, deletePromo, rateProduct, getUserOrders, getUserProfile } from "../module/shop.services";

const ShopRoute = Router();

ShopRoute.get("/products", getProducts);
ShopRoute.get("/products/:id", getProductById);
ShopRoute.post("/products/:id/rate", rateProduct);
ShopRoute.get("/categories", getCategories);
ShopRoute.get("/banners", getBanners);
ShopRoute.post("/banners", createBanner);
ShopRoute.patch("/banners/:id", updateBanner);
ShopRoute.delete("/banners/:id", deleteBanner);
ShopRoute.get("/promos", getPromos);
ShopRoute.post("/promos", createPromo);
ShopRoute.delete("/promos/:id", deletePromo);
ShopRoute.post("/orders", createOrder);
ShopRoute.get("/user-orders", getUserOrders);
ShopRoute.get("/user-profile", getUserProfile);
ShopRoute.post("/aba-checkout", createAbaPayment);
ShopRoute.post("/aba-webhook", abaWebhook);
ShopRoute.post("/paypal-checkout", createPaypalPayment);

export default ShopRoute;
