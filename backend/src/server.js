import "dotenv/config";
import app, { loadOrders } from "./app.js";
import { prisma } from "./lib/prisma.js";

const PORT = Number(process.env.PORT) || 5000;

// Warm Neon locally before the browser makes its first request. Vercel uses
// app.js directly and handles database connections on demand per invocation.
async function start() {
  try {
    await prisma.$connect();
    await loadOrders();
    console.log("Database connection ready");
  } catch (error) {
    console.error("Database warm-up failed:", error);
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();

// Optional: keep Neon awake during long local sessions. Off by default.
if (process.env.KEEP_DB_WARM === "true") {
  const timer = setInterval(
    async () => {
      try {
        await prisma.$queryRaw`SELECT 1`;
      } catch (error) {
        console.error("Database keep-alive failed:", error);
      }
    },
    4 * 60 * 1000,
  );

  timer.unref();
}
