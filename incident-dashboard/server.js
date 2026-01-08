const express = require("express");
const axios = require("axios");
const path = require("path");
const { exec } = require("child_process");

const app = express();
const PORT = 4000;
app.use(express.static("public"));

const PROMETHEUS_URL = "http://localhost:9090/api/v1/query";

let incidentStartTime = null;

// Commandes suggérées pour diagnostiquer et réparer
const commands = {
  "Vérifier l’état du container Docker": "docker ps | grep gos-api",
  "Redémarrer le service": "docker restart gos-api",
  "Vérifier CPU / RAM": "docker stats gos-api",
  "Confirmer le retour à la normale": "curl http://localhost:3001/health"
};

// Vérifie si l'API est down via Prometheus
async function checkApiDown() {
  try {
    const query = 'up{job="gos-api"}';
    const res = await axios.get(PROMETHEUS_URL, { params: { query } });
    const value = res.data.data.result[0]?.value?.[1];
    console.log("Valeur API UP:", value);
    return value === "0";
  } catch (err) {
    console.error("Erreur checkApiDown:", err.message);
    return false; // Aucun incident si query échoue
  }
}

// Endpoint pour le dashboard
app.get("/incident", async (req, res) => {
  try {
    const apiDown = await checkApiDown();

    if (apiDown) {
      if (!incidentStartTime) incidentStartTime = new Date();
      res.json({
        incident: "API DOWN",
        severity: "P1",
        actions: Object.keys(commands),
        commands
      });
    } else {
      if (incidentStartTime) {
        // calcul de la durée de l’incident
        const durationSec = Math.round((new Date() - incidentStartTime) / 1000);
        console.log(`Incident résolu en ${durationSec} sec`);
        incidentStartTime = null;
        // ici tu pourrais générer automatiquement le PDF si tu veux
      }
      res.json({ incident: null });
    }
  } catch (err) {
    res.status(500).json({ error: "Monitoring error" });
  }
});

// Génération PDF
app.get("/generate-pdf", (req, res) => {
  exec("python3 incident_report/generate_report.py", (err) => {
    if (err) {
      console.error("Erreur PDF:", err.message);
      return res.status(500).send("Erreur génération PDF");
    }
    res.download(path.join(__dirname, "incident_report/output.pdf"));
  });
});

// Lancement du serveur
app.listen(PORT, () => console.log(`Incident dashboard running on ${PORT}`));
