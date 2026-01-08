import os
import requests
import datetime
import pdfkit
from jinja2 import Environment, FileSystemLoader

# URL Prometheus
PROM_URL = "http://localhost:9090/api/v1/query"

# Fonction pour récupérer une métrique Prometheus
def query(promql):
    r = requests.get(PROM_URL, params={"query": promql})
    return r.json()["data"]["result"][0]["value"][1] if r.json()["data"]["result"] else None

# Mesures au moment de la génération
cpu = query('process_cpu_seconds_total')
mem = query('process_resident_memory_bytes')
http_health = query('http_requests_total{route="/health"}')

# Date actuelle
now = datetime.datetime.now()

# Données de l'incident
incident = {
    "title": "INCIDENT P1 – API DOWN",
    "date": now.strftime("%Y-%m-%d %H:%M"),
    "duration": "durée calculée automatiquement",  # à compléter si tu enregistres startTime côté server
    "impact": f"CPU={cpu}, RAM={mem}, Requêtes /health={http_health}",
    "actions": [
        "Vérification du container Docker",
        "Redémarrage du service",
        "Contrôle CPU/RAM",
        "Validation du retour à la normale"
    ]
}

# Chemin dossier et fichier PDF
output_dir = "incident_report"
if not os.path.exists(output_dir):
    os.makedirs(output_dir)
output_pdf = os.path.join(output_dir, "output.pdf")

# Chargement template Jinja2
env = Environment(loader=FileSystemLoader("templates"))
template = env.get_template("incident_template.html")
html = template.render(incident=incident)

# Configuration wkhtmltopdf (chemin absolu)
config = pdfkit.configuration(wkhtmltopdf="/usr/bin/wkhtmltopdf")

# Génération PDF
pdfkit.from_string(html, output_pdf, configuration=config)

print(f"PDF généré : {output_pdf}")
