import requests
import datetime
import pdfkit
from jinja2 import Environment, FileSystemLoader

PROM_URL = "http://localhost:9090/api/v1/query"

def query(promql):
    r = requests.get(PROM_URL, params={"query": promql})
    return r.json()["data"]["result"][0]["value"][1] if r.json()["data"]["result"] else None

# Mesures au moment de la génération
cpu = query('process_cpu_seconds_total')
mem = query('process_resident_memory_bytes')
http_health = query('http_requests_total{route="/health"}')

now = datetime.datetime.now()

incident = {
    "title": "INCIDENT P1 – API DOWN",
    "date": now.strftime("%Y-%m-%d %H:%M"),
    "duration": "calculée dynamiquement",  # si tu sauvegardes startTime, tu peux calculer ici
    "impact": f"CPU={cpu}, RAM={mem}, Requêtes /health={http_health}",
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

pdfkit.from_string(html, "incident_report/output.pdf")
print("PDF généré")
