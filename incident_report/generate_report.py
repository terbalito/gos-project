import requests
import datetime
import pdfkit
from jinja2 import Environment, FileSystemLoader

PROM_URL = "http://localhost:9090/api/v1/query"

def query(promql):
    return requests.get(PROM_URL, params={"query": promql}).json()

now = datetime.datetime.now()

incident = {
    "title": "INCIDENT P1 – API DOWN",
    "date": now.strftime("%Y-%m-%d %H:%M"),
    "duration": "12 minutes",
    "impact": "Requêtes échouées pendant indisponibilité",
    "actions": [
        "Vérification du container Docker",
        "Redémarrage du service",
        "Contrôle CPU/RAM",
        "Validation du retour à la normale"
    ]
}

env = Environment(loader=FileSystemLoader("templates"))
template = env.get_template("incident_template.html")
html = template.render(incident=incident)

pdfkit.from_string(html, "incident_report.pdf")
print("PDF généré")
