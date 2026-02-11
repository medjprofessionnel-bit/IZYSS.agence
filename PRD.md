# IZYSS — Spécification Technique Complète

> Plateforme SaaS IA pour agences d'intérim. Application SPA (Single Page Application) avec sidebar fixe, navigation par onglets, design system cohérent.

---

## 1. Architecture Globale

### Type : SPA mono-fichier (HTML/CSS/JS vanilla)
- **Sidebar fixe** (260px) à gauche avec navigation
- **Pages affichées/masquées** via `display:none` sur les `.page-section`
- **Namespace par page** pour éviter les conflits JS/CSS :
  - Dashboard → `db-`
  - Candidats → `cd-`
  - Missions → `ms-`
  - Contrats → `ct-`
  - Scoring → (inline, pas de préfixe)
  - Matching → (inline, pas de préfixe)
  - Relances → (inline, pas de préfixe)
  - Portail Client → `pc-`
- **Toast global** : `showToast(message)` partagé par toutes les pages
- **Navigation** : `navigateTo(pageName)` masque toutes les pages et affiche celle ciblée

### 8 Pages
| Page | ID | Sidebar Label | Badge |
|---|---|---|---|
| Dashboard | `page-dashboard` | Dashboard | — |
| Candidats | `page-candidats` | Candidats | 847 |
| Missions | `page-missions` | Missions | 12 |
| Contrats | `page-contrats` | Contrats | — |
| Matching | `page-matching` | Matching | — |
| Scoring CV | `page-scoring` | Scoring CV | — |
| Relances | `page-relances` | Relances | — |
| Portail Client | `page-portail` | Portail Client | — |

### Sections Sidebar
1. **Principal** : Dashboard, Candidats, Missions, Contrats
2. **Outils IA** : Matching, Scoring CV, Relances
3. **Espace Client** : Portail Client

### Footer Sidebar
Carte agence : avatar "TS" (gradient rouge/orange), "TalentStaff Lyon", "Administrateur"

---

## 2. Design System

### Palette CSS Variables
```css
--bg: #F4F6FB              /* fond global */
--surface: #FFFFFF          /* cartes, modals */
--surface-hover: #F8F9FD    /* hover lignes */
--border: #E8ECF4           /* bordures */
--border-light: #F0F2F8     /* bordures légères */
--text-primary: #1A1D2E     /* titres */
--text-secondary: #6B7294   /* texte secondaire */
--text-tertiary: #9CA3C4    /* labels, placeholders */
--accent: #6C5CE7           /* violet principal */
--accent-light: #A29BFE     /* violet clair */
--accent-bg: #F0EEFF        /* fond violet */
--accent-glow: rgba(108,92,231,0.12)
--blue: #4A90D9
--blue-bg: #EBF3FC
--green: #2ECC71
--green-bg: #E8F8F0
--orange: #F39C12
--orange-bg: #FEF5E7
--red: #E74C3C
--red-bg: #FDECEB
--sidebar-w: 260px
--header-h: 72px
--radius: 16px
--radius-sm: 10px
--shadow-sm: 0 1px 3px rgba(26,29,46,0.04)
--shadow-md: 0 4px 20px rgba(26,29,46,0.06)
--shadow-lg: 0 8px 40px rgba(26,29,46,0.08)
--shadow-accent: 0 4px 24px rgba(108,92,231,0.18)
--transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1)
```

### Typographie
- **Principale** : `'DM Sans', sans-serif`
- **Monospace** (scores, numéros) : `'Space Mono', monospace`
- Google Fonts : `DM+Sans:wght@300;400;500;600;700;800` + `Space+Mono:wght@400;700`

### Composants Récurrents

**KPI Card** : fond blanc, border, radius 16px, hover lift -2px + shadow, barre colorée top au hover (3px, gradient selon position nth-child), icône 42x42 dans cercle coloré, valeur grande (28-32px Space Mono bold), label petit (12-13px), trend badge optionnel (up vert / down rouge)

**Header Page** : 72px, sticky top, fond blanc semi-transparent + backdrop-filter blur(12px), titre gauche + sous-titre, boutons droite

**Table** : fond blanc, border, radius 16px, thead gris clair, th uppercase 11px, td 14px padding, hover ligne surface-hover, rows animées fadeUp avec stagger delay

**Drawer** : overlay backdrop-filter blur(6px), panel 540-580px depuis la droite, sticky header avec bouton fermer, body scrollable, transition slide 0.4s

**Modal** : overlay fond sombre + blur, card centrée 500-560px, animation scale+translateY, header avec titre + close, body, footer avec boutons

**Pill/Filter** : border-radius 50px, border 1.5px, état actif = fond accent violet + text blanc, transition hover

**Status Badge** : inline-flex, padding 4-5px 10-12px, border-radius 20px, fond + text colorés selon statut

**Toast** : position fixed bottom center, fond sombre, text blanc, border-radius 50px, animation slide up + fade

**Score Bar** : track 6px height gris, fill coloré (vert ≥80, orange ≥65, rouge <65), transition width 0.6s

---

## 3. Page Dashboard

### Header
- Titre : "Bonjour, Sophie 👋"
- Sous-titre : "Voici l'activité de votre agence aujourd'hui"
- Barre recherche avec raccourci ⌘K
- Bouton notification avec dot rouge

### KPIs (grille 4 colonnes)
| KPI | Valeur | Icône | Trend | Couleur barre |
|---|---|---|---|---|
| Candidats en base | 847 | 👥 | ↑ 12% | violet |
| Missions actives | 12 | 🎯 | ↑ 8% | bleu |
| Contrats ce mois | 34 | 📄 | ↑ 23% | vert |
| Taux de placement | 78% | ⚡ | ↑ 5% | orange |

### Layout Grille (1fr 380px)

**Colonne gauche :**

1. **Card "Candidats à traiter"** — tableau 4 colonnes
   | Candidat | Poste | Score IA | Statut |
   |---|---|---|---|
   | ML Marc Lefèvre (violet) | Cariste CACES 3 | 92 (vert) | Disponible (vert) |
   | SD Sarah Dubois (bleu) | Préparatrice commandes | 87 (vert) | Disponible (vert) |
   | KB Karim Benali (orange) | Manutentionnaire | 74 (orange) | En attente (orange) |
   | JM Julie Martin (rouge) | Agent de production | 81 (vert) | Placé (bleu) |

2. **Card "Missions ouvertes"** — liste avec urgency bars
   | Mission | Lieu | Début | Urgence | Matchs |
   |---|---|---|---|---|
   | 5 Caristes CACES 3 — Entrepôt Carrefour | Lyon 7e | 14 fév. | 🔴 haute | 8 |
   | 3 Préparateurs commandes — Amazon FBA | Saint-Priest | 12 fév. | 🔴 haute | 5 |
   | 2 Agents de production — Sanofi | Gerland | 17 fév. | 🟠 moyen | 3 |
   | 1 Technicien maintenance — Veolia | Villeurbanne | 24 fév. | 🟢 basse | 11 |

**Colonne droite :**

3. **Card "Activité récente"** — feed
   | Icône | Texte | Temps |
   |---|---|---|
   | 🤖 (violet) | **Agent IA** a relancé 23 candidats inactifs par SMS | 12 min |
   | 📄 (vert) | **Contrat** généré pour Marc Lefèvre — Mission Carrefour | 34 min |
   | 🎯 (bleu) | **Matching** : 8 profils trouvés pour "Cariste CACES 3" | 1h |
   | ⭐ (orange) | **Scoring** : 15 nouveaux CVs analysés et notés | 2h |
   | ✅ (vert) | **6 candidats** ont confirmé leur disponibilité | 3h |
   | 📊 (violet) | **Portail client** : Carrefour a consulté 4 profils | 4h |

4. Footer "Propulsé par IZYSS"

### Chat Widget IA (fixe bottom-right, visible uniquement sur Dashboard)
- Bulle 60x60 avec pulse animation
- Panel 400x520px avec :
  - Header : avatar ✨, "Agent IZYSS", statut "En ligne"
  - Messages : conversation demo (recherche caristes Lyon)
  - 3 suggestions : Créer contrat, Relancer candidats, Matching mission
  - Input avec bouton vocal + envoi

---

## 4. Page Candidats — CVthèque

### Header
- Titre : "CVthèque" avec icône
- Sous-titre : "847 candidats en base — 234 disponibles cette semaine"
- Boutons : "Importer CVs", "+ Ajouter", notification bell

### KPIs (4 colonnes)
| KPI | Valeur | Couleur |
|---|---|---|
| Total | 847 | violet |
| Disponibles | 234 | vert |
| En mission | 67 | bleu |
| Inactifs +90j | 156 | orange |

### Toolbar
- Barre recherche (filtre par nom, rôle, localisation, compétences)
- Pills : Tous, Disponibles, En mission, Indisponibles, Dormants
- Toggle vue : Table / Grille

### Vue Table (par défaut)
7 colonnes : Candidat (avatar+nom+rôle), Compétences (tags), Score IA (barre+valeur), Statut (badge), Localisation, Dernière activité, Actions (📄 voir / 📱 appeler / 🎯 match / 👁 portail)

### Vue Grille
Cards avec : avatar 50px gradient, SVG progress ring (score), nom, rôle, localisation, tags compétences, badge statut, boutons actions

### Données Candidats (15 entrées)
```
Champs : id, nm (nom), i (initiales), rl (rôle), gr (gradient avatar), sc (score 58-92),
st (dispo|mission|indispo|dormant), lc (localisation), date (dernière activité),
sk (array compétences avec tags), xp (expérience), tel, email, pe (permis),
mo (mobilité), ho (horaires), age, exps (array expériences pro), tl (timeline activité)
```

| Candidat | Rôle | Score | Statut |
|---|---|---|---|
| Marc Lefèvre | Cariste CACES 3 | 92 | dispo |
| Thomas Roche | Cariste CACES 1,3,5 | 89 | dispo |
| Sarah Dubois | Préparatrice commandes | 87 | dispo |
| Fatima El Amrani | Cariste CACES 3,5 | 85 | mission |
| Antoine Girard | Manutentionnaire | 78 | dispo |
| Julie Martin | Agent de production | 81 | mission |
| Sophie Morel | Cariste junior | 72 | dispo |
| Nadia Khelif | Agent logistique | 76 | mission |
| Karim Benali | Manutentionnaire | 74 | indispo |
| Pierre Blanc | Cariste confirmé | 88 | dispo |
| Lucas Ferreira | Préparateur commandes | 69 | dormant |
| Amina Diallo | Agent de production | 82 | dispo |
| Hugo Mercier | Manutentionnaire | 65 | dormant |
| Emma Laurent | Prépa. commandes frais | 79 | dispo |
| Omar Sayed | Cariste CACES 5 | 58 | indispo |

### Drawer Profil Candidat (540px)
- Hero : avatar 72px, nom, rôle, localisation, badge statut
- 4 Quick Actions : 📞 Appeler, 💬 SMS, 🎯 Matcher, 📄 Proposer
- Grille infos (8 champs) : Âge, Expérience, Téléphone, Email, Permis, Mobilité, Horaires, Score IA
- Section compétences (chips)
- Section expériences pro (blocs entreprise/période)
- Timeline activité (dots colorés + messages + timestamps)

### Modal Import CV
- Zone drag & drop pour fichiers (PDF/DOCX/JPG, jusqu'à 50)
- Notice "L'IA extraira automatiquement les informations"
- Boutons Annuler / Lancer l'extraction

### Modal Push Portail Client
- Info candidat (avatar + nom + rôle + localisation)
- Sélecteur client (dropdown 5 clients)
- Sélecteur visibilité : Profil complet (👁 vert) / Partiel (◐ orange) / Anonymisé (🔒 gris)
- Cards visuelles avec bordures/fonds colorés
- Toast confirmation avec nom client + niveau visibilité

---

## 5. Page Missions

### Header
- Titre : "Missions" avec icône briefcase
- Sous-titre : "12 missions actives — 5 à pourvoir en urgence"
- Boutons : Exporter, + Nouvelle mission, notification bell

### KPIs (5 colonnes, cliquables → filtrent la table)
| KPI | Valeur | Couleur | Filtre |
|---|---|---|---|
| Missions actives | 12 | violet | all |
| Urgentes | 5 | rouge | urgent |
| Postes pourvus ce mois | 34 | vert | filled |
| Intérimaires en poste | 67 | bleu | progress |
| Temps moyen placement | 2.1j | orange (trend -18% vert) | — |

### Toolbar
- Barre recherche
- Pills : Toutes, 🟢 Ouvertes, 🔥 Urgentes, 🔵 En cours, ✅ Pourvues
- Toggle vue : Table / Kanban

### Vue Table
8 colonnes : Mission (dot urgence + titre + client), Statut (badge), Postes (filled/total), Candidats affectés (avatars empilés), Matchings IA (nombre + mini barre), Dates, Lieu, Actions (📋/🎯/📱)

### Vue Kanban (4 colonnes)
| 🔥 Urgentes | 🟢 Ouvertes | 🔵 En cours | ✅ Pourvues |
Cards avec : dot urgence, titre, client, méta (lieu, pourvus, date), footer (avatars + matchs)

### Données Missions (8 entrées)
```
Champs : id, title, client, loc, urg (high|medium|low), st (open|progress|urgent|filled),
postes, filled, matchs, dates, ho (horaires), sk (array compétences),
cands (array {nm, i, gr, st, stc, stcc})
```

| Mission | Client | Lieu | Urgence | Statut | Postes |
|---|---|---|---|---|---|
| Caristes CACES 3 | Carrefour Supply Chain | Saint-Priest | haute | ouverte | 2/4 |
| Prépa. commandes | Amazon FBA | Saint-Priest | haute | ouverte | 3/6 |
| Agents de production | Sanofi | Gerland | moyen | en cours | 2/3 |
| Cariste CACES 5 — Grande hauteur | FM Logistic | Vénissieux | haute | urgente | 0/2 |
| Manutentionnaires | Rhenus Logistics | Corbas | moyen | ouverte | 3/5 |
| Préparateur commandes frais | Carrefour Supply Chain | Décines | basse | en cours | 2/2 |
| Cariste CACES 1 | Amazon FBA | Saint-Priest | basse | pourvue | 3/3 |
| Agents logistiques polyvalents | Rhenus Logistics | Corbas | moyen | ouverte | 1/4 |

### Drawer Détail Mission (580px)
- Header : dot urgence + titre, client + lieu, badge statut
- 3 Quick Actions : 🎯 Matching IA (primary), 📱 Relancer, 👁 Portail
- Grille infos (6 champs) : Postes pourvus, Matchings IA, Dates, Horaires, Localisation, Urgence
- Section compétences requises (tags verts)
- Section candidats affectés (liste avec avatar, nom, statut badge) ou état vide "Lancer le matching IA"

### Modal Nouvelle Mission
- Champs : Intitulé poste, Client (select), Localisation, Date début/fin, Nb postes, Horaires (select)
- Sélecteur urgence : 🔴 Critique / 🟠 Moyen / 🟢 Normal (pills toggle)
- Textarea compétences requises
- Notice IA : "L'IA lancera automatiquement le matching dès la création"
- Boutons : Annuler / 🚀 Créer et lancer le matching

---

## 6. Page Contrats

### Header
- Titre : "Contrats" avec icône document
- Sous-titre : "Gérez vos contrats et avenants en quelques clics"
- Boutons : Exporter, + Nouveau contrat

### KPIs (5 colonnes, cliquables → filtrent la table)
| KPI | Valeur | Couleur | Filtre |
|---|---|---|---|
| Contrats actifs | 34 (+8 ce mois) | vert | active |
| En attente signature | 6 | bleu | sign |
| Avenants ce mois | 12 | rose #E84393 | all |
| Expirent sous 7j | 5 | orange | expiring |
| Total annuel | 187 | violet | ended |

### Toolbar
- Barre recherche (contrat, candidat, client, numéro)
- Pills : Tous, ✅ Actifs, ✍️ À signer, ⏰ Expirent bientôt, 🏁 Terminés

### Table
7 colonnes : Candidat (avatar+nom+rôle), Client/Mission (logo emoji+nom), Période (dates+jours restants), Avancement (progress bar+%), Statut (badge), Avenants (compteur rose), Actions (📄/📎/🔄/✍️)

### Statuts
| Statut | Classe | Couleur |
|---|---|---|
| Actif | active | vert |
| À signer | sign | bleu |
| Expire bientôt | expiring | orange |
| Terminé | ended | gris |

### Données Contrats (10 entrées)
```
Champs : id, nm, i (initiales), gr (gradient), rl (rôle), cl (client), cli (emoji client),
lieu, d1 (date début YYYY-MM-DD), d2 (date fin), h (horaires), tx (taux horaire),
st (active|sign|expiring|ended), aven (array avenants), num (numéro CTT-YYYY-XXXX)

Avenant : {num, type (Prolongation|Horaires|Lieu de mission|Taux horaire), detail, date, st}
```

| Candidat | Client | Période | Statut | Avenants |
|---|---|---|---|---|
| Marc Lefèvre | Carrefour Supply Chain | 13/01→14/03 | Actif | 2 |
| Thomas Roche | Carrefour Supply Chain | 03/02→28/02 | Actif | 0 |
| Julie Martin | Amazon — Saint-Priest | 03/02→21/02 | Actif | 1 |
| Nadia Khelif | Amazon — Saint-Priest | 03/02→14/02 | Expire | 0 |
| Karim Benali | Carrefour Supply Chain | 10/02→07/03 | Actif | 0 |
| Pierre Blanc | Sanofi — Gerland | 10/02→09/05 | À signer | 0 |
| Omar Sayed | FM Logistic | 17/02→14/03 | À signer | 0 |
| Sarah Dubois | Amazon — Saint-Priest | 01/12→31/01 | Terminé | 1 |
| Fatima El Amrani | Sanofi — Gerland | 04/11→17/01 | Terminé | 2 |
| Sophie Morel | Carrefour Supply Chain | 12/02→14/02 | Expire | 0 |

### Drawer Détail Contrat (580px)
- Hero violet : avatar, nom, rôle + client, numéro contrat, badge statut
- Timeline bar visuelle : date début → date fin avec pourcentage d'avancement, jours restants
- **Avenant rapide** (4 boutons grid 2x2, si contrat non terminé) :
  - 🔄 Prolonger (modifier date fin)
  - 🕐 Modifier horaires
  - 📍 Changer le lieu
  - 💰 Modifier le taux
- Grille infos (8 champs) : Client, Lieu, Horaires, Taux horaire (accent), Début, Fin, Durée totale, N° contrat (monospace)
- Section avenants : liste cards avec numéro (rose), date, type (icône), détail, badge "✓ Signé"

### Calculs JS
- `daysBetween(d1, d2)` : calcul jours entre 2 dates
- `progress(contrat)` : % avancement basé sur date courante (2026-02-11)
- Couleur barre : vert si <80%, orange si ≥80%, gris si terminé

### Modal Nouvel Avenant
- Affiche info candidat (avatar + nom + numéro contrat)
- Champ valeur actuelle (disabled) + nouvelle valeur
- 4 types : prolongation (date), horaires (texte), lieu (texte), taux (texte)
- Notice rose : "L'avenant sera envoyé pour signature électronique"
- Confirmer → ajoute au tableau `aven[]`, met à jour les données, toast

### Modal Nouveau Contrat
- Champs : Candidat (select), Client (select), Poste, Dates début/fin, Horaires, Taux horaire, Lieu
- Notice IA : "Le contrat sera pré-rempli par l'IA"
- Confirmer → toast

---

## 7. Page Matching

### Header
- Titre : "Matching IA" avec icône pulse
- Sous-titre : "Trouvez les meilleurs candidats pour chaque mission"

### Layout 2 colonnes

**Colonne gauche : Configuration**
- Sélecteur de mission (cards cliquables, état actif = bordure accent)
  - 4 missions avec titre, client, lieu, postes
- Critères de matching (grille 2 colonnes) : Localisation, Disponibilité, CACES requis, Expérience minimum, Score IA minimum, Horaires
- Bouton "🚀 Lancer le Matching IA" (primary, pleine largeur)

**Colonne droite : Résultats**
- Header "Résultats du matching" avec compteur et bouton "Proposer les top 5"
- Liste candidats matchés (8 résultats) :
  - Card : avatar, nom, rôle, score IA (barre), score matching (grand, coloré), localisation, tags compétences
  - Boutons : Proposer, Voir profil

### Données Matching
Candidats scorés : Marc L. (95%), Thomas R. (91%), Fatima E. (88%), Omar S. (84%), Karim B. (79%), etc.

---

## 8. Page Scoring CV

### Header
- Titre : "Scoring IA" avec icône barres
- Sous-titre : "Analysez et notez automatiquement les CVs"

### Layout
- Zone de drop CV (drag & drop ou clic, fichiers PDF/DOCX/JPG)
- Bouton "🚀 Lancer l'analyse IA"
- Résultats scoring : card candidat avec :
  - Score global (grand, cercle coloré)
  - 6 critères notés individuellement (barres horizontales) : Expérience, Formation, Compétences techniques, Soft skills, Disponibilité, Adéquation poste
  - Recommandation IA (texte)

---

## 9. Page Relances

### Header
- Titre : "Relances Automatisées" avec icône téléphone
- Sous-titre : "Réactivez votre base de candidats dormants"

### KPIs (4 colonnes)
| KPI | Valeur |
|---|---|
| Campagnes actives | 3 |
| Relancés ce mois | 456 |
| Taux de réponse | 34% |
| Réactivés | 67 |

### Campagnes (liste cards)
Chaque campagne : nom, type (📋/📱/📧), description, statut (running/scheduled/done), métriques (envoyés, répondus, taux), canal (SMS/Email/Appel), couleur

### Modal Nouvelle Relance
- Sélecteur type de campagne
- Cible (filtres candidats)
- Message template
- Planification

### Feed Activité (colonne droite)
Timeline des dernières actions de relance avec timestamps

---

## 10. Page Portail Client

### Header
- Titre : "Portail Client"
- Sous-titre : "Gérez la visibilité de vos candidats pour vos clients"

### Toolbar
- Barre recherche
- Pills clients : Tous, Carrefour, Amazon, Sanofi, FM Logistic

### Grille Candidats
Cards avec : avatar, nom, rôle, score, statut, localisation, badges compétences, sélecteur de visibilité (complet/partiel/anonyme)

### Drawer Profil Client View
- Aperçu du profil tel que le client le verra
- 3 modes de visibilité avec rendu différent

### Données Portail
```
Champs candidat portail : id, nm, i, gr, rl, sc, st, lc, sk, vis (full|partial|anon)
```

---

## 11. Interactions Globales

### Navigation SPA
```javascript
function navigateTo(page) {
  // Masque toutes les .page-section
  // Affiche celle avec id="page-{page}"
  // Met à jour .nav-item active dans la sidebar
}
```

### Toast
```javascript
function showToast(message) {
  // Affiche un toast en bas center pendant 3-3.5s
  // Animation slide up + fade
}
```

### Patterns Communs
1. **Filtre par pills** : clic → met à jour variable filtre → re-render la liste/table
2. **Filtre par KPI** : clic KPI → set filtre + sync pill active + re-render + scroll vers table
3. **Recherche temps réel** : oninput → filtre par nom/rôle/client/etc → re-render
4. **Drawer open/close** : overlay + panel slide depuis droite, fermeture par overlay clic ou bouton ✕
5. **Modal open/close** : overlay + card centrée, fermeture par bouton ✕ ou Annuler
6. **Vue toggle** : Table ↔ Grid/Kanban, masque l'un affiche l'autre

### Animations
- `fadeUp` : opacity 0→1, translateY 16px→0, durée 0.4-0.5s
- Stagger delay sur listes : chaque item +0.02-0.06s
- Score bars : width 0→target% après 600ms delay
- SVG progress rings : stroke-dashoffset animé
- Cards hover : translateY(-2px) + shadow-md
- Chat panel : scale(0.96)→1 + translateY(12px)→0

---

## 12. Clients Référencés

| Client | Emoji | Secteur |
|---|---|---|
| Carrefour Supply Chain | 🏪 | Grande distribution / Logistique |
| Amazon — Saint-Priest | 📦 | E-commerce / Logistique |
| Sanofi — Gerland | 💊 | Pharmaceutique |
| FM Logistic | 🏭 | Logistique |
| Rhenus Logistics | 🚛 | Transport / Logistique |
| Veolia | — | Services / Maintenance |

---

## 13. Rôles / Qualifications Récurrents

Cariste CACES 1, Cariste CACES 3, Cariste CACES 5, Cariste CACES 1,3,5, Préparateur/trice commandes, Préparateur commandes frais, Agent de production, Agent logistique, Manutentionnaire, Technicien maintenance

---

## 14. Structure Fichier Source

```
izyss-app.html (252KB, 4018 lignes)
├── <style> (~2000 lignes CSS)
│   ├── Variables CSS globales
│   ├── Sidebar + Header + Layout communs
│   ├── Missions styles (ms-)
│   ├── Contrats styles (ct-)
│   ├── Dashboard styles (db-)
│   ├── Candidats styles (cd-)
│   ├── Matching styles (inline)
│   ├── Scoring styles (inline)
│   ├── Relances styles (inline)
│   └── Portail Client styles (pc-)
├── <body>
│   ├── Sidebar (navigation fixe)
│   ├── page-matching
│   ├── page-dashboard (+ chat widget)
│   ├── page-candidats (+ drawer + modals import/portail)
│   ├── page-missions (+ drawer + modal nouvelle mission)
│   ├── page-contrats (+ drawer + modals avenant/nouveau contrat)
│   ├── page-scoring
│   ├── page-relances (+ modal)
│   ├── page-portail (+ drawer)
│   └── Toast global
└── <script> (~2000 lignes JS)
    ├── Navigation SPA (navigateTo, showToast)
    ├── Matching JS
    ├── Scoring JS
    ├── Relances JS
    ├── Portail Client JS (pc-)
    ├── Dashboard JS (db-)
    ├── Candidats JS (cd-)
    ├── Contrats JS (ct-)
    └── Missions JS (ms-)
```

---

## 15. Notes pour l'Implémentation

1. **Toutes les données sont en dur (mock)** — à remplacer par des appels API/BDD
2. **Date de référence** : 2026-02-11 (hardcodée dans les calculs de progression contrats)
3. **Pas de persistence** — les filtres, modifications d'avenants, etc. sont en mémoire seulement
4. **Responsive minimal** : media query kanban 2 colonnes sous 1100px, pas de mobile
5. **Pas d'authentification** — l'utilisateur est "Sophie" de "TalentStaff Lyon"
6. **Localisation** : tout en français, région Lyon/Rhône-Alpes
7. **Le fichier HTML source complet est fourni séparément** comme référence visuelle pixel-perfect