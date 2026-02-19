## Why

Un client a vu le MVP IZYSS et demande si le processus de placement peut être entièrement automatisé : réception d'une fiche de poste → matching IA → SMS candidats → proposition anonymisée → validation client → validation agence. Cette fonctionnalité est le principal argument commercial pour la signature du contrat. On l'intègre dans la SPA HTML existante sous forme de démo visuelle avec données mockées.

## What Changes

- Nouvelle page "Pipeline Auto" dans la SPA HTML existante (`izyss-app.html`)
- Entrée de nav latérale dédiée "Pipeline Auto" avec icône automatisation
- Vue liste des pipelines actifs et terminés avec statut en temps réel simulé
- Simulateur de lancement de pipeline depuis une fiche de poste (email ou portail)
- Animation du flux : parsing → matching → SMS → réponses → proposition → validation
- Drawer de détail par pipeline : candidats contactés, réponses, CVs anonymisés, statuts
- Alerte consultante si aucun candidat ne répond

## Capabilities

### New Capabilities

- `pipeline-auto` : Pipeline de recrutement automatisé — réception fiche de poste, matching IA, SMS candidats en parallèle, collecte des 3 premiers OUI, envoi profil anonymisé au client via WhatsApp, validation client par SMS, validation finale agence dans le dashboard

### Modified Capabilities

<!-- Aucune spec existante impactée -->

## Impact

- `izyss-app.html` : ajout page `#page-pipeline`, styles CSS, logique JS
- Données mockées : fiches de poste, candidats matchés, logs SMS, statuts pipeline
- Aucune dépendance externe ajoutée (tout en JS vanilla simulé)
