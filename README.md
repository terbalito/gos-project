README — GOS Critical Service Monitoring (Simulation)

Objectif du projet


Ce projet simule un service applicatif critique déployé sur une infrastructure cloud, avec pour but de démontrer :

la supervision technique d’un service

la détection d’incidents

l’analyse de l’impact business

la simulation de facturation / réconciliation

Le projet est conçu pour refléter un environnement réel de type Orange / GOS.


==  Concept général ==


L’application représente un service facturable (ex : roaming, API, cloud service) qui :

reçoit des requêtes

génère de l’usage

calcule un coût

expose des métriques observables

Elle sert de support à une plateforme de monitoring, d’alerting et de reporting.


== Architecture ==


Client (curl / navigateur)
        |
        v
API GOS (Node.js / Express)
        |
        v
Docker Container
        |
        v
Infrastructure Cloud (AWS EC2)



À venir :

Monitoring (Prometheus)

Dashboards (Grafana)

Alertes (P1)

Reporting business


== Stack technique ==


Langage : Node.js

Framework : Express

Conteneurisation : Docker

OS : Linux (Ubuntu)

Cloud : AWS EC2

Versioning : Git / GitHub



== Déploiement ==


Le service est :

conteneurisé avec Docker

exposé sur le port 3000

accessible depuis l’extérieur via une IP publique AWS


=== Endpoints disponibles ===


GET /health

Health check du service.

Réponse :

{
  "status": "ok"
}


👉 Utilisé pour :

supervision

SLA

alerting

GET /pay

Simulation d’un usage facturable.

Réponse :

{
  "usage": 981,
  "cost": 49.05
}

Signification :

usage : consommation simulée d’un service

cost : coût calculé sur la base d’un prix unitaire



👉 Sert de base pour :

facturation

contrôle de gestion

détection d’écarts

reporting financier



=== Dimension métier ===


Ce projet permet de simuler :

la consommation d’un service critique

la transformation de données techniques en indicateurs financiers

l’impact business d’un incident

la traçabilité des usages

Il est volontairement simple techniquement afin de se concentrer sur :

la compréhension des processus opérationnels et financiers.


=== Scénarios couverts ===


Service disponible / indisponible

Génération d’usage

Calcul de coûts

Préparation à la supervision

Analyse post-incident


=== Roadmap ===


 Monitoring système (CPU / RAM)

 Monitoring applicatif (latence, erreurs)

 Alertes P1

 Simulation d’incident

 Rapport PDF post-incident

 Dashboards business

🎯 Finalité

Ce projet sert de support démonstratif pour des rôles tels que :

Support Cloud & Système

Support Applicatif

Contrôle de Gestion

Facturation / Roaming