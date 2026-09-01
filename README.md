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

### 1. 🏗️ Architecture Globale du Système

```mermaid
flowchart TB
    subgraph Client_Layer["🖥️ Frontend (React 19 + Vite + Tailwind CSS)"]
        UI["Interface Utilisateur (Design Figma UI/UX)"]
        Auth_Context["Auth & Role Context (Client / Owner / Admin)"]
        Theme_I18n["Theme (Dark/Light) & i18n (FR/EN/AR)"]
        Socket_Client["Client Socket.IO (Chat & Notifications)"]
    end

    subgraph API_Gateway["🛡️ Serveur Backend (Node.js + Express)"]
        Middlewares["Middlewares (Auth JWT, Roles, Rate Limiter, Helmet, CORS)"]
        Controllers["Contrôleurs RESTful (Properties, Bookings, Users, Revenue)"]
        Socket_Server["Serveur Socket.IO (Messagerie Temps Réel)"]
    end

    subgraph Data_Layer["💾 Stockage & Cloud Services"]
        MongoDB[("Base de Données MongoDB")]
        Cloudinary["Stockage Médias Cloudinary (Photos Logements)"]
    end

    UI --> Auth_Context
    UI --> Theme_I18n
    UI --> Socket_Client
    
    Auth_Context -->|Requêtes HTTP + JWT| Middlewares
    Socket_Client <-->|WebSockets Temps Réel| Socket_Server
    
    Middlewares --> Controllers
    Controllers -->|Mongoose ODM| MongoDB
    Controllers -->|Upload Images| Cloudinary
```

---

### 2. 🗄️ Modèle de Données (Diagramme Entité-Relation)

```mermaid
erDiagram
    USER ||--o{ PROPERTY : "possède (Owner)"
    USER ||--o{ BOOKING : "effectue (Client)"
    USER ||--o{ REVIEW : "rédige"
    USER ||--o{ FAVORITE : "enregistre"
    USER ||--o{ NOTIFICATION : "reçoit"
    USER ||--o{ MESSAGE : "envoie / reçoit"
    
    PROPERTY ||--o{ BOOKING : "fait l'objet de"
    PROPERTY ||--o{ REVIEW : "est évalué par"
    PROPERTY ||--o{ FAVORITE : "est mis en favori"

    USER {
        ObjectId _id PK
        string name
        string email
        string password
        string role "client | owner | admin"
        string phone
        string avatar
        boolean isVerified
        datetime createdAt
    }

    PROPERTY {
        ObjectId _id PK
        ObjectId owner FK
        string title
        string description
        string type "Appartement | Villa | Riad | Maison | Studio"
        number pricePerNight
        string city
        string address
        string location
        array amenities
        array images
        number maxGuests
        number bedrooms
        number bathrooms
        string status "pending | approved | rejected | unavailable"
        number averageRating
        datetime createdAt
    }

    BOOKING {
        ObjectId _id PK
        ObjectId client FK
        ObjectId property FK
        ObjectId owner FK
        date checkIn
        date checkOut
        number guests
        number nights
        number pricePerNight
        number totalPrice
        string status "pending | confirmed | rejected | cancelled | completed"
        datetime createdAt
    }

    REVIEW {
        ObjectId _id PK
        ObjectId client FK
        ObjectId property FK
        number rating "1 à 5"
        string comment
        datetime createdAt
    }

    NOTIFICATION {
        ObjectId _id PK
        ObjectId user FK
        string title
        string message
        string type
        boolean isRead
        datetime createdAt
    }
```

---

### 3. 🔄 Flux de Réservation & Validation (Diagramme de Séquence)

```mermaid
sequenceDiagram
    autonumber
    actor Voyageur as 🧳 Voyageur (Client)
    participant Frontend as 🖥️ Frontend ReserverDark
    participant Backend as ⚙️ API Express
    participant DB as 🗄️ MongoDB
    actor Propriétaire as 🏠 Propriétaire (Hôte)

    Voyageur->>Frontend: Sélectionne les dates & clique sur "Réserver"
    Frontend->>Backend: POST /api/bookings (checkIn, checkOut, guests)
    Backend->>DB: Vérifie les conflits de dates & statut du bien
    Backend->>DB: Crée la réservation (Statut: "pending")
    Backend->>DB: Crée une notification pour l'hôte
    Backend-->>Frontend: 201 Created (Réservation en attente)
    Frontend-->>Voyageur: Affiche confirmation de demande

    Backend->)Propriétaire: Notification temps réel (Nouvelle demande de réservation)
    Propriétaire->>Frontend: Ouvre l'espace "Réservations" (/owner/bookings)
    Propriétaire->>Frontend: Clique sur "Confirmer la réservation"
    Frontend->>Backend: PATCH /api/bookings/:id/status { status: "confirmed" }
    Backend->>DB: Met à jour le statut en "confirmed"
    Backend->>DB: Notifie le voyageur (Booking Confirmed)
    Backend-->>Frontend: 200 OK
    Frontend-->>Propriétaire: Met à jour les gains et le calendrier
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

Créez un fichier `.env` dans le dossier `server/` :
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/reserverdark
JWT_SECRET=votre_cle_secrete_jwt_tres_longue_et_securisee
JWT_EXPIRE=30d

# Cloudinary (optionnel pour upload réel)
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
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

Créez un fichier `.env` dans le dossier `client/` :
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Lancer le client Vite :
```bash
npm run dev
```
L'application est disponible sur : **`http://localhost:5173`**

---

## 📡 Endpoints API

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
