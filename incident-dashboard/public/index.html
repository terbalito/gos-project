const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = 4000;

app.use(express.static("public"));

const PROMETHEUS_URL = "http://localhost:9090/api/v1/query";

async function checkApiDown() {
  const query = 'up{job="gos-api"}';
  const res = await axios.get(PROMETHEUS_URL, {
    params: { query }
  });

  const value = res.data.data.result[0]?.value[1];
  return value === "0";
}

app.get("/incident", async (req, res) => {
  try {
    const apiDown = await checkApiDown();

    if (apiDown) {
      res.json({
        incident: "API DOWN",
        severity: "P1",
        actions: [
          "Vérifier l’état du container Docker",
          "Redémarrer le service",
          "Vérifier CPU / RAM",
          "Confirmer le retour à la normale"
        ]
      });
    } else {
      res.json({ incident: null });
    }
  } catch (err) {
    res.status(500).json({ error: "Monitoring error" });
  }
});

app.listen(PORT, () =>
  console.log(`Incident dashboard running on ${PORT}`)
);
