# Structure de l'Application (Frontend & API)

Ce document détaille l'architecture des routes et des points d'entrée de l'API pour la plateforme de gestion d'événements.

---

## 📄 Pages (Routes Frontend)

### 🔓 Pages Publiques (Accès libre)

| Route | Description |
| :--- | :--- |
| `/` | **Page d’accueil** – Liste de tous les événements. |
| `/events/[eventSlug]` | **Détail d’un événement** : Infos générales + planning multi‑track (grille horaire/salles), avec badge “Live” sur les sessions en cours. |
| `/events/[eventSlug]/sessions/[sessionId]` | **Détail d’une session** : Titre, horaires, salle, intervenants, section questions/réponses (uniquement si la session est en cours). |
| `/events/[eventSlug]/rooms/[roomName]` | **Vue planning filtrée par salle** : Liste chronologique des sessions de cette salle, avec badge “Live”. |
| `/events/[eventSlug]/favorites` | **Liste des sessions favorites** de l’utilisateur (stockage `localStorage`). |
| `/speakers/[speakerId]` | **Page publique d’un intervenant** : Photo, bio, liens, sessions associées. |

### 🔒 Pages Admin (Authentification requise)

> **Note :** Les routes admin doivent être protégées par un middleware vérifiant la session NextAuth.

| Route | Description |
| :--- | :--- |
| `/admin/dashboard` | **Tableau de bord admin** : Statistiques simples, liens rapides. |
| `/admin/events` | **Liste des événements** avec actions (modifier/supprimer). |
| `/admin/events/new` | **Formulaire de création** d’un événement. |
| `/admin/events/[eventId]/edit` | **Édition d’un événement** : Infos générales + gestion des sessions. |
| `/admin/sessions/[sessionId]/edit` | **Édition d’une session** : Titre, horaires, salle, intervenants. |
| `/admin/speakers` | **Liste des intervenants** : Création / édition / suppression. |
| `/admin/rooms` | **Liste des salles** : Création / édition / suppression. |

---

## 🔌 Endpoints API

### 📅 Événements (Events)

| Méthode | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/events` | Liste de tous les événements. | Public |
| `GET` | `/api/events/[eventId]` | Détail d’un événement (inclut sessions + salles). | Public |
| `POST` | `/api/events` | Créer un événement. | **Admin** |
| `PUT` | `/api/events/[eventId]` | Mettre à jour un événement. | **Admin** |
| `DELETE` | `/api/events/[eventId]` | Supprimer un événement (cascade sessions/questions). | **Admin** |

### 🎤 Sessions

| Méthode | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/sessions/[sessionId]` | Détail d’une session (avec speakers, room). | Public |
| `POST` | `/api/events/[eventId]/sessions` | Ajouter une session à un événement. | **Admin** |
| `PUT` | `/api/sessions/[sessionId]` | Modifier une session. | **Admin** |
| `DELETE` | `/api/sessions/[sessionId]` | Supprimer une session. | **Admin** |

### 🏢 Salles (Rooms)

| Méthode | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/rooms` | Liste de toutes les salles. | Public |
| `POST` | `/api/rooms` | Créer une salle. | **Admin** |
| `PUT` | `/api/rooms/[roomId]` | Modifier une salle. | **Admin** |
| `DELETE` | `/api/rooms/[roomId]` | Supprimer une salle. | **Admin** |

### 🗣️ Intervenants (Speakers)

| Méthode | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/speakers` | Liste de tous les intervenants. | Public |
| `GET` | `/api/speakers/[speakerId]` | Détail d’un intervenant (avec ses sessions). | Public |
| `POST` | `/api/speakers` | Créer un intervenant. | **Admin** |
| `PUT` | `/api/speakers/[speakerId]` | Modifier un intervenant. | **Admin** |
| `DELETE` | `/api/speakers/[speakerId]` | Supprimer un intervenant. | **Admin** |

### 💬 Questions & Upvotes

| Méthode | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/sessions/[sessionId]/questions` | Liste des questions triées par upvotes (desc). | Public |
| `POST` | `/api/sessions/[sessionId]/questions` | Poster une question. Vérifie que la session est en cours. | Public |
| `POST` | `/api/questions/[questionId]/upvote` | Incrémente le compteur d’upvotes. | Public |

### 🔐 Authentification (Admin)

| Méthode | Endpoint | Description |
| :--- | :--- | :--- |
| `GET/POST` | `/api/auth/[...nextauth]` | Routes NextAuth.js (signin, signout, session, callback). |