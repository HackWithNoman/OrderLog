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
      },
    });

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
