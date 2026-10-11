import "dotenv/config";
import express from "express";
import cors from "cors";
import { prisma } from "./lib/prisma.js";

const app = express();

app.use(cors());
app.use(express.json());

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

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// Get Orders

app.get("/orders", async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

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

    res.json(order);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Order not found" });
    }

    console.error(error);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
