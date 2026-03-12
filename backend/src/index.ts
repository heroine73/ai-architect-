// AI Architect — Backend Server
// Node.js HTTP + Hono

import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { handleGenerate } from "./routes/generate";

const app = new Hono();

// CORS
app.use("*", cors({
  origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:8080"],
}));

// Health check
app.get("/api/health", (c) => {
  return c.json({ status: "ok", service: "ai-architect-backend" });
});

// Generate floor plan
app.post("/api/generate", async (c) => {
  const body = await c.req.json();
  const result = handleGenerate(body);
  return c.json(result);
});

// Start server
const port = 3001;
serve({ fetch: app.fetch, port }, (info) => {
  console.log(`🏗️ AI Architect Backend listening on http://localhost:${info.port}`);
});
