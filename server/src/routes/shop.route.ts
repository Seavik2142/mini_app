import { Router } from "express";
import { UserVaildation } from "../utils/Middleware";
import { getProducts, getCategories, getProductById, createOrder, createAbaPayment, abaWebhook, createPaypalPayment, getBanners, getPromos, rateProduct, getUserOrders, getUserProfile, updateUserProfile, handlePaymentFailed } from "../module/shop.services";

const ShopRoute = Router();

// Public routes
ShopRoute.get("/products", getProducts);
ShopRoute.get("/products/:id", getProductById);
ShopRoute.get("/categories", getCategories);
ShopRoute.get("/banners", getBanners);
ShopRoute.get("/promos", getPromos);
ShopRoute.post("/aba-webhook", abaWebhook);

// Protected user routes
ShopRoute.post("/products/:id/rate", UserVaildation, rateProduct);
ShopRoute.post("/orders", UserVaildation, createOrder);
ShopRoute.get("/user-orders", UserVaildation, getUserOrders);
ShopRoute.get("/user-profile", UserVaildation, getUserProfile);
ShopRoute.patch("/user-profile", UserVaildation, updateUserProfile);
ShopRoute.post("/aba-checkout", UserVaildation, createAbaPayment);
ShopRoute.post("/paypal-checkout", UserVaildation, createPaypalPayment);
ShopRoute.post("/payment-failed", UserVaildation, handlePaymentFailed);

export default ShopRoute;
