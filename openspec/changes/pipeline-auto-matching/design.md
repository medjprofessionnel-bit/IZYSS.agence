## Context

La SPA IZYSS est un fichier HTML unique (`izyss-app.html`, ~5700 lignes) en JS vanilla, CSS inline, données mockées. Pas de build system, pas de framework. Chaque page est un `<div id="page-xxx" class="page-section">` affiché/masqué via JS. Les données sont des tableaux JS en mémoire. L'objectif est d'ajouter une page "Pipeline Auto" qui simule visuellement le flux complet d'automatisation pour convaincre un client lors d'une démo.

## Goals / Non-Goals

**Goals:**
- Page dédiée `#page-pipeline` avec nav latérale
- Simulation animée du flux : fiche de poste → matching → SMS → OUI → WhatsApp client → validation
- Dashboard liste des pipelines actifs/terminés avec statuts temps réel mockés
- Drawer de détail pipeline : timeline des événements, candidats contactés, réponses SMS, profil anonymisé
- Bouton "Lancer un pipeline" (démo) qui joue l'animation étape par étape
- Alerte consultante si aucune réponse (cas edge)
- Design cohérent avec le reste de l'app (violet #6C5CE7, DM Sans, cards, pills)

**Non-Goals:**
- Intégration réelle Brevo SMS/WhatsApp (V2)
- Parsing IA réel d'email (V2)
- Persistance données (tout en mémoire)
- Mode multi-utilisateur
- Authentification

## Decisions

### D1 — Structure des données mockées

Un pipeline contient :
```
{
  id, missionTitle, client, createdAt, status,
  source: "email" | "portail",
  steps: [{ id, label, status, timestamp, detail }],
  candidates: [{ id, name, score, smsStatus, response, anonymizedCV }],
  result: { profilesSent: 3, clientValidated: bool, agenceValidated: bool }
}
```
**Rationale** : structure plate, lisible en JS vanilla, facile à animer étape par étape.

### D2 — Animation du pipeline

Utilisation de `setInterval` / `setTimeout` chaînés pour simuler la progression des étapes lors d'un "Lancer demo". Chaque étape s'allume après X ms avec une animation CSS `fadeIn` + icône check.

**Rationale** : Pas de lib d'animation externe, cohérent avec l'approche JS vanilla du projet.

### D3 — Profil anonymisé

Le CV mockée cache `nom`, `prénom`, `téléphone`, `email`, `adresse`. Reste visible : entreprises précédentes, compétences, certifications, formations, années d'expérience, zone géographique.

Affiché dans le drawer comme une card "CV anonymisé" avec les champs masqués remplacés par `████████`.

**Rationale** : Visuellement impactant en démo, montre concrètement ce que le client reçoit.

### D4 — Entrée de navigation

Ajout d'un item nav "Pipeline Auto" avec icône ⚡ entre "Matching" et "Dashboard" dans la sidebar.

### D5 — Timeline des étapes

```
[✓] Fiche de poste reçue          09:14
[✓] Parsing IA                    09:14
[✓] 7 candidats matchés           09:15
[✓] SMS envoyés en parallèle      09:15
[✓] 3 premiers OUI reçus          09:47  ← Karim, Yasmine, Mehdi
[✓] Profils → WhatsApp client     09:48
[⏳] Validation client...
[ ] Validation agence
```

## Risks / Trade-offs

- [Animation lente en démo] → Vitesse accélérée en mode démo (délais courts, ~500ms par étape)
- [Confusion mock vs réel] → Bandeau "Mode démo — données simulées" visible en haut de page
- [Drawer trop dense] → Tabs internes : "Timeline" / "Candidats" / "Profils anonymisés"

## Open Questions

- Combien de pipelines mockés pré-chargés ? → 3 (1 terminé, 1 en cours, 1 en attente)
- Le bouton "Lancer pipeline" crée un nouveau ou rejoue un existant ? → Crée un nouveau mockée avec animation
