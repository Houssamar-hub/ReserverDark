# 🏡 ReserverDark — Plateforme de Location Courte Durée au Maroc

<div align="center">

![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![ExpressJS](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)

**Une application web moderne, performante et complète pour la réservation et la gestion de biens immobiliers (Riads, Villas, Appartements) au Maroc.**

[Fonctionnalités](#-fonctionnalités-principales) • [Architecture & Diagrammes](#-architecture--diagrammes) • [Installation](#-installation--démarrage) • [API Documentation](#-endpoints-api) • [Structure](#-structure-du-projet)

</div>

---

## 🌟 Aperçu du Projet

**ReserverDark** est une plateforme SaaS immobilière bilingue (Français, Anglais, Arabe) dédiée au marché marocain. Elle met en relation directe les voyageurs cherchant un séjour authentique et les propriétaires de biens d'exception (Casablanca, Marrakech, Tanger, Rabat, Agadir, Fès...).

### 🎯 3 Eaux de travail distincts (RBAC) :
1. **Voyageur (Client)** : Découverte, recherche avancée, réservation en ligne, messagerie en direct, favoris et avis.
2. **Propriétaire (Hôte)** : Tableau de bord financier, publication et gestion de logements, gestion des réservations (confirmation/rejet), calendrier des disponibilités et suivi des revenus.
3. **Administrateur** : Modération des annonces, gestion des utilisateurs et propriétaires, statistiques globales et supervision de la plateforme.

---

## 📊 Architecture & Diagrammes

### 1. 👥 Diagramme de Cas d'Utilisation (Use Case)

```mermaid
flowchart LR
    Client(["👤 Client"])
    Owner(["🏠 Propriétaire"])
    Admin(["🛡️ Admin"])

    subgraph PUBLIC["🌐 Accès Public"]
        UC1["Voir les propriétés"]
        UC2["Rechercher et Filtrer"]
        UC3["Voir détail propriété"]
        UC4["S'inscrire / Se connecter"]
    end

    subgraph CLIENT_UC["🧳 Espace Client"]
        UC5["Réserver une propriété"]
        UC6["Annuler une réservation"]
        UC7["Ajouter aux favoris"]
        UC8["Laisser un avis"]
        UC9["Envoyer un message"]
        UC10["Voir les notifications"]
    end

    subgraph OWNER_UC["🏠 Espace Propriétaire"]
        UC11["Publier un bien"]
        UC12["Modifier / Supprimer un bien"]
        UC13["Confirmer / Refuser réservation"]
        UC14["Consulter revenus et calendrier"]
        UC15["Répondre aux messages"]
    end

    subgraph ADMIN_UC["🛡️ Espace Admin"]
        UC16["Approuver / Rejeter un bien"]
        UC17["Gérer les utilisateurs"]
        UC18["Consulter les statistiques"]
        UC19["Gérer les avis et rapports"]
    end

    Client --> UC1 & UC2 & UC3 & UC4
    Client --> UC5 & UC6 & UC7 & UC8 & UC9 & UC10
    Owner --> UC1 & UC4 & UC11 & UC12 & UC13 & UC14 & UC15
    Admin --> UC16 & UC17 & UC18 & UC19
```

---

### 2. 🗂️ Diagramme de Classes (Class Diagram)

```mermaid
classDiagram
    class User {
        +ObjectId _id
        +String name
        +String email
        +String password
        +String role
        +String phone
        +String avatar
        +Boolean isBlocked
        +Date createdAt
        +comparePassword(pwd) Boolean
    }

    class Property {
        +ObjectId _id
        +ObjectId owner
        +String title
        +String type
        +Number pricePerNight
        +String city
        +Array images
        +Number maxGuests
        +Number bedrooms
        +Number bathrooms
        +String status
        +Number averageRating
    }

    class Booking {
        +ObjectId _id
        +ObjectId client
        +ObjectId property
        +ObjectId owner
        +Date checkIn
        +Date checkOut
        +Number guests
        +Number totalPrice
        +String status
    }

    class Review {
        +ObjectId _id
        +ObjectId client
        +ObjectId property
        +Number rating
        +String comment
        +Date createdAt
    }

    class Notification {
        +ObjectId _id
        +ObjectId user
        +String title
        +String message
        +String type
        +String link
        +Boolean isRead
    }

    class Favorite {
        +ObjectId _id
        +ObjectId user
        +ObjectId property
    }

    class Conversation {
        +ObjectId _id
        +Array participants
        +ObjectId property
        +String lastMessage
    }

    class Message {
        +ObjectId _id
        +ObjectId conversation
        +ObjectId sender
        +String content
        +Boolean isRead
    }

    User "1" --> "0..*" Property : possède
    User "1" --> "0..*" Booking : effectue
    User "1" --> "0..*" Review : rédige
    User "1" --> "0..*" Favorite : enregistre
    User "1" --> "0..*" Notification : reçoit
    Property "1" --> "0..*" Booking : reçoit
    Property "1" --> "0..*" Review : est évalué
    Conversation "1" --> "0..*" Message : contient
```

---

### 3. 🔄 Diagramme de Séquence — Flux de Réservation

```mermaid
sequenceDiagram
    autonumber
    actor Client as 🧳 Client
    participant Frontend as 🖥️ React Frontend
    participant API as ⚙️ Express API
    participant Socket as 🔌 Socket.IO
    participant DB as 🗄️ MongoDB
    actor Owner as 🏠 Propriétaire

    Client->>Frontend: Sélectionne dates et clique Réserver
    Frontend->>API: POST /api/bookings
    API->>DB: Vérifie conflits de dates
    API->>DB: Crée réservation status pending
    API->>DB: Crée notification pour le propriétaire
    API-->>Frontend: 201 Created
    Frontend-->>Client: Réservation en attente confirmée

    API->>Socket: emit booking:new vers room owner
    Socket-->>Owner: Toast notification temps réel
    Owner->>Frontend: Ouvre /owner/bookings
    Owner->>Frontend: Clique Confirmer
    Frontend->>API: PATCH /api/bookings/:id/status confirmed
    API->>DB: Met à jour statut vers confirmed
    API->>DB: Crée notification pour le client
    API->>Socket: emit booking:updated vers room client
    Socket-->>Client: Réservation confirmée toast cliquable
    API-->>Frontend: 200 OK
    Frontend-->>Owner: Dashboard et revenus mis à jour
```

---

### 4. 🔁 Diagramme d'Activité — Cycle de vie d'une Propriété

```mermaid
flowchart TD
    A(["🏠 Propriétaire crée un bien"]) --> B["Remplit le formulaire\ntitle, type, prix, photos"]
    B --> C["Upload des images via Multer"]
    C --> D["POST /api/properties"]
    D --> E{"Validation\ndes données"}
    E -->|Erreur| F["Retourne erreurs de validation"]
    F --> B
    E -->|OK| G[("Sauvegarde en DB\nstatus: pending")]
    G --> H["Admin reçoit une notification"]
    H --> I{"Admin examine le bien"}
    I -->|Approuve| J[("status: approved")]
    I -->|Rejette| K[("status: rejected")]
    J --> L["Bien visible sur la plateforme"]
    K --> M["Propriétaire notifié du rejet"]
    L --> N{"Client intéressé ?"}
    N -->|Oui| O["Client réserve"]
    N -->|Non| P(["Fin"])
    O --> Q[("Réservation créée\nstatus: pending")]
    Q --> R{"Propriétaire répond ?"}
    R -->|Confirme| S[("status: confirmed")]
    R -->|Refuse| T[("status: cancelled")]
    S --> U["Séjour effectué"]
    U --> V["Client laisse un avis"]
    V --> W(["Fin du cycle"])
```

---
## ✨ Fonctionnalités Principales

### 🎨 Design & Expérience Utilisateur
- **Design Moderne & Épuré** : Palette Bleue Royale (`#2563EB`), cartes arrondies (`rounded-2xl`), ombrages fluides et typographie élégante.
- **Mode Sombre & Mode Clair** : Basculement automatique ou manuel avec conservation des préférences utilisateur.
- **Internationalisation (i18n)** : Prise en charge native du Français 🇫🇷, Anglais 🇬🇧 et Arabe 🇲🇦.
- **Responsive Mobile First** : Conçu pour une utilisation sur Smartphone, Tablette et Ordinateur de bureau.

### 🏠 Espace Propriétaire Complet
- **Tableau de bord** : Vue globale sur les KPIs (biens actifs, réservations, gains).
- **Mes logements** : Filtrage par statut (`Validé`, `En attente`, `Rejeté`), recherche instantanée et suppression sécurisée.
- **Ajout & Édition de logement** : Formulaire multi-champs (type, ville marocaine, commodités avec checkboxes, photos prévisualisées).
- **Gestion des réservations** : Validation ou refus des demandes en 1 clic.
- **Calendrier interactif** : Vue par mois avec repérage des dates occupées et modal des détails par jour.
- **Suivi des revenus** : Graphique mensuel des gains en MAD, ventilation par logement et historique comptable des paiements.

---

## 🛠️ Stack Technique

| Domaine | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, React Router v7, Lucide Icons, Date-fns, Axios, React Hot Toast, i18next |
| **Backend** | Node.js, Express.js, JWT (JSON Web Tokens), Bcryptjs, Express-rate-limit, Helmet, CORS |
| **Base de données** | MongoDB Atlas, Mongoose ODM |
| **Médias & Upload** | Cloudinary API, Multer |
| **Temps Réel** | Socket.IO |

---

## 🚀 Installation & Démarrage

### 1. Prérequis
- [Node.js](https://nodejs.org/) (version 18 ou supérieure)
- [MongoDB](https://www.mongodb.com/) (local ou cluster MongoDB Atlas)
- Git

### 2. Cloner le projet
```bash
git clone https://github.com/Houssamar-hub/ReserverDark.git
cd ReserverDark
```

### 3. Configuration du Backend (`/server`)
```bash
cd server
npm install
```


Lancer le serveur :
```bash
npm run dev
```

### 4. Configuration du Frontend (`/client`)
Dans un nouveau terminal :
```bash
cd client
npm install
```

Lancer le client Vite :
```bash
npm run dev
```
L'application est disponible sur : **`http://localhost:5173`**

---


---

## 🤖 ReserverDark AI — Smart Real Estate Assistant (Hacktoberfest Beni Mellal 2026)

ReserverDark intègre un assistant immobilier intelligent basé sur **Google Gemma 4** via la **Google Gemini API**, conçu spécialement pour le marché immobilier marocain et le hackathon **Hacktoberfest Beni Mellal 2026**.

### 💡 Pourquoi cette fonctionnalité résout un vrai problème ?
- **Barrière linguistique brisée** : Les Marocains cherchent souvent leurs logements en **Darija** ("Bghit appartement lkra f Beni Mellal max 2500 dh fih juj lbitat") ou en Arabe. Les moteurs de recherche traditionnels par filtres rigides échouent sur le langage naturel.
- **Zéro hallucination** : L'IA ne fabrique **JAMAIS** de fausses annonces, de faux prix ou de faux quartiers. La base de données MongoDB reste l'unique source de vérité.
- **Explications vérifiées** : L'assistant explique avec honnêteté pourquoi un bien correspond à la demande ("Thmen dakhel fl-mizaniya", "2 chambres vérifiées").
- **Comparateur & Calculateur de budget** : Calcul transparent des frais d'acquisition (notaire, conservation foncière, enregistrement) ou de location (caution usuelle, loyer) avec formules explicites.
- **Assistant de vigilance (Anti-arnaque)** : Détection d'anomalies de prix (>50% sous la moyenne locale) ou de demandes suspectes de versement d'acompte avant visite physique.

---

### 🏛️ Architecture et Flux de Données

```mermaid
flowchart TD
    User(["👤 Utilisateur (Darija / Arabe / FR / EN)"])
    UI["💻 Frontend React (Page /ai-assistant)"]
    API["⚡ API Backend Express (/api/ai)"]
    Limiter["🛡️ Rate Limiter & Validation Zod"]
    GemmaAPI["🧠 Google Gemma 4 (Gemini API)"]
    Fallback["⚙️ Moteur Déterministe Régulier (Fallback)"]
    Extractor["🔍 Query Extractor (Critères structurés)"]
    Memory["💾 Conversation Memory (Sessions & Raffinements)"]
    DB[("📦 MongoDB (Property Collection)")]
    Matcher["⚖️ Property Matcher & Ranking (Status: approved)"]
    Explainer["📝 Grounded Explanations Generator"]

    User -->|Message en langage naturel| UI
    UI -->|POST /api/ai/chat| API
    API --> Limiter
    Limiter --> Extractor
    Extractor <-->|NLU & Extraction JSON| GemmaAPI
    Extractor -.->|Secours hors-ligne| Fallback
    Extractor <--> Memory
    Extractor -->|Critères validés| Matcher
    Matcher -->|Query stricte & filtres| DB
    DB -->|Vrais biens certifiés| Matcher
    Matcher --> Explainer
    Explainer -->|Explications factuelles| UI
    UI -->|Affichage fiches réelles + Comparateur| User
```

---

### 🧠 Modèle d'IA et Fournisseur

- **Fournisseur principal** : Google Gemini API (Hosted Gemma Models).
- **Modèle sélectionné** : `gemma-4-26b-a4b-it` (configurable via variable d'environnement `GEMMA_MODEL`).
- **Modèles de repli supportés** : `gemini-2.5-flash`, `gemini-1.5-flash`.
- **SDK officiel** : `@google/genai` et `@google/generative-ai`.
- **Transparence importante** : Les poids de Gemma sont ouverts (*open weights*), mais l'utilisation de l'API hébergée par Google est une inférence managée dans le cloud et ne nécessite pas de GPU local.

---

### ⚙️ Configuration & Variables d'Environnement

Dans `server/.env` :
```env
# Clé API Google Gemini / Gemma
GEMMA_API_KEY=votre_cle_api_gemini
# Modèle utilisé (par défaut: gemma-4-26b-a4b-it)
GEMMA_MODEL=gemma-4-26b-a4b-it
# Timeout en millisecondes
GEMMA_TIMEOUT_MS=15000
```

> 💡 **Remarque** : Si aucune clé API n'est fournie ou en cas de coupure réseau, l'assistant bascule automatiquement et de façon transparente sur le **moteur déterministe hors-ligne**, sans planter ni inventer de fausses réponses.

---

### 🧪 Exécution des Tests Automatisés

Le backend dispose d'une suite de 22 tests unitaires et d'intégration validant chaque aspect de l'assistant IA :
```bash
cd server
npm test
# ou cibler directement la suite IA :
npx cross-env NODE_OPTIONS=--experimental-vm-modules jest tests/ai.test.js
```

Résultats des tests vérifiés :
- Extraction Darija, Français, Arabe, Anglais : **Passé**
- Maintien du contexte conversationnel multi-tours : **Passé**
- Filtrage strict budget, ville, types et exclusion des annonces rejetées : **Passé**
- Retours d'identifiants de biens réels uniquement : **Passé**
- Comparateur et détection des arbitrages : **Passé**
- Calculateur de frais de notaire et caution : **Passé**
- Détection des alertes de sécurité (requête d'acompte avant visite) : **Passé**
- Handlers contrôleurs Express : **Passé (22/22 tests)**

---

### 🎬 Démonstration Hackathon (Scénario Beni Mellal)

1. **Requête en Darija** :
   > *"Bghit appartement lkra f Beni Mellal, max 2500 dh, fih juj dyal lbitat."*
   - L'IA extrait : Ville: `Beni Mellal`, Type: `Appartement`, Loyer max: `2500 DH`, Chambres: `2`, Opération: `Location`.
   - L'application renvoie les appartements réels de Beni Mellal enregistrés en base.
2. **Explication ancrée** :
   > *"هاد الشقة مناسبة لطلبك حيث الثمن ديالها داخل الميزانية، وفيها جوج غرف، والمدينة كتوافق الاختيار ديالك."*
3. **Raffinement conversationnel** :
   > *"Wakha, khasni balcon."*
   - L'assistant conserve Beni Mellal, 2 chambres et le budget, et filtre pour ajouter l'équipement Balcon.
4. **Mise à jour du budget** :
   > *"Khlli budget 3000."*
   - Le budget passe à 3000 DH sans réinitialiser les critères précédents.
5. **Comparaison côte-à-côte** :
   - Sélection de 2 logements et ouverture du comparateur intelligent.
6. **Conseiller Budget & Frais** :
   - Calcul de la caution et estimation d'effort financier mensuel.
7. **Assistant de vigilance** :
   - Analyse prudente des indicateurs de sécurité de l'annonce.

## 📡 Endpoints API


### 🤖 Assistant Immobilier IA (`/api/ai`)
- `POST /api/ai/chat` — Conversation multi-tours, extraction NLU, filtrage DB et explications
- `POST /api/ai/search` — Recherche directe en langage naturel (Darija / Arabe / FR / EN)
- `POST /api/ai/compare` — Comparaison côte-à-côte de 2 à 3 logements certifiés
- `POST /api/ai/budget` — Calculateur de budget, loyer, caution ou frais d'acquisition notariés
- `POST /api/ai/analyze-listing` — Assistant de prudence et détection des indicateurs de risque
- `POST /api/ai/reset` — Réinitialiser la mémoire conversationnelle d'une session
- `GET /api/ai/status` — Diagnostic et état du modèle Google Gemma / Gemini

### 🔐 Authentification (`/api/auth`)
- `POST /api/auth/register` — Inscription (rôle: client ou owner)
- `POST /api/auth/login` — Connexion & génération du token JWT
- `GET /api/auth/me` — Récupérer les informations de l'utilisateur connecté

### 🏠 Logements (`/api/properties`)
- `GET /api/properties` — Liste des logements validés (filtres: ville, prix, type, commodités)
- `GET /api/properties/:id` — Détail d'un logement
- `GET /api/properties/owner/my` — *(Protégé Owner)* Liste des logements de l'hôte
- `POST /api/properties` — *(Protégé Owner)* Créer un nouveau logement
- `PUT /api/properties/:id` — *(Protégé Owner)* Modifier un logement
- `DELETE /api/properties/:id` — *(Protégé Owner)* Supprimer un logement

### 📅 Réservations (`/api/bookings`)
- `POST /api/bookings` — *(Protégé Client)* Créer une demande de réservation
- `GET /api/bookings/my` — *(Protégé Client)* Historique des réservations du voyageur
- `GET /api/bookings/owner` — *(Protégé Owner)* Réservations reçues par l'hôte
- `GET /api/bookings/stats` — *(Protégé Owner)* Statistiques financières et globales
- `PATCH /api/bookings/:id/status` — *(Protégé Owner)* Confirmer (`confirmed`) ou Rejeter (`rejected`)

---

## 📁 Structure du Projet

```text
ReserverDark/
├── client/                      # Application Frontend React 19 + Vite
│   ├── public/                  # Assets statiques (icônes, images de fallback)
│   ├── src/
│   │   ├── components/          # Composants réutilisables
│   │   │   ├── common/          # Button, Modal, Spinner, Input
│   │   │   ├── layout/          # Navbar, Footer, Sidebar
│   │   │   └── property/        # PropertyCard, PropertyFilters
│   │   ├── context/             # AuthContext, ThemeContext, NotificationContext
│   │   ├── i18n/                # Configurations et traductions (FR, EN, AR)
│   │   ├── pages/               # Pages organisées par rôle
│   │   │   ├── admin/           # Dashboard Admin, Users, Reports
│   │   │   ├── auth/            # Login, Register, ForgotPassword
│   │   │   ├── client/          # Client Dashboard, Bookings, Favorites, Messages
│   │   │   ├── owner/           # Dashboard, MyProperties, Add/Edit, Calendar, Revenue
│   │   │   └── public/          # Home, Properties, Details, About, Contact
│   │   ├── routes/              # AppRoutes, ProtectedRoute
│   │   ├── services/            # Client API Axios configuré
│   │   └── utils/               # formatPrice, formatDate, helpers
│   └── index.html
│
├── server/                      # Application Backend Node.js + Express
│   ├── config/                  # Connexion DB (MongoDB), Cloudinary
│   ├── controllers/             # Logique métier (Auth, Property, Booking, User)
│   ├── middleware/              # AuthMiddleware, RoleMiddleware, UploadMiddleware
│   ├── models/                  # Schémas Mongoose (User, Property, Booking, Review)
│   ├── routes/                  # Définitions des routes Express
│   ├── sockets/                 # Gestion des événements Socket.IO temps réel
│   ├── app.js                   # Configuration Express
│   └── server.js                # Point d'entrée HTTP & WebSocket
│
└── README.md                    # Documentation complète du projet
```

---

## 📄 Licence & Droits

Développé pour **ReserverDark** © 2026. Tous droits réservés.
