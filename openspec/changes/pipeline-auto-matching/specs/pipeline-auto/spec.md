## ADDED Requirements

### Requirement: Page Pipeline Auto accessible depuis la navigation

La SPA SHALL afficher une entrée "Pipeline Auto" dans la navigation latérale, entre "Matching" et "Dashboard", permettant d'accéder à la page `#page-pipeline`.

#### Scenario: Navigation vers Pipeline Auto

- **WHEN** l'utilisateur clique sur "Pipeline Auto" dans la sidebar
- **THEN** la page `#page-pipeline` s'affiche et toutes les autres pages sont masquées

---

### Requirement: Liste des pipelines actifs et terminés

La page Pipeline Auto SHALL afficher la liste de tous les pipelines avec leur statut, source, mission et date.

#### Scenario: Affichage des pipelines mockés au chargement

- **WHEN** l'utilisateur ouvre la page Pipeline Auto
- **THEN** au moins 3 pipelines sont affichés (1 terminé, 1 en cours, 1 en attente) avec leur statut coloré (pill)

#### Scenario: Distinction visuelle des statuts

- **WHEN** un pipeline a le statut "En cours"
- **THEN** sa pill de statut est en violet animé (pulsing)
- **WHEN** un pipeline a le statut "Terminé"
- **THEN** sa pill de statut est en vert
- **WHEN** un pipeline a le statut "Alerte"
- **THEN** sa pill de statut est en rouge/orange

---

### Requirement: Lancement d'un pipeline de démonstration

La page SHALL permettre de lancer une simulation animée d'un pipeline complet via un bouton "Lancer un pipeline".

#### Scenario: Lancement de la démo

- **WHEN** l'utilisateur clique sur "Lancer un pipeline"
- **THEN** un nouveau pipeline mockée apparaît en haut de liste avec statut "En cours"
- **THEN** les étapes s'animent séquentiellement : Fiche reçue → Parsing IA → Matching → SMS envoyés → Réponses OUI → Profils WhatsApp → Validation client → Validation agence
- **THEN** chaque étape s'affiche avec une icône check vert et un timestamp simulé

#### Scenario: Fin d'animation

- **WHEN** toutes les étapes sont complètes
- **THEN** le statut du pipeline passe à "Terminé" avec pill verte

---

### Requirement: Drawer de détail d'un pipeline

Chaque pipeline SHALL ouvrir un drawer (540px) au clic, affichant le détail complet du flux.

#### Scenario: Ouverture du drawer

- **WHEN** l'utilisateur clique sur un pipeline dans la liste
- **THEN** un drawer s'ouvre depuis la droite avec 3 onglets : "Timeline", "Candidats", "Profils anonymisés"

#### Scenario: Onglet Timeline

- **WHEN** l'onglet "Timeline" est actif
- **THEN** toutes les étapes du pipeline sont listées avec statut (✓ / ⏳ / ✗), label et timestamp

#### Scenario: Onglet Candidats

- **WHEN** l'onglet "Candidats" est actif
- **THEN** la liste des candidats contactés est affichée avec leur score de matching, statut SMS (Envoyé / OUI / NON / Sans réponse) et badge "Sélectionné" pour les 3 premiers OUI

#### Scenario: Onglet Profils anonymisés

- **WHEN** l'onglet "Profils anonymisés" est actif
- **THEN** les 3 CVs anonymisés sont affichés avec nom/prénom/téléphone/email/adresse masqués par ████████
- **THEN** les entreprises précédentes, compétences, certifications, formations et années d'expérience restent visibles

---

### Requirement: SMS candidat personnalisé selon la fiche de poste

Le pipeline SHALL afficher le SMS mockée envoyé aux candidats, personnalisé avec le titre du poste, la ville, les dates et le taux horaire.

#### Scenario: Visualisation du SMS envoyé

- **WHEN** l'utilisateur consulte l'onglet Candidats dans le drawer
- **THEN** un encadré "Message SMS envoyé" affiche le contenu personnalisé du SMS avec les détails de la mission

---

### Requirement: Alerte consultante si aucune réponse

Le pipeline SHALL déclencher une alerte visible dans le dashboard et la liste des pipelines si aucun candidat ne répond sous 24h (simulé).

#### Scenario: Pipeline en état Alerte

- **WHEN** un pipeline mockée est en statut "Alerte — Aucune réponse"
- **THEN** une bannière rouge/orange apparaît en haut de la page pipeline
- **THEN** le pipeline est mis en évidence dans la liste avec pill "⚠ Alerte"
- **THEN** un message indique "Aucun candidat n'a répondu — action manuelle requise"

---

### Requirement: Bandeau démo visible

La page SHALL afficher un bandeau permanent indiquant que les données sont simulées.

#### Scenario: Visibilité du bandeau démo

- **WHEN** la page Pipeline Auto est affichée
- **THEN** un bandeau "Mode démo — données simulées" est visible en haut de page
