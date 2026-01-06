const express = require("express");
const app = express();
const port = 3000;

// Health check
app.get("/health", (req, res) => {
  console.log("Health check requested");
  res.send({ status: "ok" });
});

// Usage / Pay endpoint
app.get("/pay", (req, res) => {
  const usage = Math.floor(Math.random() * 1000);
  console.log(`Usage requested: ${usage}`);
  res.send({ usage, cost: usage * 0.05 });
});

app.listen(port, () => console.log(`API GOS running on port ${port}`));
