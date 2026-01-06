const express = require("express");
const client = require("prom-client");

const app = express();
const port = 3001;

// Prometheus registry
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"],
});

register.registerMetric(httpRequestCounter);

// Middleware metrics
app.use((req, res, next) => {
  res.on("finish", () => {
    httpRequestCounter.inc({
      method: req.method,
      route: req.path,
      status: res.statusCode,
    });
  });
  next();
});

// Health check
app.get("/health", (req, res) => {
  res.send({ status: "ok" });
});

// Usage / Pay endpoint
app.get("/pay", (req, res) => {
  const usage = Math.floor(Math.random() * 1000);
  const cost = Number((usage * 0.05).toFixed(2));
  res.send({ usage, cost });
});

// Metrics endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.listen(port, () =>
  console.log(`API GOS running on port ${port}`)
);
