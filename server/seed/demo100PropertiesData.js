/**
 * @file demo100PropertiesData.js
 * @description Curated, realistic dataset of 100 Moroccan property listings
 * distributed across Appartements (30), Studios (20), Villas (15), Chambres (15), Riads (10), Maisons (10).
 */

export const DEMO_OWNERS = [
  {
    "_id": "6b0100000000000000000001",
    "name": "Karim Benjelloun",
    "email": "owner.karim@reserverdark.ma",
    "phone": "+212 661-123456",
    "role": "owner",
    "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"
  },
  {
    "_id": "6b0100000000000000000002",
    "name": "Fatima Zahra Mansouri",
    "email": "owner.fatima@reserverdark.ma",
    "phone": "+212 662-234567",
    "role": "owner",
    "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80"
  },
  {
    "_id": "6b0100000000000000000003",
    "name": "Hassan El Amrani",
    "email": "owner.hassan@reserverdark.ma",
    "phone": "+212 663-345678",
    "role": "owner",
    "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"
  },
  {
    "_id": "6b0100000000000000000004",
    "name": "Nadia Chraibi",
    "email": "owner.nadia@reserverdark.ma",
    "phone": "+212 664-456789",
    "role": "owner",
    "avatar": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80"
  },
  {
    "_id": "6b0100000000000000000005",
    "name": "Omar Bennani",
    "email": "owner.omar@reserverdark.ma",
    "phone": "+212 665-567890",
    "role": "owner",
    "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"
  }
];

export const DEMO_PROPERTIES = [
  {
    "_id": "6b1000000000000000000001",
    "demoKey": "demo_prop_001",
    "owner": "6b0100000000000000000003",
    "title": "Appartement Moderne avec Balcon Centre-Ville",
    "description": "Superbe appartement meublé et lumineux au cœur de Beni Mellal, proche de tous commerces, avec grand balcon et vue dégagée.",
    "type": "Appartement",
    "listingType": "rent",
    "pricePerNight": 240,
    "location": "Centre-Ville, Beni Mellal, Maroc",
    "address": "10 Rue Centre-Ville",
    "city": "Beni Mellal",
    "images": [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Balcon",
      "Climatisation",
      "Cuisine équipée",
      "Parking gratuit"
    ],
    "maxGuests": 4,
    "bedrooms": 2,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.4
  },
  {
    "_id": "6b1000000000000000000002",
    "demoKey": "demo_prop_002",
    "owner": "6b0100000000000000000003",
    "title": "Appartement Économique Quartier Al Qods",
    "description": "Appartement chaleureux de 2 chambres à Beni Mellal, quartier calme et familial, proche des commodités et axes principaux.",
    "type": "Appartement",
    "listingType": "rent",
    "pricePerNight": 200,
    "location": "Al Qods, Beni Mellal, Maroc",
    "address": "13 Rue Al Qods",
    "city": "Beni Mellal",
    "images": [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Cuisine équipée",
      "Chauffage"
    ],
    "maxGuests": 4,
    "bedrooms": 2,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.5
  },
  {
    "_id": "6b1000000000000000000003",
    "demoKey": "demo_prop_003",
    "owner": "6b0100000000000000000003",
    "title": "Appartement Spacieux Proche Campus",
    "description": "Grand appartement 3 chambres idéal pour famille ou enseignants, à proximité immédiate de l’Université Sultan Moulay Slimane.",
    "type": "Appartement",
    "listingType": "rent",
    "pricePerNight": 320,
    "location": "Quartier Universitaire, Beni Mellal, Maroc",
    "address": "16 Rue Quartier Universitaire",
    "city": "Beni Mellal",
    "images": [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Cuisine équipée",
      "Balcon",
      "Machine à laver"
    ],
    "maxGuests": 5,
    "bedrooms": 3,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.6
  },
  {
    "_id": "6b1000000000000000000004",
    "demoKey": "demo_prop_004",
    "owner": "6b0100000000000000000003",
    "title": "Bel Appartement Familial sur Avenue Hassan II",
    "description": "Appartement standing avec salon marocain et salon moderne, cuisine équipée et parking sécurisé en sous-sol.",
    "type": "Appartement",
    "listingType": "rent",
    "pricePerNight": 380,
    "location": "Avenue Hassan II, Beni Mellal, Maroc",
    "address": "19 Rue Avenue Hassan II",
    "city": "Beni Mellal",
    "images": [
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Climatisation",
      "Parking gratuit",
      "Télévision",
      "Cuisine équipée"
    ],
    "maxGuests": 6,
    "bedrooms": 3,
    "bathrooms": 2,
    "status": "approved",
    "averageRating": 4.7
  },
  {
    "_id": "6b1000000000000000000005",
    "demoKey": "demo_prop_005",
    "owner": "6b0100000000000000000003",
    "title": "Appartement Panoramique Vue Ain Asserdoun",
    "description": "Très bel appartement perché face à la source d’Ain Asserdoun et aux vergers d’oliviers. Cadre paisible et terrasse agréable.",
    "type": "Appartement",
    "listingType": "rent",
    "pricePerNight": 350,
    "location": "Ain Asserdoun, Beni Mellal, Maroc",
    "address": "22 Rue Ain Asserdoun",
    "city": "Beni Mellal",
    "images": [
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80",
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Terrasse",
      "Balcon",
      "Cuisine équipée",
      "Eau chaude"
    ],
    "maxGuests": 4,
    "bedrooms": 2,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.8
  },
  {
    "_id": "6b1000000000000000000006",
    "demoKey": "demo_prop_006",
    "owner": "6b0100000000000000000002",
    "title": "Appartement Moderne Coeur de Maârif",
    "description": "Appartement contemporain à deux pas du boulevard Al Massira et du Twin Center, idéal pour séjour d’affaires ou shopping.",
    "type": "Appartement",
    "listingType": "rent",
    "pricePerNight": 550,
    "location": "Maârif, Casablanca, Maroc",
    "address": "25 Rue Maârif",
    "city": "Casablanca",
    "images": [
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80",
      "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Climatisation",
      "Ascenseur",
      "Cuisine équipée",
      "Machine à laver"
    ],
    "maxGuests": 4,
    "bedrooms": 2,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.9
  },
  {
    "_id": "6b1000000000000000000007",
    "demoKey": "demo_prop_007",
    "owner": "6b0100000000000000000002",
    "title": "Loft Élégant Quartier Gauthier",
    "description": "Appartement design décoré avec goût dans le quartier prisé de Gauthier, restaurants branchés et galeries à pied.",
    "type": "Appartement",
    "listingType": "rent",
    "pricePerNight": 650,
    "location": "Gauthier, Casablanca, Maroc",
    "address": "28 Rue Gauthier",
    "city": "Casablanca",
    "images": [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Climatisation",
      "Balcon",
      "Cuisine équipée"
    ],
    "maxGuests": 2,
    "bedrooms": 1,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.4
  },
  {
    "_id": "6b1000000000000000000008",
    "demoKey": "demo_prop_008",
    "owner": "6b0100000000000000000002",
    "title": "Appartement de Standing Triangle d’Or Racine",
    "description": "Prestations haut de gamme au Triangle d’Or : grand salon lumineux, suite parentale, finitions marbre et parquet.",
    "type": "Appartement",
    "listingType": "rent",
    "pricePerNight": 850,
    "location": "Racine, Casablanca, Maroc",
    "address": "31 Rue Racine",
    "city": "Casablanca",
    "images": [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Climatisation",
      "Parking gratuit",
      "Ascenseur",
      "Cuisine équipée"
    ],
    "maxGuests": 4,
    "bedrooms": 2,
    "bathrooms": 2,
    "status": "approved",
    "averageRating": 4.5
  },
  {
    "_id": "6b1000000000000000000009",
    "demoKey": "demo_prop_009",
    "owner": "6b0100000000000000000002",
    "title": "Appartement Spacieux Vue Mer Boulevard d’Anfa",
    "description": "Spacieux appartement familial avec vue dégagée sur l’Atlantique, double salon et cuisine moderne tout équipée.",
    "type": "Appartement",
    "listingType": "rent",
    "pricePerNight": 920,
    "location": "Anfa, Casablanca, Maroc",
    "address": "34 Rue Anfa",
    "city": "Casablanca",
    "images": [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Vue sur mer",
      "Balcon",
      "Climatisation",
      "Parking gratuit"
    ],
    "maxGuests": 6,
    "bedrooms": 3,
    "bathrooms": 2,
    "status": "approved",
    "averageRating": 4.6
  },
  {
    "_id": "6b1000000000000000000010",
    "demoKey": "demo_prop_010",
    "owner": "6b0100000000000000000002",
    "title": "Appartement Cosy Proche Mosquée Hassan II",
    "description": "Logement confortable et bien situé à Bourgogne Ouest, à 10 minutes de marche de la prestigieuse Mosquée Hassan II.",
    "type": "Appartement",
    "listingType": "rent",
    "pricePerNight": 480,
    "location": "Bourgogne, Casablanca, Maroc",
    "address": "37 Rue Bourgogne",
    "city": "Casablanca",
    "images": [
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Cuisine équipée",
      "Télévision",
      "Machine à laver"
    ],
    "maxGuests": 4,
    "bedrooms": 2,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.7
  },
  {
    "_id": "6b1000000000000000000011",
    "demoKey": "demo_prop_011",
    "owner": "6b0100000000000000000001",
    "title": "Appartement Moderne avec Terrasse à Guéliz",
    "description": "En plein centre moderne de Guéliz, superbe appartement avec terrasse ensoleillée, proche de la gare et de Carré Eden.",
    "type": "Appartement",
    "listingType": "rent",
    "pricePerNight": 450,
    "location": "Guéliz, Marrakech, Maroc",
    "address": "40 Rue Guéliz",
    "city": "Marrakech",
    "images": [
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80",
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Climatisation",
      "Terrasse",
      "Piscine",
      "Ascenseur"
    ],
    "maxGuests": 4,
    "bedrooms": 2,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.8
  },
  {
    "_id": "6b1000000000000000000012",
    "demoKey": "demo_prop_012",
    "owner": "6b0100000000000000000001",
    "title": "Appartement Prestigieux Quartier Hivernage",
    "description": "Résidence calme et sécurisée avec piscine dans le quartier chic de l’Hivernage, à quelques minutes de la place Jemaa El Fna.",
    "type": "Appartement",
    "listingType": "rent",
    "pricePerNight": 700,
    "location": "Hivernage, Marrakech, Maroc",
    "address": "43 Rue Hivernage",
    "city": "Marrakech",
    "images": [
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80",
      "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Piscine",
      "Climatisation",
      "Parking gratuit",
      "Balcon"
    ],
    "maxGuests": 4,
    "bedrooms": 2,
    "bathrooms": 2,
    "status": "approved",
    "averageRating": 4.9
  },
  {
    "_id": "6b1000000000000000000013",
    "demoKey": "demo_prop_013",
    "owner": "6b0100000000000000000001",
    "title": "Bel Appartement Face au Jardin Majorelle",
    "description": "Emplacement exceptionnel face aux jardins Majorelle et au Musée Yves Saint Laurent. Décoration raffinée arabo-andalouse.",
    "type": "Appartement",
    "listingType": "rent",
    "pricePerNight": 580,
    "location": "Majorelle, Marrakech, Maroc",
    "address": "46 Rue Majorelle",
    "city": "Marrakech",
    "images": [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Climatisation",
      "Balcon",
      "Cuisine équipée"
    ],
    "maxGuests": 4,
    "bedrooms": 2,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.4
  },
  {
    "_id": "6b1000000000000000000014",
    "demoKey": "demo_prop_014",
    "owner": "6b0100000000000000000001",
    "title": "Appartement Contemporain dans Complexe avec Piscine",
    "description": "Idéal vacances en famille : grand appartement dans résidence fermée avec parc arboré, piscines et sécurité 24h/24.",
    "type": "Appartement",
    "listingType": "rent",
    "pricePerNight": 620,
    "location": "Agdal, Marrakech, Maroc",
    "address": "49 Rue Agdal",
    "city": "Marrakech",
    "images": [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Piscine",
      "Jardin",
      "Climatisation",
      "Parking gratuit"
    ],
    "maxGuests": 6,
    "bedrooms": 3,
    "bathrooms": 2,
    "status": "approved",
    "averageRating": 4.5
  },
  {
    "_id": "6b1000000000000000000015",
    "demoKey": "demo_prop_015",
    "owner": "6b0100000000000000000002",
    "title": "Appartement Lumineux Avenue de France Agdal",
    "description": "Superbe appartement situé sur l’avenue de France, entouré de cafés, tramway à 2 minutes et accès rapide au centre administratif.",
    "type": "Appartement",
    "listingType": "rent",
    "pricePerNight": 520,
    "location": "Agdal, Rabat, Maroc",
    "address": "52 Rue Agdal",
    "city": "Rabat",
    "images": [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Climatisation",
      "Balcon",
      "Ascenseur",
      "Cuisine équipée"
    ],
    "maxGuests": 4,
    "bedrooms": 2,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.6
  },
  {
    "_id": "6b1000000000000000000016",
    "demoKey": "demo_prop_016",
    "owner": "6b0100000000000000000002",
    "title": "Appartement de Charme Proche Tour Hassan",
    "description": "Quartier historique calme et verdoyant, à deux pas du mausolée Mohammed V et des berges du Bouregreg.",
    "type": "Appartement",
    "listingType": "rent",
    "pricePerNight": 460,
    "location": "Hassan, Rabat, Maroc",
    "address": "55 Rue Hassan",
    "city": "Rabat",
    "images": [
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Chauffage",
      "Cuisine équipée",
      "Télévision"
    ],
    "maxGuests": 4,
    "bedrooms": 2,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.7
  },
  {
    "_id": "6b1000000000000000000017",
    "demoKey": "demo_prop_017",
    "owner": "6b0100000000000000000002",
    "title": "Appartement Haut Standing Hay Riad Mahaj",
    "description": "Au cœur du centre d’affaires de Hay Riad, appartement moderne et sécurisé, parfait pour consultants et expatriés.",
    "type": "Appartement",
    "listingType": "rent",
    "pricePerNight": 750,
    "location": "Hay Riad, Rabat, Maroc",
    "address": "58 Rue Hay Riad",
    "city": "Rabat",
    "images": [
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80",
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Climatisation",
      "Parking gratuit",
      "Ascenseur",
      "Cuisine équipée"
    ],
    "maxGuests": 4,
    "bedrooms": 2,
    "bathrooms": 2,
    "status": "approved",
    "averageRating": 4.8
  },
  {
    "_id": "6b1000000000000000000018",
    "demoKey": "demo_prop_018",
    "owner": "6b0100000000000000000004",
    "title": "Appartement Front de Mer Vue Baie de Tanger",
    "description": "Magnifique vue panoramique sur la baie de Tanger et le détroit de Gibraltar. Accès direct à la corniche et à la plage.",
    "type": "Appartement",
    "listingType": "rent",
    "pricePerNight": 680,
    "location": "Malabata, Tanger, Maroc",
    "address": "61 Rue Malabata",
    "city": "Tanger",
    "images": [
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80",
      "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Vue sur mer",
      "Balcon",
      "Climatisation",
      "Parking gratuit"
    ],
    "maxGuests": 4,
    "bedrooms": 2,
    "bathrooms": 2,
    "status": "approved",
    "averageRating": 4.9
  },
  {
    "_id": "6b1000000000000000000019",
    "demoKey": "demo_prop_019",
    "owner": "6b0100000000000000000004",
    "title": "Grand Appartement Boulevard Pasteur",
    "description": "Emplacement central dans le Tanger historique des années 30, hauts plafonds, balcon filant et vue sur la place de France.",
    "type": "Appartement",
    "listingType": "rent",
    "pricePerNight": 500,
    "location": "Centre, Tanger, Maroc",
    "address": "64 Rue Centre",
    "city": "Tanger",
    "images": [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Balcon",
      "Cuisine équipée",
      "Machine à laver"
    ],
    "maxGuests": 6,
    "bedrooms": 3,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.4
  },
  {
    "_id": "6b1000000000000000000020",
    "demoKey": "demo_prop_020",
    "owner": "6b0100000000000000000004",
    "title": "Appartement Paisible Quartier Marshan",
    "description": "Près du Palais Marshan et du mythique café Hafa, appartement lumineux avec jardin de copropriété.",
    "type": "Appartement",
    "listingType": "rent",
    "pricePerNight": 420,
    "location": "Marshan, Tanger, Maroc",
    "address": "67 Rue Marshan",
    "city": "Tanger",
    "images": [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Jardin",
      "Cuisine équipée",
      "Eau chaude"
    ],
    "maxGuests": 4,
    "bedrooms": 2,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.5
  },
  {
    "_id": "6b1000000000000000000021",
    "demoKey": "demo_prop_021",
    "owner": "6b0100000000000000000005",
    "title": "Appartement de Luxe Marina Agadir",
    "description": "Vivez au rythme de la Marina : vue sur les yachts, accès direct à la promenade maritime et plage de sable fin.",
    "type": "Appartement",
    "listingType": "rent",
    "pricePerNight": 850,
    "location": "Marina, Agadir, Maroc",
    "address": "70 Rue Marina",
    "city": "Agadir",
    "images": [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Piscine",
      "Vue sur mer",
      "Climatisation",
      "Parking gratuit"
    ],
    "maxGuests": 4,
    "bedrooms": 2,
    "bathrooms": 2,
    "status": "approved",
    "averageRating": 4.6
  },
  {
    "_id": "6b1000000000000000000022",
    "demoKey": "demo_prop_022",
    "owner": "6b0100000000000000000005",
    "title": "Appartement Résidentiel Quartier Sonaba Founty",
    "description": "Quartier résidentiel prisé à 500m de l’océan, piscine privée dans la résidence et terrasse bien orientée.",
    "type": "Appartement",
    "listingType": "rent",
    "pricePerNight": 550,
    "location": "Sonaba, Agadir, Maroc",
    "address": "73 Rue Sonaba",
    "city": "Agadir",
    "images": [
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Piscine",
      "Balcon",
      "Climatisation",
      "Parking gratuit"
    ],
    "maxGuests": 4,
    "bedrooms": 2,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.7
  },
  {
    "_id": "6b1000000000000000000023",
    "demoKey": "demo_prop_023",
    "owner": "6b0100000000000000000005",
    "title": "Appartement Surf & Détente Taghazout Bay",
    "description": "À 15 min d’Agadir, appartement moderne avec terrasse face aux spots de surf mondialement renommés.",
    "type": "Appartement",
    "listingType": "rent",
    "pricePerNight": 600,
    "location": "Taghazout Bay, Agadir, Maroc",
    "address": "76 Rue Taghazout Bay",
    "city": "Agadir",
    "images": [
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80",
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Terrasse",
      "Vue sur mer",
      "Piscine",
      "Climatisation"
    ],
    "maxGuests": 4,
    "bedrooms": 2,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.8
  },
  {
    "_id": "6b1000000000000000000024",
    "demoKey": "demo_prop_024",
    "owner": "6b0100000000000000000005",
    "title": "Appartement Moderne Avenue Hassan II Fès",
    "description": "Appartement confortable et spacieux dans la ville moderne, accès direct aux banques, gare ONCF et restaurants.",
    "type": "Appartement",
    "listingType": "rent",
    "pricePerNight": 340,
    "location": "Ville Nouvelle, Fès, Maroc",
    "address": "79 Rue Ville Nouvelle",
    "city": "Fès",
    "images": [
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80",
      "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Climatisation",
      "Ascenseur",
      "Cuisine équipée"
    ],
    "maxGuests": 4,
    "bedrooms": 2,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.9
  },
  {
    "_id": "6b1000000000000000000025",
    "demoKey": "demo_prop_025",
    "owner": "6b0100000000000000000005",
    "title": "Appartement Familial Champs de Course",
    "description": "Grand logement avec salon traditionnel fassi et chambres bien isolées, idéal pour visiter Fès en famille.",
    "type": "Appartement",
    "listingType": "rent",
    "pricePerNight": 380,
    "location": "Champs de Course, Fès, Maroc",
    "address": "82 Rue Champs de Course",
    "city": "Fès",
    "images": [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Climatisation",
      "Parking gratuit",
      "Cuisine équipée"
    ],
    "maxGuests": 6,
    "bedrooms": 3,
    "bathrooms": 2,
    "status": "approved",
    "averageRating": 4.4
  },
  {
    "_id": "6b1000000000000000000026",
    "demoKey": "demo_prop_026",
    "owner": "6b0100000000000000000001",
    "title": "Appartement Vue Océan Corniche Essaouira",
    "description": "Face à la plage d’Essaouira, terrasse protégée du vent avec vue sur les îles Purpuraires. Ambiance bohème chic.",
    "type": "Appartement",
    "listingType": "rent",
    "pricePerNight": 480,
    "location": "Bord de Mer, Essaouira, Maroc",
    "address": "85 Rue Bord de Mer",
    "city": "Essaouira",
    "images": [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Vue sur mer",
      "Balcon",
      "Cuisine équipée"
    ],
    "maxGuests": 4,
    "bedrooms": 2,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.5
  },
  {
    "_id": "6b1000000000000000000027",
    "demoKey": "demo_prop_027",
    "owner": "6b0100000000000000000001",
    "title": "Appartement Ensoleillé Quartier des Dunes",
    "description": "Logement calme et lumineux dans un quartier résidentiel récent, à quelques minutes de la médina et des clubs de kitesurf.",
    "type": "Appartement",
    "listingType": "rent",
    "pricePerNight": 350,
    "location": "Dunes, Essaouira, Maroc",
    "address": "88 Rue Dunes",
    "city": "Essaouira",
    "images": [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Cuisine équipée",
      "Parking gratuit",
      "Machine à laver"
    ],
    "maxGuests": 4,
    "bedrooms": 2,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.6
  },
  {
    "_id": "6b1000000000000000000028",
    "demoKey": "demo_prop_028",
    "owner": "6b0100000000000000000004",
    "title": "Appartement Vue Montagne et Ville Bleue",
    "description": "Perché sur les hauteurs, appartement traditionnel avec grand balcon offrant un panorama magique sur Chefchaouen.",
    "type": "Appartement",
    "listingType": "rent",
    "pricePerNight": 360,
    "location": "Hauts de Chaouen, Chefchaouen, Maroc",
    "address": "91 Rue Hauts de Chaouen",
    "city": "Chefchaouen",
    "images": [
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Balcon",
      "Chauffage",
      "Cuisine équipée"
    ],
    "maxGuests": 4,
    "bedrooms": 2,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.7
  },
  {
    "_id": "6b1000000000000000000029",
    "demoKey": "demo_prop_029",
    "owner": "6b0100000000000000000004",
    "title": "Appartement Élégant Quartier Wilaya Tétouan",
    "description": "Bâtisse moderne aux finitions andalouses, proche de la Faculté et à 15 minutes des plages de Martil et Cabo Negro.",
    "type": "Appartement",
    "listingType": "rent",
    "pricePerNight": 390,
    "location": "Wilaya, Tétouan, Maroc",
    "address": "94 Rue Wilaya",
    "city": "Tétouan",
    "images": [
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80",
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Climatisation",
      "Parking gratuit",
      "Cuisine équipée"
    ],
    "maxGuests": 4,
    "bedrooms": 2,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.8
  },
  {
    "_id": "6b1000000000000000000030",
    "demoKey": "demo_prop_030",
    "owner": "6b0100000000000000000003",
    "title": "Appartement Chaleureux Style Chalet Ifrane",
    "description": "Ambiance montagnarde avec cheminée et parquet boisé. Proche de la statue du Lion et du campus de l’Université Al Akhawayn.",
    "type": "Appartement",
    "listingType": "rent",
    "pricePerNight": 490,
    "location": "Centre, Ifrane, Maroc",
    "address": "97 Rue Centre",
    "city": "Ifrane",
    "images": [
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80",
      "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Chauffage",
      "Cuisine équipée",
      "Parking gratuit"
    ],
    "maxGuests": 5,
    "bedrooms": 2,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.9
  },
  {
    "_id": "6b1000000000000000000031",
    "demoKey": "demo_prop_031",
    "owner": "6b0100000000000000000003",
    "title": "Studio Cosy Proche Université Sultan Moulay Slimane",
    "description": "Studio fonctionnel et équipé d’un bureau, connexion internet haut débit, idéal pour étudiant ou chercheur.",
    "type": "Studio",
    "listingType": "rent",
    "pricePerNight": 150,
    "location": "Quartier Universitaire, Beni Mellal, Maroc",
    "address": "5 Avenue Quartier Universitaire",
    "city": "Beni Mellal",
    "images": [
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80",
      "https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Cuisine équipée",
      "Bureau"
    ],
    "maxGuests": 2,
    "bedrooms": 1,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.3
  },
  {
    "_id": "6b1000000000000000000032",
    "demoKey": "demo_prop_032",
    "owner": "6b0100000000000000000003",
    "title": "Studio Neuf Centre-Ville Beni Mellal",
    "description": "Studio refait à neuf, lit double de qualité, kitchenette et douche italienne. Emplacement central parfait.",
    "type": "Studio",
    "listingType": "rent",
    "pricePerNight": 190,
    "location": "Centre-Ville, Beni Mellal, Maroc",
    "address": "9 Avenue Centre-Ville",
    "city": "Beni Mellal",
    "images": [
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&q=80",
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Climatisation",
      "Cuisine équipée",
      "Eau chaude"
    ],
    "maxGuests": 2,
    "bedrooms": 1,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.4
  },
  {
    "_id": "6b1000000000000000000033",
    "demoKey": "demo_prop_033",
    "owner": "6b0100000000000000000003",
    "title": "Studio Pratique Quartier de la Kasbah",
    "description": "Petit nid douillet proche des commerces traditionnels de Beni Mellal, très économique pour court séjour.",
    "type": "Studio",
    "listingType": "rent",
    "pricePerNight": 140,
    "location": "Kasbah, Beni Mellal, Maroc",
    "address": "13 Avenue Kasbah",
    "city": "Beni Mellal",
    "images": [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80",
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Eau chaude",
      "Cuisine équipée"
    ],
    "maxGuests": 2,
    "bedrooms": 1,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.5
  },
  {
    "_id": "6b1000000000000000000034",
    "demoKey": "demo_prop_034",
    "owner": "6b0100000000000000000003",
    "title": "Studio Meublé Moderne Beni Mellal",
    "description": "Logement indépendant climatisé avec kitchenette équipée et balconnet, proche des transports.",
    "type": "Studio",
    "listingType": "rent",
    "pricePerNight": 180,
    "location": "Al Adarissa, Beni Mellal, Maroc",
    "address": "17 Avenue Al Adarissa",
    "city": "Beni Mellal",
    "images": [
      "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Climatisation",
      "Balcon",
      "Cuisine équipée"
    ],
    "maxGuests": 2,
    "bedrooms": 1,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.6
  },
  {
    "_id": "6b1000000000000000000035",
    "demoKey": "demo_prop_035",
    "owner": "6b0100000000000000000002",
    "title": "Studio Moderne Proche Twin Center",
    "description": "Studio tendance au cœur battant de Maârif, lit escamotable, coin salon et espace travail connecté.",
    "type": "Studio",
    "listingType": "rent",
    "pricePerNight": 380,
    "location": "Maârif Twin Center, Casablanca, Maroc",
    "address": "21 Avenue Maârif Twin Center",
    "city": "Casablanca",
    "images": [
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80",
      "https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Climatisation",
      "Ascenseur",
      "Cuisine équipée"
    ],
    "maxGuests": 2,
    "bedrooms": 1,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.7
  },
  {
    "_id": "6b1000000000000000000036",
    "demoKey": "demo_prop_036",
    "owner": "6b0100000000000000000002",
    "title": "Studio Loft Minimaliste Gauthier",
    "description": "Studio de standing pensé pour voyageurs d’affaires : wifi fibre, machine Nespresso et literie hôtelière.",
    "type": "Studio",
    "listingType": "rent",
    "pricePerNight": 450,
    "location": "Gauthier, Casablanca, Maroc",
    "address": "25 Avenue Gauthier",
    "city": "Casablanca",
    "images": [
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&q=80",
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Climatisation",
      "Ascenseur",
      "Cuisine équipée"
    ],
    "maxGuests": 2,
    "bedrooms": 1,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.3
  },
  {
    "_id": "6b1000000000000000000037",
    "demoKey": "demo_prop_037",
    "owner": "6b0100000000000000000002",
    "title": "Studio High-Tech Casa Finance City",
    "description": "Au sein du nouveau pôle financier de Casablanca, studio neuf dans immeuble sécurisé avec salle de sport.",
    "type": "Studio",
    "listingType": "rent",
    "pricePerNight": 490,
    "location": "CFC (Finance City), Casablanca, Maroc",
    "address": "29 Avenue CFC (Finance City)",
    "city": "Casablanca",
    "images": [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80",
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Climatisation",
      "Parking gratuit",
      "Ascenseur"
    ],
    "maxGuests": 2,
    "bedrooms": 1,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.4
  },
  {
    "_id": "6b1000000000000000000038",
    "demoKey": "demo_prop_038",
    "owner": "6b0100000000000000000002",
    "title": "Studio Économique Bourgogne",
    "description": "Studio propre et fonctionnel à quelques minutes du front de mer et des commodités urbaines.",
    "type": "Studio",
    "listingType": "rent",
    "pricePerNight": 300,
    "location": "Bourgogne, Casablanca, Maroc",
    "address": "33 Avenue Bourgogne",
    "city": "Casablanca",
    "images": [
      "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Cuisine équipée",
      "Télévision"
    ],
    "maxGuests": 2,
    "bedrooms": 1,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.5
  },
  {
    "_id": "6b1000000000000000000039",
    "demoKey": "demo_prop_039",
    "owner": "6b0100000000000000000001",
    "title": "Studio Contemporain Guéliz Plaza",
    "description": "Pied-à-terre parfait pour découvrir Marrakech : studio climatisé à 100m du centre commercial Carré Eden.",
    "type": "Studio",
    "listingType": "rent",
    "pricePerNight": 320,
    "location": "Guéliz Plaza, Marrakech, Maroc",
    "address": "37 Avenue Guéliz Plaza",
    "city": "Marrakech",
    "images": [
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80",
      "https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Climatisation",
      "Cuisine équipée",
      "Ascenseur"
    ],
    "maxGuests": 2,
    "bedrooms": 1,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.6
  },
  {
    "_id": "6b1000000000000000000040",
    "demoKey": "demo_prop_040",
    "owner": "6b0100000000000000000001",
    "title": "Studio Chic Quartier Hivernage",
    "description": "Studio de charme dans une résidence arborée avec piscine collective, calme absolu en plein quartier chic.",
    "type": "Studio",
    "listingType": "rent",
    "pricePerNight": 420,
    "location": "Hivernage, Marrakech, Maroc",
    "address": "41 Avenue Hivernage",
    "city": "Marrakech",
    "images": [
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&q=80",
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Piscine",
      "Climatisation",
      "Balcon"
    ],
    "maxGuests": 2,
    "bedrooms": 1,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.7
  },
  {
    "_id": "6b1000000000000000000041",
    "demoKey": "demo_prop_041",
    "owner": "6b0100000000000000000001",
    "title": "Studio Artistique Proche Majorelle",
    "description": "Studio baigné de lumière naturelle, touches de décoration berbère moderne et petit balcon fleuri.",
    "type": "Studio",
    "listingType": "rent",
    "pricePerNight": 350,
    "location": "Majorelle, Marrakech, Maroc",
    "address": "45 Avenue Majorelle",
    "city": "Marrakech",
    "images": [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80",
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Climatisation",
      "Balcon",
      "Cuisine équipée"
    ],
    "maxGuests": 2,
    "bedrooms": 1,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.3
  },
  {
    "_id": "6b1000000000000000000042",
    "demoKey": "demo_prop_042",
    "owner": "6b0100000000000000000002",
    "title": "Studio Cosy Agdal Gare",
    "description": "À 3 minutes à pied de la gare Rabat Agdal, idéal pour les voyageurs en train et les missions professionnelles.",
    "type": "Studio",
    "listingType": "rent",
    "pricePerNight": 360,
    "location": "Agdal Centre, Rabat, Maroc",
    "address": "49 Avenue Agdal Centre",
    "city": "Rabat",
    "images": [
      "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Climatisation",
      "Ascenseur",
      "Cuisine équipée"
    ],
    "maxGuests": 2,
    "bedrooms": 1,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.4
  },
  {
    "_id": "6b1000000000000000000043",
    "demoKey": "demo_prop_043",
    "owner": "6b0100000000000000000002",
    "title": "Studio Indépendant Quartier Hassan",
    "description": "Studio calme avec kitchenette, situé dans une ruelle paisible à deux pas de la ligne de tramway.",
    "type": "Studio",
    "listingType": "rent",
    "pricePerNight": 290,
    "location": "Hassan, Rabat, Maroc",
    "address": "53 Avenue Hassan",
    "city": "Rabat",
    "images": [
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80",
      "https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Cuisine équipée",
      "Chauffage"
    ],
    "maxGuests": 2,
    "bedrooms": 1,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.5
  },
  {
    "_id": "6b1000000000000000000044",
    "demoKey": "demo_prop_044",
    "owner": "6b0100000000000000000002",
    "title": "Studio Lumineux Quartier des Orangers",
    "description": "Quartier central très apprécié, commerces de proximité, studio rénové avec soin.",
    "type": "Studio",
    "listingType": "rent",
    "pricePerNight": 310,
    "location": "Les Orangers, Rabat, Maroc",
    "address": "57 Avenue Les Orangers",
    "city": "Rabat",
    "images": [
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&q=80",
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Cuisine équipée",
      "Télévision"
    ],
    "maxGuests": 2,
    "bedrooms": 1,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.6
  },
  {
    "_id": "6b1000000000000000000045",
    "demoKey": "demo_prop_045",
    "owner": "6b0100000000000000000004",
    "title": "Studio Moderne Face Gare TGV Tanger",
    "description": "Studio tout confort dans la tour Tanger City Center, accès immédiat au centre commercial et à la plage.",
    "type": "Studio",
    "listingType": "rent",
    "pricePerNight": 380,
    "location": "Tanger City Center, Tanger, Maroc",
    "address": "61 Avenue Tanger City Center",
    "city": "Tanger",
    "images": [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80",
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Climatisation",
      "Ascenseur",
      "Vue sur mer"
    ],
    "maxGuests": 2,
    "bedrooms": 1,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.7
  },
  {
    "_id": "6b1000000000000000000046",
    "demoKey": "demo_prop_046",
    "owner": "6b0100000000000000000004",
    "title": "Studio Vue Mer Corniche Malabata",
    "description": "Magnifique vue sur le détroit, studio compact idéal pour couple en escapade à Tanger.",
    "type": "Studio",
    "listingType": "rent",
    "pricePerNight": 400,
    "location": "Malabata, Tanger, Maroc",
    "address": "65 Avenue Malabata",
    "city": "Tanger",
    "images": [
      "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Vue sur mer",
      "Balcon",
      "Climatisation"
    ],
    "maxGuests": 2,
    "bedrooms": 1,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.3
  },
  {
    "_id": "6b1000000000000000000047",
    "demoKey": "demo_prop_047",
    "owner": "6b0100000000000000000005",
    "title": "Studio Fleuri Proche Plage Agadir",
    "description": "Dans le quartier paisible de la Cité Suisse, studio avec terrasse privative fleurie à 10 min de la plage.",
    "type": "Studio",
    "listingType": "rent",
    "pricePerNight": 310,
    "location": "Cité Suisse, Agadir, Maroc",
    "address": "69 Avenue Cité Suisse",
    "city": "Agadir",
    "images": [
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80",
      "https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Terrasse",
      "Jardin",
      "Cuisine équipée"
    ],
    "maxGuests": 2,
    "bedrooms": 1,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.4
  },
  {
    "_id": "6b1000000000000000000048",
    "demoKey": "demo_prop_048",
    "owner": "6b0100000000000000000005",
    "title": "Studio Pratique et Ensoleillé Agadir",
    "description": "Studio économique, très bien ensoleillé avec toutes les commodités pour un séjour décontracté.",
    "type": "Studio",
    "listingType": "rent",
    "pricePerNight": 240,
    "location": "Charaf, Agadir, Maroc",
    "address": "73 Avenue Charaf",
    "city": "Agadir",
    "images": [
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&q=80",
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Cuisine équipée",
      "Eau chaude"
    ],
    "maxGuests": 2,
    "bedrooms": 1,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.5
  },
  {
    "_id": "6b1000000000000000000049",
    "demoKey": "demo_prop_049",
    "owner": "6b0100000000000000000005",
    "title": "Studio Fonctionnel Fès Atlas",
    "description": "Studio indépendant bien équipé dans la ville moderne de Fès, accès rapide aux transports.",
    "type": "Studio",
    "listingType": "rent",
    "pricePerNight": 210,
    "location": "Atlas, Fès, Maroc",
    "address": "77 Avenue Atlas",
    "city": "Fès",
    "images": [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80",
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Climatisation",
      "Cuisine équipée"
    ],
    "maxGuests": 2,
    "bedrooms": 1,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.6
  },
  {
    "_id": "6b1000000000000000000050",
    "demoKey": "demo_prop_050",
    "owner": "6b0100000000000000000003",
    "title": "Studio Chalet sous les Toits Ifrane",
    "description": "Sous les toits pointus d’Ifrane, ambiance chaleureuse avec chauffage central et vue sur les cèdres.",
    "type": "Studio",
    "listingType": "rent",
    "pricePerNight": 280,
    "location": "Centre, Ifrane, Maroc",
    "address": "81 Avenue Centre",
    "city": "Ifrane",
    "images": [
      "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Chauffage",
      "Cuisine équipée",
      "Parking gratuit"
    ],
    "maxGuests": 2,
    "bedrooms": 1,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.7
  },
  {
    "_id": "6b1000000000000000000051",
    "demoKey": "demo_prop_051",
    "owner": "6b0100000000000000000001",
    "title": "Villa Majestueuse Palmeraie avec Piscine Privée",
    "description": "Domaine d’exception de 500m² au cœur de la Palmeraie, parc d’oliviers centenaires, immense piscine et personnel de maison.",
    "type": "Villa",
    "listingType": "rent",
    "pricePerNight": 3500,
    "location": "Palmeraie, Marrakech, Maroc",
    "address": "2 Domaine de Palmeraie",
    "city": "Marrakech",
    "images": [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Piscine",
      "Jardin",
      "Climatisation",
      "Parking gratuit",
      "Terrasse"
    ],
    "maxGuests": 10,
    "bedrooms": 5,
    "bathrooms": 5,
    "status": "approved",
    "averageRating": 4.7
  },
  {
    "_id": "6b1000000000000000000052",
    "demoKey": "demo_prop_052",
    "owner": "6b0100000000000000000001",
    "title": "Villa Contemporaine Face à l’Atlas",
    "description": "Architecture épurée, baies vitrées ouvertes sur la chaîne enneigée de l’Atlas, piscine à débordement chauffée et jardin paysager.",
    "type": "Villa",
    "listingType": "sale",
    "pricePerNight": 2800000,
    "location": "Route de l’Ourika, Marrakech, Maroc",
    "address": "7 Domaine de Route de l’Ourika",
    "city": "Marrakech",
    "images": [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Piscine",
      "Vue sur mer",
      "Jardin",
      "Climatisation",
      "Parking gratuit"
    ],
    "maxGuests": 8,
    "bedrooms": 4,
    "bathrooms": 4,
    "status": "approved",
    "averageRating": 4.8
  },
  {
    "_id": "6b1000000000000000000053",
    "demoKey": "demo_prop_053",
    "owner": "6b0100000000000000000001",
    "title": "Villa de Luxe Golf Amelkis",
    "description": "Sur le prestigieux parcours de golf Amelkis, villa raffinée avec patio andalou, piscine privative sans vis-à-vis et hammam traditionnel.",
    "type": "Villa",
    "listingType": "rent",
    "pricePerNight": 3200,
    "location": "Amelkis, Marrakech, Maroc",
    "address": "12 Domaine de Amelkis",
    "city": "Marrakech",
    "images": [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Piscine",
      "Climatisation",
      "Jardin",
      "Parking gratuit"
    ],
    "maxGuests": 8,
    "bedrooms": 4,
    "bathrooms": 4,
    "status": "approved",
    "averageRating": 4.9
  },
  {
    "_id": "6b1000000000000000000054",
    "demoKey": "demo_prop_054",
    "owner": "6b0100000000000000000001",
    "title": "Villa Familiale avec Grand Jardin Targa",
    "description": "Quartier résidentiel calme à Marrakech, villa familiale sécurisée avec piscine protégée pour les enfants et barbecue extérieur.",
    "type": "Villa",
    "listingType": "rent",
    "pricePerNight": 1800,
    "location": "Targa, Marrakech, Maroc",
    "address": "17 Domaine de Targa",
    "city": "Marrakech",
    "images": [
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&q=80",
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80",
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Piscine",
      "Jardin",
      "Climatisation",
      "Parking gratuit"
    ],
    "maxGuests": 8,
    "bedrooms": 4,
    "bathrooms": 3,
    "status": "approved",
    "averageRating": 5
  },
  {
    "_id": "6b1000000000000000000055",
    "demoKey": "demo_prop_055",
    "owner": "6b0100000000000000000002",
    "title": "Villa Prestigieuse Colline d’Anfa",
    "description": "Adresse prestigieuse sur la colline d’Anfa : jardin tropical, piscine privée, triple réception et vue dégagée sur l’océan.",
    "type": "Villa",
    "listingType": "sale",
    "pricePerNight": 4200000,
    "location": "Anfa Supérieur, Casablanca, Maroc",
    "address": "22 Domaine de Anfa Supérieur",
    "city": "Casablanca",
    "images": [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Piscine",
      "Vue sur mer",
      "Jardin",
      "Climatisation",
      "Parking gratuit"
    ],
    "maxGuests": 10,
    "bedrooms": 5,
    "bathrooms": 4,
    "status": "approved",
    "averageRating": 4.7
  },
  {
    "_id": "6b1000000000000000000056",
    "demoKey": "demo_prop_056",
    "owner": "6b0100000000000000000002",
    "title": "Villa Contemporaine Forêt de Bouskoura",
    "description": "Havre de paix dans la ville verte de Bouskoura, en bordure du golf et de la forêt d’eucalyptus. Calme et air pur.",
    "type": "Villa",
    "listingType": "rent",
    "pricePerNight": 2600,
    "location": "Bouskoura, Casablanca, Maroc",
    "address": "27 Domaine de Bouskoura",
    "city": "Casablanca",
    "images": [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Piscine",
      "Jardin",
      "Climatisation",
      "Parking gratuit"
    ],
    "maxGuests": 8,
    "bedrooms": 4,
    "bathrooms": 3,
    "status": "approved",
    "averageRating": 4.8
  },
  {
    "_id": "6b1000000000000000000057",
    "demoKey": "demo_prop_057",
    "owner": "6b0100000000000000000005",
    "title": "Villa Balnéaire avec Piscine Founty Agadir",
    "description": "À 5 minutes à pied de la plage d’Agadir, villa moderne avec jardin ensoleillé 300 jours par an et piscine privée.",
    "type": "Villa",
    "listingType": "rent",
    "pricePerNight": 2200,
    "location": "Founty, Agadir, Maroc",
    "address": "32 Domaine de Founty",
    "city": "Agadir",
    "images": [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Piscine",
      "Jardin",
      "Climatisation",
      "Parking gratuit",
      "Terrasse"
    ],
    "maxGuests": 8,
    "bedrooms": 4,
    "bathrooms": 3,
    "status": "approved",
    "averageRating": 4.9
  },
  {
    "_id": "6b1000000000000000000058",
    "demoKey": "demo_prop_058",
    "owner": "6b0100000000000000000005",
    "title": "Villa Panoramique sur les Hauteurs de Taghazout",
    "description": "Villa d’architecte surplombant l’océan Atlantique et les vagues de Taghazout, piscine miroir et terrasse coucher de soleil.",
    "type": "Villa",
    "listingType": "rent",
    "pricePerNight": 2900,
    "location": "Taghazout Bay, Agadir, Maroc",
    "address": "37 Domaine de Taghazout Bay",
    "city": "Agadir",
    "images": [
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&q=80",
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80",
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Piscine",
      "Vue sur mer",
      "Terrasse",
      "Climatisation"
    ],
    "maxGuests": 8,
    "bedrooms": 4,
    "bathrooms": 4,
    "status": "approved",
    "averageRating": 5
  },
  {
    "_id": "6b1000000000000000000059",
    "demoKey": "demo_prop_059",
    "owner": "6b0100000000000000000003",
    "title": "Superbe Villa avec Piscine et Vue Montagne Tasmit",
    "description": "Écrin de verdure aux pieds du mont Tasmit : verger d’agrumes, grande piscine privée, salon avec cheminée et air pur de l’Atlas.",
    "type": "Villa",
    "listingType": "rent",
    "pricePerNight": 1400,
    "location": "Route de Tasmit, Beni Mellal, Maroc",
    "address": "42 Domaine de Route de Tasmit",
    "city": "Beni Mellal",
    "images": [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Piscine",
      "Jardin",
      "Terrasse",
      "Parking gratuit",
      "Climatisation"
    ],
    "maxGuests": 8,
    "bedrooms": 4,
    "bathrooms": 3,
    "status": "approved",
    "averageRating": 4.7
  },
  {
    "_id": "6b1000000000000000000060",
    "demoKey": "demo_prop_060",
    "owner": "6b0100000000000000000003",
    "title": "Grande Villa Familiale Fermée Beni Mellal",
    "description": "Belle propriété sécurisée sur un terrain arboré de 2000m², grande piscine, espace barbecue et suites confortables.",
    "type": "Villa",
    "listingType": "rent",
    "pricePerNight": 1300,
    "location": "Route de Kasba Tadla, Beni Mellal, Maroc",
    "address": "47 Domaine de Route de Kasba Tadla",
    "city": "Beni Mellal",
    "images": [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Piscine",
      "Jardin",
      "Parking gratuit",
      "Cuisine équipée"
    ],
    "maxGuests": 9,
    "bedrooms": 4,
    "bathrooms": 3,
    "status": "approved",
    "averageRating": 4.8
  },
  {
    "_id": "6b1000000000000000000061",
    "demoKey": "demo_prop_061",
    "owner": "6b0100000000000000000002",
    "title": "Villa Diplomatique Grand Parc Souissi Rabat",
    "description": "Dans le quartier le plus exclusif de la capitale, majestueuse demeure entourée d’un parc arboré d’un hectare avec piscine.",
    "type": "Villa",
    "listingType": "rent",
    "pricePerNight": 4500,
    "location": "Souissi, Rabat, Maroc",
    "address": "52 Domaine de Souissi",
    "city": "Rabat",
    "images": [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Piscine",
      "Jardin",
      "Climatisation",
      "Parking gratuit"
    ],
    "maxGuests": 12,
    "bedrooms": 6,
    "bathrooms": 5,
    "status": "approved",
    "averageRating": 4.9
  },
  {
    "_id": "6b1000000000000000000062",
    "demoKey": "demo_prop_062",
    "owner": "6b0100000000000000000002",
    "title": "Belle Villa Moderne Hay Riad",
    "description": "Lignes contemporaines épurées, piscine chauffée, domotique et suite de maître. Proche des écoles internationales.",
    "type": "Villa",
    "listingType": "rent",
    "pricePerNight": 3100,
    "location": "Hay Riad, Rabat, Maroc",
    "address": "57 Domaine de Hay Riad",
    "city": "Rabat",
    "images": [
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&q=80",
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80",
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Piscine",
      "Jardin",
      "Climatisation",
      "Parking gratuit"
    ],
    "maxGuests": 8,
    "bedrooms": 4,
    "bathrooms": 4,
    "status": "approved",
    "averageRating": 5
  },
  {
    "_id": "6b1000000000000000000063",
    "demoKey": "demo_prop_063",
    "owner": "6b0100000000000000000004",
    "title": "Villa Océanique Face au Phare Cap Spartel",
    "description": "Emplacement mythique où l’Atlantique rencontre la Méditerranée. Vue spectaculaire, piscine à débordement et pinède privée.",
    "type": "Villa",
    "listingType": "rent",
    "pricePerNight": 3800,
    "location": "Cap Spartel, Tanger, Maroc",
    "address": "62 Domaine de Cap Spartel",
    "city": "Tanger",
    "images": [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Piscine",
      "Vue sur mer",
      "Jardin",
      "Terrasse"
    ],
    "maxGuests": 10,
    "bedrooms": 5,
    "bathrooms": 4,
    "status": "approved",
    "averageRating": 4.7
  },
  {
    "_id": "6b1000000000000000000064",
    "demoKey": "demo_prop_064",
    "owner": "6b0100000000000000000004",
    "title": "Villa de Maître La Vieille Montagne",
    "description": "Dans le quartier le plus prestigieux de Tanger, propriété historique entourée d’arbres centenaires et vue sur le détroit.",
    "type": "Villa",
    "listingType": "rent",
    "pricePerNight": 3400,
    "location": "Vieille Montagne, Tanger, Maroc",
    "address": "67 Domaine de Vieille Montagne",
    "city": "Tanger",
    "images": [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Piscine",
      "Jardin",
      "Vue sur mer",
      "Parking gratuit"
    ],
    "maxGuests": 8,
    "bedrooms": 4,
    "bathrooms": 4,
    "status": "approved",
    "averageRating": 4.8
  },
  {
    "_id": "6b1000000000000000000065",
    "demoKey": "demo_prop_065",
    "owner": "6b0100000000000000000003",
    "title": "Chalet Villa en Pierre et Cèdre Ifrane",
    "description": "Authentique chalet montagnard en pierre de taille et bois de cèdre de l’Atlas, grand jardin enneigé en hiver et cheminée magistrale.",
    "type": "Villa",
    "listingType": "rent",
    "pricePerNight": 1950,
    "location": "Parc National, Ifrane, Maroc",
    "address": "72 Domaine de Parc National",
    "city": "Ifrane",
    "images": [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Chauffage",
      "Jardin",
      "Parking gratuit",
      "Terrasse"
    ],
    "maxGuests": 8,
    "bedrooms": 4,
    "bathrooms": 3,
    "status": "approved",
    "averageRating": 4.9
  },
  {
    "_id": "6b1000000000000000000066",
    "demoKey": "demo_prop_066",
    "owner": "6b0100000000000000000003",
    "title": "Chambre Privée Calme chez l’Habitant Centre Beni Mellal",
    "description": "Chambre propre et accueillante avec lit double, salle d’eau privative et petit-déjeuner marocain traditionnel offert.",
    "type": "Chambre",
    "listingType": "rent",
    "pricePerNight": 160,
    "location": "Centre, Beni Mellal, Maroc",
    "address": "3 Rue Centre",
    "city": "Beni Mellal",
    "images": [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Petit-déjeuner inclus",
      "Eau chaude"
    ],
    "maxGuests": 2,
    "bedrooms": 1,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.5
  },
  {
    "_id": "6b1000000000000000000067",
    "demoKey": "demo_prop_067",
    "owner": "6b0100000000000000000003",
    "title": "Chambre Étudiante Confortable Proche Université",
    "description": "Chambre individuelle idéale pour stage ou mission académique, bureau de travail, calme et proximité des facultés.",
    "type": "Chambre",
    "listingType": "rent",
    "pricePerNight": 130,
    "location": "Campus USMS, Beni Mellal, Maroc",
    "address": "5 Rue Campus USMS",
    "city": "Beni Mellal",
    "images": [
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Bureau",
      "Eau chaude"
    ],
    "maxGuests": 2,
    "bedrooms": 1,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.6
  },
  {
    "_id": "6b1000000000000000000068",
    "demoKey": "demo_prop_068",
    "owner": "6b0100000000000000000003",
    "title": "Chambre d’Hôte Vue Nature Ain Asserdoun",
    "description": "Chambre de charme dans une maison conviviale au pied de la montagne, terrasse accessible avec vue sur les sources.",
    "type": "Chambre",
    "listingType": "rent",
    "pricePerNight": 180,
    "location": "Ain Asserdoun, Beni Mellal, Maroc",
    "address": "7 Rue Ain Asserdoun",
    "city": "Beni Mellal",
    "images": [
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Terrasse",
      "Petit-déjeuner inclus"
    ],
    "maxGuests": 2,
    "bedrooms": 1,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.7
  },
  {
    "_id": "6b1000000000000000000069",
    "demoKey": "demo_prop_069",
    "owner": "6b0100000000000000000001",
    "title": "Suite Romantique dans Demeure Historique",
    "description": "Belle chambre d’hôte décorée de zelliges et de plâtres sculptés, lit king size et accès au patio fleuri.",
    "type": "Chambre",
    "listingType": "rent",
    "pricePerNight": 290,
    "location": "Médina, Marrakech, Maroc",
    "address": "9 Rue Médina",
    "city": "Marrakech",
    "images": [
      "https://images.unsplash.com/photo-1540518614846-7ede433c4550?w=800&q=80",
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Climatisation",
      "Petit-déjeuner inclus"
    ],
    "maxGuests": 2,
    "bedrooms": 1,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.8
  },
  {
    "_id": "6b1000000000000000000070",
    "demoKey": "demo_prop_070",
    "owner": "6b0100000000000000000001",
    "title": "Chambre d’Hôtes Cosy Coeur de Guéliz",
    "description": "Chambre lumineuse avec salle de bain privée et balcon, à 5 minutes de la gare ferroviaire.",
    "type": "Chambre",
    "listingType": "rent",
    "pricePerNight": 220,
    "location": "Guéliz, Marrakech, Maroc",
    "address": "11 Rue Guéliz",
    "city": "Marrakech",
    "images": [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Climatisation",
      "Balcon"
    ],
    "maxGuests": 2,
    "bedrooms": 1,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.9
  },
  {
    "_id": "6b1000000000000000000071",
    "demoKey": "demo_prop_071",
    "owner": "6b0100000000000000000002",
    "title": "Chambre Spacieuse chez l’Habitant Maârif",
    "description": "Chambre privée de grand confort dans un appartement familial soigné, proche des commerces et tramway.",
    "type": "Chambre",
    "listingType": "rent",
    "pricePerNight": 220,
    "location": "Maârif, Casablanca, Maroc",
    "address": "13 Rue Maârif",
    "city": "Casablanca",
    "images": [
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Ascenseur",
      "Cuisine équipée"
    ],
    "maxGuests": 2,
    "bedrooms": 1,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.5
  },
  {
    "_id": "6b1000000000000000000072",
    "demoKey": "demo_prop_072",
    "owner": "6b0100000000000000000002",
    "title": "Chambre d’Hôte Moderne Boulevard d’Anfa",
    "description": "Idéale pour voyageur solo ou professionnel en escale, literie haut de gamme et douche privative.",
    "type": "Chambre",
    "listingType": "rent",
    "pricePerNight": 260,
    "location": "Centre, Casablanca, Maroc",
    "address": "15 Rue Centre",
    "city": "Casablanca",
    "images": [
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Climatisation",
      "Ascenseur"
    ],
    "maxGuests": 2,
    "bedrooms": 1,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.6
  },
  {
    "_id": "6b1000000000000000000073",
    "demoKey": "demo_prop_073",
    "owner": "6b0100000000000000000002",
    "title": "Chambre Privée Paisible Agdal Tramway",
    "description": "Chambre spacieuse avec grand bureau et balcon dans un quartier verdoyant, tramway au coin de la rue.",
    "type": "Chambre",
    "listingType": "rent",
    "pricePerNight": 210,
    "location": "Agdal, Rabat, Maroc",
    "address": "17 Rue Agdal",
    "city": "Rabat",
    "images": [
      "https://images.unsplash.com/photo-1540518614846-7ede433c4550?w=800&q=80",
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Balcon",
      "Chauffage"
    ],
    "maxGuests": 2,
    "bedrooms": 1,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.7
  },
  {
    "_id": "6b1000000000000000000074",
    "demoKey": "demo_prop_074",
    "owner": "6b0100000000000000000002",
    "title": "Chambre d’Hôte dans Villa des Orangers",
    "description": "Dans une charmante maison avec jardinet, chambre chaleureuse avec salle de bain dédiée.",
    "type": "Chambre",
    "listingType": "rent",
    "pricePerNight": 240,
    "location": "Les Orangers, Rabat, Maroc",
    "address": "19 Rue Les Orangers",
    "city": "Rabat",
    "images": [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Jardin",
      "Petit-déjeuner inclus"
    ],
    "maxGuests": 2,
    "bedrooms": 1,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.8
  },
  {
    "_id": "6b1000000000000000000075",
    "demoKey": "demo_prop_075",
    "owner": "6b0100000000000000000004",
    "title": "Chambre Bleue Traditionnelle Vue Cascade",
    "description": "Séjournez dans la ville bleue : chambre décorée dans le style chaouni avec vue sur les collines et la source.",
    "type": "Chambre",
    "listingType": "rent",
    "pricePerNight": 190,
    "location": "Ras El Maa, Chefchaouen, Maroc",
    "address": "21 Rue Ras El Maa",
    "city": "Chefchaouen",
    "images": [
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Terrasse",
      "Petit-déjeuner inclus"
    ],
    "maxGuests": 2,
    "bedrooms": 1,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.9
  },
  {
    "_id": "6b1000000000000000000076",
    "demoKey": "demo_prop_076",
    "owner": "6b0100000000000000000004",
    "title": "Chambre d’Hôte Authentique Chefchaouen",
    "description": "Ambiance montagnarde apaisante, murs à la chaux bleue et toit-terrasse panoramique pour le coucher de soleil.",
    "type": "Chambre",
    "listingType": "rent",
    "pricePerNight": 170,
    "location": "Médina, Chefchaouen, Maroc",
    "address": "23 Rue Médina",
    "city": "Chefchaouen",
    "images": [
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Terrasse",
      "Eau chaude"
    ],
    "maxGuests": 2,
    "bedrooms": 1,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.5
  },
  {
    "_id": "6b1000000000000000000077",
    "demoKey": "demo_prop_077",
    "owner": "6b0100000000000000000005",
    "title": "Chambre Fassie de Charme avec Zelliges",
    "description": "Plongez dans l’histoire de Fès : chambre authentique dans une maison centenaire avec cour intérieure.",
    "type": "Chambre",
    "listingType": "rent",
    "pricePerNight": 180,
    "location": "Médina El Bali, Fès, Maroc",
    "address": "25 Rue Médina El Bali",
    "city": "Fès",
    "images": [
      "https://images.unsplash.com/photo-1540518614846-7ede433c4550?w=800&q=80",
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Climatisation",
      "Petit-déjeuner inclus"
    ],
    "maxGuests": 2,
    "bedrooms": 1,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.6
  },
  {
    "_id": "6b1000000000000000000078",
    "demoKey": "demo_prop_078",
    "owner": "6b0100000000000000000005",
    "title": "Chambre Confortable Ville Moderne Fès",
    "description": "Chambre agréable et calme avec bureau et salle de bain indépendante, proche gare.",
    "type": "Chambre",
    "listingType": "rent",
    "pricePerNight": 150,
    "location": "Ville Nouvelle, Fès, Maroc",
    "address": "27 Rue Ville Nouvelle",
    "city": "Fès",
    "images": [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Climatisation",
      "Ascenseur"
    ],
    "maxGuests": 2,
    "bedrooms": 1,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.7
  },
  {
    "_id": "6b1000000000000000000079",
    "demoKey": "demo_prop_079",
    "owner": "6b0100000000000000000004",
    "title": "Chambre d’Artiste Vue Détroit de Gibraltar",
    "description": "Chambre d’inspiration bohème au sommet de la Kasbah de Tanger, vue magique sur la baie.",
    "type": "Chambre",
    "listingType": "rent",
    "pricePerNight": 250,
    "location": "Kasbah, Tanger, Maroc",
    "address": "29 Rue Kasbah",
    "city": "Tanger",
    "images": [
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Terrasse",
      "Vue sur mer"
    ],
    "maxGuests": 2,
    "bedrooms": 1,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.8
  },
  {
    "_id": "6b1000000000000000000080",
    "demoKey": "demo_prop_080",
    "owner": "6b0100000000000000000001",
    "title": "Chambre Lumineuse Cité des Alizés",
    "description": "Chambre chaleureuse au sein d’une maison d’hôtes artistique, à 200m du port de pêche.",
    "type": "Chambre",
    "listingType": "rent",
    "pricePerNight": 200,
    "location": "Médina, Essaouira, Maroc",
    "address": "31 Rue Médina",
    "city": "Essaouira",
    "images": [
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Terrasse",
      "Petit-déjeuner inclus"
    ],
    "maxGuests": 2,
    "bedrooms": 1,
    "bathrooms": 1,
    "status": "approved",
    "averageRating": 4.9
  },
  {
    "_id": "6b1000000000000000000081",
    "demoKey": "demo_prop_081",
    "owner": "6b0100000000000000000001",
    "title": "Riad Authentique avec Patio et Bassin Mouassine",
    "description": "Riad d’exception au cœur de la médina : patio orné d’orangers, bassin rafraîchissant, terrasse avec vue sur la Koutoubia.",
    "type": "Riad",
    "listingType": "rent",
    "pricePerNight": 1800,
    "location": "Médina Mouassine, Marrakech, Maroc",
    "address": "12 Derb Médina Mouassine",
    "city": "Marrakech",
    "images": [
      "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80",
      "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80",
      "https://images.unsplash.com/photo-1509233725247-49e657c54213?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Piscine",
      "Terrasse",
      "Climatisation",
      "Petit-déjeuner inclus"
    ],
    "maxGuests": 8,
    "bedrooms": 4,
    "bathrooms": 4,
    "status": "approved",
    "averageRating": 4.7
  },
  {
    "_id": "6b1000000000000000000082",
    "demoKey": "demo_prop_082",
    "owner": "6b0100000000000000000001",
    "title": "Riad de Charme et Sérénité Bab Doukkala",
    "description": "Havre de paix historique avec fontaine en marbre, chambres climatisées avec cheminée et toit-terrasse ensoleillé.",
    "type": "Riad",
    "listingType": "rent",
    "pricePerNight": 1500,
    "location": "Médina Bab Doukkala, Marrakech, Maroc",
    "address": "19 Derb Médina Bab Doukkala",
    "city": "Marrakech",
    "images": [
      "https://images.unsplash.com/photo-1509233725247-49e657c54213?w=800&q=80",
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Terrasse",
      "Climatisation",
      "Petit-déjeuner inclus"
    ],
    "maxGuests": 6,
    "bedrooms": 3,
    "bathrooms": 3,
    "status": "approved",
    "averageRating": 4.8
  },
  {
    "_id": "6b1000000000000000000083",
    "demoKey": "demo_prop_083",
    "owner": "6b0100000000000000000001",
    "title": "Grand Riad Traditionnel Riad Laarouss",
    "description": "Magnifique demeure du XIXe siècle restaurée dans les règles de l’art, stucs sculptés, zelliges de Fès et solarium.",
    "type": "Riad",
    "listingType": "rent",
    "pricePerNight": 2400,
    "location": "Médina Riad Laarouss, Marrakech, Maroc",
    "address": "26 Derb Médina Riad Laarouss",
    "city": "Marrakech",
    "images": [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
      "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=800&q=80",
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Piscine",
      "Terrasse",
      "Climatisation",
      "Petit-déjeuner inclus"
    ],
    "maxGuests": 10,
    "bedrooms": 5,
    "bathrooms": 5,
    "status": "approved",
    "averageRating": 4.9
  },
  {
    "_id": "6b1000000000000000000084",
    "demoKey": "demo_prop_084",
    "owner": "6b0100000000000000000001",
    "title": "Riad Intimiste Quartier Historique Mellah",
    "description": "À côté du Palais Bahia et du marché aux épices, riad cosy parfait pour séjour en amoureux ou petite famille.",
    "type": "Riad",
    "listingType": "rent",
    "pricePerNight": 980,
    "location": "Médina Mellah, Marrakech, Maroc",
    "address": "33 Derb Médina Mellah",
    "city": "Marrakech",
    "images": [
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
      "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Terrasse",
      "Climatisation",
      "Petit-déjeuner inclus"
    ],
    "maxGuests": 4,
    "bedrooms": 2,
    "bathrooms": 2,
    "status": "approved",
    "averageRating": 5
  },
  {
    "_id": "6b1000000000000000000085",
    "demoKey": "demo_prop_085",
    "owner": "6b0100000000000000000005",
    "title": "Riad Palatial au Coeur de Fès El Bali",
    "description": "Véritable joyau de l’architecture marocaine : plafonds en bois de cèdre peint (zouak), fontaines murmurentes et vue 360° sur la médina.",
    "type": "Riad",
    "listingType": "rent",
    "pricePerNight": 1600,
    "location": "Fès El Bali, Fès, Maroc",
    "address": "40 Derb Fès El Bali",
    "city": "Fès",
    "images": [
      "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80",
      "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80",
      "https://images.unsplash.com/photo-1509233725247-49e657c54213?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Terrasse",
      "Climatisation",
      "Petit-déjeuner inclus",
      "Chauffage"
    ],
    "maxGuests": 8,
    "bedrooms": 4,
    "bathrooms": 4,
    "status": "approved",
    "averageRating": 4.7
  },
  {
    "_id": "6b1000000000000000000086",
    "demoKey": "demo_prop_086",
    "owner": "6b0100000000000000000005",
    "title": "Riad de Charme Musée Batha",
    "description": "Calme absolu à deux pas de la porte Bab Boujloud, patio fleuri de jasmins et suites décorées avec élégance.",
    "type": "Riad",
    "listingType": "rent",
    "pricePerNight": 1200,
    "location": "Batha, Fès, Maroc",
    "address": "47 Derb Batha",
    "city": "Fès",
    "images": [
      "https://images.unsplash.com/photo-1509233725247-49e657c54213?w=800&q=80",
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Terrasse",
      "Climatisation",
      "Petit-déjeuner inclus"
    ],
    "maxGuests": 6,
    "bedrooms": 3,
    "bathrooms": 3,
    "status": "approved",
    "averageRating": 4.8
  },
  {
    "_id": "6b1000000000000000000087",
    "demoKey": "demo_prop_087",
    "owner": "6b0100000000000000000005",
    "title": "Maison Riad Andalouse Fès Ziat",
    "description": "Demeure seigneuriale avec cour pavée de marbre, salons de lecture feutrés et service attentif.",
    "type": "Riad",
    "listingType": "rent",
    "pricePerNight": 1400,
    "location": "Ziat, Fès, Maroc",
    "address": "54 Derb Ziat",
    "city": "Fès",
    "images": [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
      "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=800&q=80",
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Terrasse",
      "Climatisation",
      "Petit-déjeuner inclus"
    ],
    "maxGuests": 8,
    "bedrooms": 4,
    "bathrooms": 4,
    "status": "approved",
    "averageRating": 4.9
  },
  {
    "_id": "6b1000000000000000000088",
    "demoKey": "demo_prop_088",
    "owner": "6b0100000000000000000001",
    "title": "Riad Lumineux aux Boiseries de Thuya Essaouira",
    "description": "Riad baigné de lumière marine, boiseries parfumées au thuya, terrasse abritée des alizés et cheminée au salon.",
    "type": "Riad",
    "listingType": "rent",
    "pricePerNight": 1100,
    "location": "Médina, Essaouira, Maroc",
    "address": "61 Derb Médina",
    "city": "Essaouira",
    "images": [
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
      "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Terrasse",
      "Cheminée",
      "Cuisine équipée"
    ],
    "maxGuests": 6,
    "bedrooms": 3,
    "bathrooms": 3,
    "status": "approved",
    "averageRating": 5
  },
  {
    "_id": "6b1000000000000000000089",
    "demoKey": "demo_prop_089",
    "owner": "6b0100000000000000000001",
    "title": "Riad Historique Face aux Remparts d’Essaouira",
    "description": "Surplombant les fortifications et les vagues de l’Atlantique, vue féerique et charme d’antan garanti.",
    "type": "Riad",
    "listingType": "rent",
    "pricePerNight": 1350,
    "location": "Remparts, Essaouira, Maroc",
    "address": "68 Derb Remparts",
    "city": "Essaouira",
    "images": [
      "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80",
      "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80",
      "https://images.unsplash.com/photo-1509233725247-49e657c54213?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Vue sur mer",
      "Terrasse",
      "Cheminée"
    ],
    "maxGuests": 8,
    "bedrooms": 4,
    "bathrooms": 3,
    "status": "approved",
    "averageRating": 4.7
  },
  {
    "_id": "6b1000000000000000000090",
    "demoKey": "demo_prop_090",
    "owner": "6b0100000000000000000002",
    "title": "Riad Historique dans la Kasbah des Oudayas",
    "description": "Emplacement unique dans la forteresse des Oudayas, ruelles fleuries de bougainvilliers et terrasse sur l’embouchure du Bouregreg.",
    "type": "Riad",
    "listingType": "rent",
    "pricePerNight": 1450,
    "location": "Kasbah des Oudayas, Rabat, Maroc",
    "address": "75 Derb Kasbah des Oudayas",
    "city": "Rabat",
    "images": [
      "https://images.unsplash.com/photo-1509233725247-49e657c54213?w=800&q=80",
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Terrasse",
      "Vue sur mer",
      "Petit-déjeuner inclus"
    ],
    "maxGuests": 6,
    "bedrooms": 3,
    "bathrooms": 3,
    "status": "approved",
    "averageRating": 4.8
  },
  {
    "_id": "6b1000000000000000000091",
    "demoKey": "demo_prop_091",
    "owner": "6b0100000000000000000003",
    "title": "Maison Familiale avec Terrasse Spacieuse Beni Mellal",
    "description": "Grande maison marocaine traditionnelle sur deux niveaux, grand salon pour réceptions, cuisine familiale et terrasse dégagée.",
    "type": "Maison",
    "listingType": "rent",
    "pricePerNight": 580,
    "location": "Quartier Atlas, Beni Mellal, Maroc",
    "address": "18 Rue Quartier Atlas",
    "city": "Beni Mellal",
    "images": [
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80",
      "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=800&q=80",
      "https://images.unsplash.com/photo-1598228723793-52759bba239c?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Terrasse",
      "Cuisine équipée",
      "Parking gratuit"
    ],
    "maxGuests": 7,
    "bedrooms": 3,
    "bathrooms": 2,
    "status": "approved",
    "averageRating": 4.5
  },
  {
    "_id": "6b1000000000000000000092",
    "demoKey": "demo_prop_092",
    "owner": "6b0100000000000000000003",
    "title": "Maison de Campagne avec Verger Beni Mellal",
    "description": "Aux portes des montagnes et des lacs de Bin El Ouidane, maison paisible avec jardin arboré d’oliviers.",
    "type": "Maison",
    "listingType": "rent",
    "pricePerNight": 650,
    "location": "Route d’Ouaouizeght, Beni Mellal, Maroc",
    "address": "24 Rue Route d’Ouaouizeght",
    "city": "Beni Mellal",
    "images": [
      "https://images.unsplash.com/photo-1598228723793-52759bba239c?w=800&q=80",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Jardin",
      "Terrasse",
      "Parking gratuit"
    ],
    "maxGuests": 6,
    "bedrooms": 3,
    "bathrooms": 2,
    "status": "approved",
    "averageRating": 4.6
  },
  {
    "_id": "6b1000000000000000000093",
    "demoKey": "demo_prop_093",
    "owner": "6b0100000000000000000002",
    "title": "Maison de Ville avec Garage Privé Maârif",
    "description": "Rare à Maârif : maison de ville indépendante avec garage fermé, terrasse privative et 3 belles chambres au calme.",
    "type": "Maison",
    "listingType": "sale",
    "pricePerNight": 1850000,
    "location": "Maârif, Casablanca, Maroc",
    "address": "30 Rue Maârif",
    "city": "Casablanca",
    "images": [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80",
      "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Parking gratuit",
      "Terrasse",
      "Cuisine équipée"
    ],
    "maxGuests": 6,
    "bedrooms": 3,
    "bathrooms": 2,
    "status": "approved",
    "averageRating": 4.7
  },
  {
    "_id": "6b1000000000000000000094",
    "demoKey": "demo_prop_094",
    "owner": "6b0100000000000000000002",
    "title": "Maison Rénovée Style Art Déco Casablanca",
    "description": "Maison de caractère des années 1940 restaurée avec soin, volumes généreux et patio intérieur.",
    "type": "Maison",
    "listingType": "rent",
    "pricePerNight": 1250,
    "location": "Bourgogne, Casablanca, Maroc",
    "address": "36 Rue Bourgogne",
    "city": "Casablanca",
    "images": [
      "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?w=800&q=80",
      "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800&q=80",
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Climatisation",
      "Terrasse",
      "Cuisine équipée"
    ],
    "maxGuests": 8,
    "bedrooms": 4,
    "bathrooms": 2,
    "status": "approved",
    "averageRating": 4.8
  },
  {
    "_id": "6b1000000000000000000095",
    "demoKey": "demo_prop_095",
    "owner": "6b0100000000000000000001",
    "title": "Maison d’Artiste Loft Sidi Ghanem",
    "description": "Dans le quartier du design et des créateurs, maison atelier avec patio arboré, hauts plafonds et décoration soignée.",
    "type": "Maison",
    "listingType": "rent",
    "pricePerNight": 850,
    "location": "Sidi Ghanem, Marrakech, Maroc",
    "address": "42 Rue Sidi Ghanem",
    "city": "Marrakech",
    "images": [
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80",
      "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=800&q=80",
      "https://images.unsplash.com/photo-1598228723793-52759bba239c?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Climatisation",
      "Terrasse",
      "Parking gratuit"
    ],
    "maxGuests": 4,
    "bedrooms": 2,
    "bathrooms": 2,
    "status": "approved",
    "averageRating": 4.5
  },
  {
    "_id": "6b1000000000000000000096",
    "demoKey": "demo_prop_096",
    "owner": "6b0100000000000000000001",
    "title": "Maison Familiale Calme avec Patio Targa",
    "description": "Maison conviviale de plain-pied avec cour intérieure ombragée de bougainvilliers et barbecue.",
    "type": "Maison",
    "listingType": "rent",
    "pricePerNight": 720,
    "location": "Targa, Marrakech, Maroc",
    "address": "48 Rue Targa",
    "city": "Marrakech",
    "images": [
      "https://images.unsplash.com/photo-1598228723793-52759bba239c?w=800&q=80",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Climatisation",
      "Jardin",
      "Parking gratuit"
    ],
    "maxGuests": 6,
    "bedrooms": 3,
    "bathrooms": 2,
    "status": "approved",
    "averageRating": 4.6
  },
  {
    "_id": "6b1000000000000000000097",
    "demoKey": "demo_prop_097",
    "owner": "6b0100000000000000000004",
    "title": "Maison Bleue Traditionnelle sur Deux Étages",
    "description": "Plongez dans le conte de fée chaouni : maison entière bleue avec cuisine équipée et terrasse surplombant la place.",
    "type": "Maison",
    "listingType": "rent",
    "pricePerNight": 540,
    "location": "Uta El Hammam, Chefchaouen, Maroc",
    "address": "54 Rue Uta El Hammam",
    "city": "Chefchaouen",
    "images": [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80",
      "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Terrasse",
      "Cuisine équipée",
      "Eau chaude"
    ],
    "maxGuests": 6,
    "bedrooms": 3,
    "bathrooms": 2,
    "status": "approved",
    "averageRating": 4.7
  },
  {
    "_id": "6b1000000000000000000098",
    "demoKey": "demo_prop_098",
    "owner": "6b0100000000000000000001",
    "title": "Maison Berbère en Pierre Proche Océan Diabat",
    "description": "À Diabat près des dunes de Jimi Hendrix, maison en pierre locale taillée, toit-terrasse avec vue sur l’estuaire et océan.",
    "type": "Maison",
    "listingType": "rent",
    "pricePerNight": 620,
    "location": "Diabat, Essaouira, Maroc",
    "address": "60 Rue Diabat",
    "city": "Essaouira",
    "images": [
      "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?w=800&q=80",
      "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800&q=80",
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Terrasse",
      "Vue sur mer",
      "Cheminée",
      "Jardin"
    ],
    "maxGuests": 6,
    "bedrooms": 3,
    "bathrooms": 2,
    "status": "approved",
    "averageRating": 4.8
  },
  {
    "_id": "6b1000000000000000000099",
    "demoKey": "demo_prop_099",
    "owner": "6b0100000000000000000005",
    "title": "Maison Kasbah en Pisé face à la Palmeraie",
    "description": "Architecture de terre authentique, fraîcheur naturelle en été, terrasse panoramique face à l’oasis et aux montagnes de l’Atlas.",
    "type": "Maison",
    "listingType": "rent",
    "pricePerNight": 490,
    "location": "Taourirt, Ouarzazate, Maroc",
    "address": "66 Rue Taourirt",
    "city": "Ouarzazate",
    "images": [
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80",
      "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=800&q=80",
      "https://images.unsplash.com/photo-1598228723793-52759bba239c?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Terrasse",
      "Climatisation",
      "Parking gratuit"
    ],
    "maxGuests": 6,
    "bedrooms": 3,
    "bathrooms": 2,
    "status": "approved",
    "averageRating": 4.5
  },
  {
    "_id": "6b1000000000000000000100",
    "demoKey": "demo_prop_100",
    "owner": "6b0100000000000000000004",
    "title": "Maison Hispano-Mauresque avec Patio Tétouan",
    "description": "Maison andalouse historique classée à l’UNESCO, carrelages d’époque, cour intérieure avec fontaine et terrasse ensoleillée.",
    "type": "Maison",
    "listingType": "rent",
    "pricePerNight": 580,
    "location": "Médina, Tétouan, Maroc",
    "address": "72 Rue Médina",
    "city": "Tétouan",
    "images": [
      "https://images.unsplash.com/photo-1598228723793-52759bba239c?w=800&q=80",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80"
    ],
    "amenities": [
      "WiFi",
      "Terrasse",
      "Cuisine équipée",
      "Chauffage"
    ],
    "maxGuests": 6,
    "bedrooms": 3,
    "bathrooms": 2,
    "status": "approved",
    "averageRating": 4.6
  }
];

export default DEMO_PROPERTIES;
