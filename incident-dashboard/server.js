const express = require("express");
const axios = require("axios");
const path = require("path");
const { exec } = require("child_process");

const app = express();
const PORT = 4000;

// Servir les fichiers statiques depuis public
app.use(express.static(path.join(__dirname, "public")));

// Pour s'assurer que '/' renvoie l'index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

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
    return { success: true, down: value === "0" };
  } catch (err) {
    // Si Prometheus ne répond pas, on considère l'API comme down
    return { success: false, down: true };
  }
}

// Endpoint incident
app.get("/incident", async (req, res) => {
  try {
    const { down } = await checkApiDown();

    if (down) {
      if (!incidentStartTime) incidentStartTime = new Date();
      res.json({
        incident: "API DOWN",
        severity: "P1",
        actions: Object.keys(commands),
        commands,
        showPdfButton: false // PDF seulement après résolution
      });
    } else {
      let duration = null;
      if (incidentStartTime) {
        duration = Math.round((new Date() - incidentStartTime) / 1000);
        incidentStartTime = null;
      }
      res.json({ incident: null, showPdfButton: true, duration });
    }
  } catch (err) {
    res.json({
      incident: "API DOWN",
      severity: "P1",
      actions: Object.keys(commands),
      commands,
      showPdfButton: false
    });
  }
});


// Endpoint pour générer le PDF
app.get("/generate-pdf", (req, res) => {
  const scriptPath = path.join(__dirname, "incident_report", "generate_report.py");

  // Exécute avec l'environnement Python du venv si tu veux
  const command = `python3 ${scriptPath}`;

  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error("Erreur génération PDF :", stderr || err);
      return res.status(500).send("Erreur génération PDF");
    }
    const pdfPath = path.join(__dirname, "incident_report", "output.pdf");
    res.download(pdfPath, "incident_report.pdf", (err) => {
      if (err) console.error("Erreur téléchargement PDF :", err);
    });
  });
});


app.listen(PORT, () => console.log(`Incident dashboard running on ${PORT}`));
