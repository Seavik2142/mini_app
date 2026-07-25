import { Router } from "express";
import { prisma } from "../index";
import Utility from "../utils/Utilite";
import { getBanners, createBanner, updateBanner, deleteBanner, getPromos, createPromo, deletePromo } from "../module/shop.services";

const AdminRoute = Router();

// ── Stats ─────────────────────────────────────────────────────
AdminRoute.get("/stats", Utility.CatchAsync(async (req, res) => {
  const [totalUsers, totalOrders, totalProducts, revenueAgg] = await Promise.all([
    prisma.user.count({ where: { isDelete: false } }),
    prisma.order.count(),
    prisma.product.count(),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { paymentStatus: "PAID" },
    }),
  ]);

  res.json({
    code: 200,
    data: {
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenue: revenueAgg._sum.totalAmount || 0,
    },
  });
}));

// ── Users ─────────────────────────────────────────────────────
AdminRoute.get("/users", Utility.CatchAsync(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page  as string) || 1);
  const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
  const search = (req.query.search as string) || "";
  const skip  = (page - 1) * limit;

  const where = search
    ? {
        isDelete: false,
        OR: [
          { name:     { contains: search, mode: "insensitive" as const } },
          { username: { contains: search, mode: "insensitive" as const } },
          { tgId:     { contains: search, mode: "insensitive" as const } },
        ],
      }
    : { isDelete: false };

  const [users, total] = await Promise.all([
    prisma.user.findMany({ where, skip, take: limit, orderBy: { joinedAt: "desc" } }),
    prisma.user.count({ where }),
  ]);

  res.json({
    code: 200,
    data: { users, total, page, totalPages: Math.ceil(total / limit) },
  });
}));

AdminRoute.get("/users/:id", Utility.CatchAsync(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(req.params.id) },
    include: {
      orders: { orderBy: { createdAt: "desc" }, take: 10 },
      cartItems: { include: { product: true } },
    },
  });
  if (!user) { res.status(404).json({ code: 404, msg: "User not found" }); return; }
  res.json({ code: 200, data: user });
}));

AdminRoute.patch("/users/:id/block", Utility.CatchAsync(async (req, res) => {
  const id   = parseInt(req.params.id);
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) { res.status(404).json({ code: 404, msg: "User not found" }); return; }

  const updated = await prisma.user.update({
    where: { id },
    data:  { isBlock: !user.isBlock },
  });
  res.json({ code: 200, data: updated, msg: updated.isBlock ? "User blocked" : "User unblocked" });
}));

AdminRoute.delete("/users/:id", Utility.CatchAsync(async (req, res) => {
  await prisma.user.update({
    where: { id: parseInt(req.params.id) },
    data:  { isDelete: true },
  });
  res.json({ code: 200, msg: "User deleted" });
}));

// ── Orders ────────────────────────────────────────────────────
AdminRoute.get("/orders", Utility.CatchAsync(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page  as string) || 1);
  const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
  const skip  = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      skip,
      take:    limit,
      orderBy: { createdAt: "desc" },
      include: {
        user:  { select: { id: true, name: true, username: true, tgId: true } },
        items: { include: { product: { select: { id: true, name: true, price: true } } } },
      },
    }),
    prisma.order.count(),
  ]);

  res.json({
    code: 200,
    data: { orders, total, page, totalPages: Math.ceil(total / limit) },
  });
}));

AdminRoute.patch("/orders/:id/status", Utility.CatchAsync(async (req, res) => {
  const { orderStatus } = req.body;
  const validStatuses = ["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
  if (!validStatuses.includes(orderStatus)) {
    res.status(400).json({ code: 400, msg: "Invalid order status" });
    return;
  }

  const updated = await prisma.order.update({
    where: { id: parseInt(req.params.id) },
    data:  { orderStatus },
  });
  res.json({ code: 200, data: updated });
}));

// ── Products ──────────────────────────────────────────────────
AdminRoute.get("/products", Utility.CatchAsync(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page  as string) || 1);
  const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
  const skip  = (page - 1) * limit;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      skip,
      take:    limit,
      orderBy: { createdAt: "desc" },
      include: { category: { select: { id: true, name: true } } },
    }),
    prisma.product.count(),
  ]);

  res.json({
    code: 200,
    data: { products, total, page, totalPages: Math.ceil(total / limit) },
  });
}));

AdminRoute.post("/products", Utility.CatchAsync(async (req, res) => {
  let { name, slug, description, price, tonPrice, starsPrice, images, categoryId, stock, isFeatured, isNew, isOnSale, discount, warranty } = req.body;

  if (!name || String(name).trim() === "") {
    res.status(400).json({ code: 400, msg: "Product name is required" });
    return;
  }

  // Ensure category exists
  let targetCategoryId = categoryId ? parseInt(categoryId) : null;
  if (targetCategoryId) {
    const catExists = await prisma.category.findUnique({ where: { id: targetCategoryId } });
    if (!catExists) targetCategoryId = null;
  }

  if (!targetCategoryId) {
    const firstCat = await prisma.category.findFirst();
    if (firstCat) {
      targetCategoryId = firstCat.id;
    } else {
      const newCat = await prisma.category.create({
        data: { name: "General", slug: "general", icon: "🔑", description: "General Category" },
      });
      targetCategoryId = newCat.id;
    }
  }

  // Ensure unique slug
  let baseSlug = (slug || name).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  if (!baseSlug) baseSlug = "product-" + Date.now();

  let uniqueSlug = baseSlug;
  let count = 1;
  while (await prisma.product.findUnique({ where: { slug: uniqueSlug } })) {
    uniqueSlug = `${baseSlug}-${count++}`;
  }

  const product = await prisma.product.create({
    data: {
      name,
      slug: uniqueSlug,
      description: description || name,
      price: parseFloat(price) || 0,
      tonPrice: tonPrice ? parseFloat(tonPrice) : null,
      starsPrice: starsPrice ? parseInt(starsPrice) : null,
      images: Array.isArray(images) ? images : (images ? [images] : []),
      categoryId: targetCategoryId,
      stock: stock !== undefined && stock !== null ? parseInt(stock) : 100,
      isFeatured: Boolean(isFeatured),
      isNew: Boolean(isNew),
      isOnSale: Boolean(isOnSale),
      discount: discount ? parseInt(discount) : 0,
      warranty: warranty ? String(warranty).trim() : "30 Days Warranty",
    },
  });

  res.status(201).json({ code: 201, data: product, msg: "Product created successfully" });
}));

AdminRoute.patch("/products/:id", Utility.CatchAsync(async (req, res) => {
  const id = parseInt(req.params.id);
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ code: 404, msg: "Product not found" });
    return;
  }

  const updateData: any = { ...req.body };
  if (updateData.price !== undefined) updateData.price = parseFloat(updateData.price) || 0;
  if (updateData.stock !== undefined) updateData.stock = parseInt(updateData.stock) || 0;
  if (updateData.categoryId !== undefined) updateData.categoryId = parseInt(updateData.categoryId);

  if (updateData.slug && updateData.slug !== existing.slug) {
    let baseSlug = updateData.slug.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    let uniqueSlug = baseSlug;
    let count = 1;
    while (await prisma.product.findFirst({ where: { slug: uniqueSlug, NOT: { id } } })) {
      uniqueSlug = `${baseSlug}-${count++}`;
    }
    updateData.slug = uniqueSlug;
  }

  const product = await prisma.product.update({
    where: { id },
    data:  updateData,
  });
  res.json({ code: 200, data: product, msg: "Product updated successfully" });
}));

AdminRoute.delete("/products/:id", Utility.CatchAsync(async (req, res) => {
  await prisma.product.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ code: 200, msg: "Product deleted" });
}));

// ── Categories ────────────────────────────────────────────────
AdminRoute.get("/categories", Utility.CatchAsync(async (req, res) => {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  res.json({ code: 200, data: categories });
}));

// ── Banners ───────────────────────────────────────────────────
AdminRoute.get("/banners", getBanners);
AdminRoute.post("/banners", createBanner);
AdminRoute.patch("/banners/:id", updateBanner);
AdminRoute.delete("/banners/:id", deleteBanner);

// ── Promos ────────────────────────────────────────────────────
AdminRoute.get("/promos", getPromos);
AdminRoute.post("/promos", createPromo);
AdminRoute.delete("/promos/:id", deletePromo);

export default AdminRoute;
