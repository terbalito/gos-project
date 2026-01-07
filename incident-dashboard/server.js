const express = require("express");
const axios = require("axios");
const path = require("path");
const { exec } = require("child_process");

const app = express();
const PORT = 4000;
app.use(express.static("public"));

const PROMETHEUS_URL = "http://localhost:9090/api/v1/query";

let incidentStartTime = null;

// Commandes à suggérer
const commands = {
  "Vérifier l’état du container Docker": "docker ps | grep gos-api",
  "Redémarrer le service": "docker restart gos-api",
  "Vérifier CPU / RAM": "docker stats gos-api",
  "Confirmer le retour à la normale": "curl http://localhost:3001/health"
};

// Fonction pour vérifier si l'API est down
async function checkApiDown() {
  try {
    const query = 'up{job="gos-api"}';
    const res = await axios.get(PROMETHEUS_URL, { params: { query } });
    const value = res.data.data.result[0]?.value[1];
    return value === "0";
  } catch (err) {
    return false;
  }
}

// Endpoint incident
app.get("/incident", async (req, res) => {
  try {
    const apiDown = await checkApiDown();

    if(apiDown) {
      if(!incidentStartTime) incidentStartTime = new Date();
      res.json({
        incident: "API DOWN",
        severity: "P1",
        actions: Object.keys(commands),
        commands
      });
    } else {
      if(incidentStartTime) {
        // calcul de la durée
        const durationSec = Math.round((new Date() - incidentStartTime)/1000);
        incidentStartTime = null;
        // sauvegarde ou log si besoin
      }
      res.json({ incident: null });
    }
  } catch(err) {
    res.status(500).json({ error: "Monitoring error" });
  }
});

// Génération PDF dynamique
app.get("/generate-pdf", (req, res) => {
  exec("python3 incident_report/generate_report.py", (err) => {
    if(err) return res.status(500).send("Erreur génération PDF");
    res.download(path.join(__dirname, "incident_report/output.pdf"));
  });
});

app.listen(PORT, () => console.log(`Incident dashboard running on ${PORT}`));
