import compression from "compression";
import cors from "cors";
import express from "express";
import { prisma } from "./lib/prisma.js";

// The app is read-heavy: every mount/reload asks for the full list. Neon is
// far away, so re-downloading it per request dominates the response time.
// Serve reads from an in-memory cache: hits are instant, expired entries are
// returned immediately while a refresh runs in the background, and writes
// invalidate the cache.
const ORDERS_CACHE_TTL_MS = 10_000;

let ordersCache = null;
let ordersCacheExpiresAt = 0;
let ordersCacheGeneration = 0;
let ordersRefreshPromise = null;

function invalidateOrdersCache() {
  ordersCacheGeneration += 1;
  ordersCache = null;
  ordersCacheExpiresAt = 0;
  ordersRefreshPromise = null;
}

function refreshOrdersCache() {
  if (ordersRefreshPromise) return ordersRefreshPromise;

  const generation = ordersCacheGeneration;

  const promise = (async () => {
    try {
      const orders = await prisma.order.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

      // A mutation invalidated the cache while this read was in flight, so
      // this result may already be stale. Let the next refresh win.
      if (generation !== ordersCacheGeneration) return;

      ordersCache = orders;
      ordersCacheExpiresAt = Date.now() + ORDERS_CACHE_TTL_MS;
    } finally {
      if (ordersRefreshPromise === promise) {
        ordersRefreshPromise = null;
      }
    }
  })();

  ordersRefreshPromise = promise;
  return promise;
}

export async function loadOrders() {
  if (!ordersCache) {
    await refreshOrdersCache();

    if (!ordersCache) {
      throw new Error("Failed to load orders into cache");
    }

    return ordersCache;
  }

  if (Date.now() >= ordersCacheExpiresAt) {
    refreshOrdersCache().catch((error) => {
      console.error("Orders cache refresh failed:", error);
    });
  }

  return ordersCache;
}

const app = express();

app.use(cors());
app.use(compression());
app.use(express.json());

// Always revalidate reads (the ETag makes that cheap) so a browser can never
// serve a list from before a mutation. Mutations must never be cached.
app.use((req, res, next) => {
  res.set(
    "Cache-Control",
    req.method === "GET" ? "private, no-cache" : "no-store",
  );
  next();
});

app.get("/", (req, res) => {
  res.json({ message: "Order Management API" });
});

// Create Orders
app.post("/orders", async (req, res) => {
  try {
    const { name, phone, address, amount, note } = req.body;

    const order = await prisma.order.create({
      data: {
        name,
        phone,
        address,
        amount,
        note,
        status: "NOT_DONE",
      },
    });

    invalidateOrdersCache();

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// Get Orders
app.get("/orders", async (req, res) => {
  try {
    const orders = await loadOrders();

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Delete Order
app.delete("/orders/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid order ID" });
    }

    await prisma.order.delete({
      where: { id },
    });

    invalidateOrdersCache();

    res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Order not found" });
    }

    console.error(error);
    res.status(500).json({ error: "Failed to delete order" });
  }
});

// Update Status
app.patch("/orders/:id/status", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid order ID" });
    }

    if (!["NOT_DONE", "FINISHED"].includes(status)) {
      return res.status(400).json({ error: "Invalid order status" });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
    });

    invalidateOrdersCache();

    res.json(order);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Order not found" });
    }

    console.error(error);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

export default app;
