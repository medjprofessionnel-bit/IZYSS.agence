## 1. Navigation & Structure de page

- [ ] 1.1 Ajouter l'entrée "Pipeline Auto" (icône ⚡) dans la sidebar entre "Matching" et "Dashboard"
- [ ] 1.2 Créer le bloc `<div id="page-pipeline" class="page-section">` dans `izyss-app.html`
- [ ] 1.3 Ajouter les styles CSS de la page pipeline (layout, cards, pills statuts, timeline)
- [ ] 1.4 Connecter la nav JS pour afficher/masquer `#page-pipeline`

## 2. Données mockées

- [ ] 2.1 Définir le tableau JS `pipelineData` avec 3 pipelines (1 terminé, 1 en cours, 1 alerte)
- [ ] 2.2 Définir pour chaque pipeline : steps[], candidates[], anonymizedCVs[], source, mission, client
- [ ] 2.3 Créer les données de candidats avec score, smsStatus, réponse, CV complet et CV anonymisé (████████)
- [ ] 2.4 Définir le template SMS personnalisé par pipeline avec poste/ville/dates/taux

## 3. Liste des pipelines

- [ ] 3.1 Rendre la liste des pipelines depuis `pipelineData` (card par pipeline)
- [ ] 3.2 Afficher : source (email/portail), titre mission, client, date, statut (pill colorée)
- [ ] 3.3 Ajouter pill animée (pulsing) pour statut "En cours"
- [ ] 3.4 Ajouter bannière rouge pour le pipeline en statut "Alerte"
- [ ] 3.5 Ajouter bandeau "Mode démo — données simulées" en haut de page

## 4. Bouton "Lancer un pipeline" & animation

- [ ] 4.1 Ajouter bouton "⚡ Lancer un pipeline" dans la toolbar de la page
- [ ] 4.2 Au clic, créer un nouveau pipeline mockée et l'insérer en tête de liste
- [ ] 4.3 Implémenter l'animation séquentielle des étapes via `setTimeout` (500ms par étape)
- [ ] 4.4 Chaque étape : label + icône check vert + timestamp simulé qui s'affiche progressivement
- [ ] 4.5 À la fin de l'animation, passer le statut du pipeline à "Terminé" (pill verte)

## 5. Drawer de détail

- [ ] 5.1 Créer le drawer 540px (overlay + panel) activé au clic sur un pipeline
- [ ] 5.2 Implémenter les 3 onglets : "Timeline" / "Candidats" / "Profils anonymisés"
- [ ] 5.3 Onglet Timeline : liste des étapes avec icône statut (✓ ⏳ ✗), label, timestamp
- [ ] 5.4 Onglet Candidats : liste des candidats avec score, statut SMS (pill), badge "Sélectionné" pour les 3 OUI
- [ ] 5.5 Onglet Candidats : encadré "SMS envoyé" avec le message personnalisé de la mission
- [ ] 5.6 Onglet Profils anonymisés : afficher les 3 CVs avec champs sensibles masqués (████████)
- [ ] 5.7 Dans les CVs anonymisés : entreprises précédentes, compétences, formations, certifs restent visibles
- [ ] 5.8 Ajouter bouton de fermeture et fermeture au clic sur l'overlay

## 6. Cas alerte — aucune réponse

- [ ] 6.1 Pour le pipeline en statut "Alerte", afficher une bannière explicite en haut de page
- [ ] 6.2 Dans le drawer du pipeline alerte : afficher message "Aucun candidat n'a répondu — action manuelle requise"
- [ ] 6.3 Pill "⚠ Alerte" rouge/orange dans la liste

## 7. Validation Playwright

- [ ] 7.1 Tester la navigation vers la page Pipeline Auto
- [ ] 7.2 Tester le lancement de la démo et vérifier l'animation des étapes
- [ ] 7.3 Tester l'ouverture du drawer et la navigation entre les 3 onglets
- [ ] 7.4 Vérifier que les CVs anonymisés masquent bien les données sensibles
- [ ] 7.5 Vérifier le responsive sur mobile (375px) et desktop (1280px)
