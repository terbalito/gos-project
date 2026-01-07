const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = 4000;

// 🔹 Servir les fichiers statiques proprement
app.use(express.static(path.join(__dirname, "public")));

// 🔹 Route racine explicite
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PROMETHEUS_URL = "http://localhost:9090/api/v1/query";

const { exec } = require("child_process");
app.get("/generate-pdf", (req, res) => {
  // Appelle le script Python qui génère le PDF
  exec("python3 incident_report/generate_report.py", (err, stdout, stderr) => {
    if(err) return res.status(500).send("Erreur génération PDF");
    res.download("incident_report/output.pdf"); // envoyer le PDF au navigateur
  });
});


async function checkApiDown() {
  const query = 'up{job="gos-api"}';
  const res = await axios.get(PROMETHEUS_URL, {
    params: { query },
  });

  const value = res.data.data.result[0]?.value[1];
  return value === "0";
}

// 🔹 Endpoint incident
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
          "Confirmer le retour à la normale",
        ],
      });
    } else {
      res.json({ incident: null });
    }
  } catch (err) {
    res.status(500).json({ error: "Monitoring error" });
  }
});

app.listen(PORT, () =>
  console.log(`🚨 Incident dashboard running on port ${PORT}`)
);
