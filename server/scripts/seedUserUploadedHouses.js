import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import Property from '../models/Property.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '..', 'uploads', 'properties');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const sourceImages = [
  {
    src: 'C:/Users/L9IIRCH/.gemini/antigravity/brain/e457087d-4372-4ab4-a310-6610c044a0bf/.user_uploaded/media_1789033201074.png',
    filename: 'villa_zen_piscine_marrakech.png',
    title: 'Villa Zen Contemporaine avec Piscine & Jardin',
    description: 'Superbe villa moderne de plain-pied au design épuré, comprenant de grandes baies vitrées donnant sur une piscine privée et un jardin paysager soigné. Idéale pour des vacances reposantes au calme.',
    type: 'Villa',
    city: 'Marrakech',
    location: 'Palmeraie, Marrakech',
    address: 'Route de Fès, Km 8',
    pricePerNight: 2800,
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 3,
    amenities: ['Piscine privée', 'Wifi Fibre', 'Climatisation', 'Jardin privé', 'Parking gratuit', 'Cuisine équipée', 'Transats'],
    status: 'approved',
    averageRating: 4.95,
  },
  {
    src: 'C:/Users/L9IIRCH/.gemini/antigravity/brain/e457087d-4372-4ab4-a310-6610c044a0bf/.user_uploaded/media_1789033204731.png',
    filename: 'cottage_nature_jardin_ifrane.png',
    title: 'Cottage de Charme au Cœur de la Nature',
    description: 'Charmante maisonnette pittoresque entourée d’arbres majestueux et de fleurs éclatantes. Une escapade féérique pour les amoureux de la nature, avec terrasse en bois et atmosphère chaleureuse.',
    type: 'Maison',
    city: 'Ifrane',
    location: 'Quartier Forêt, Ifrane',
    address: 'Avenue des Cèdres',
    pricePerNight: 1200,
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 1,
    amenities: ['Cheminée', 'Jardin fleuri', 'Wifi', 'Terrasse', 'Chauffage central', 'Barbecue', 'Vue sur forêt'],
    status: 'approved',
    averageRating: 4.88,
  },
  {
    src: 'C:/Users/L9IIRCH/.gemini/antigravity/brain/e457087d-4372-4ab4-a310-6610c044a0bf/.user_uploaded/media_1789033206942.png',
    filename: 'maison_moderne_bouskoura.png',
    title: 'Maison Moderne Design & Lumineuse',
    description: 'Magnifique maison d’architecte contemporaine avec véranda couverte, allée pavée et finitions haut de gamme. Espace de vie spacieux, cuisine ouverte et garage privé.',
    type: 'Maison',
    city: 'Casablanca',
    location: 'Bouskoura Golf City, Casablanca',
    address: 'Boulevard de la Forêt, Bouskoura',
    pricePerNight: 2100,
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 2,
    amenities: ['Garage privé', 'Climatisation réversible', 'Wifi haut débit', 'Terrasse', 'Sécurité 24/7', 'Smart TV'],
    status: 'approved',
    averageRating: 4.92,
  },
  {
    src: 'C:/Users/L9IIRCH/.gemini/antigravity/brain/e457087d-4372-4ab4-a310-6610c044a0bf/.user_uploaded/media_1789033209917.jpg',
    filename: 'villa_familiale_californie_casa.jpg',
    title: 'Belle Demeure Familiale avec Grand Jardin',
    description: 'Grande maison familiale à étage située dans un quartier résidentiel très paisible. Dotée d’une belle pelouse verte, d’un garage double et de pièces généreusement éclairées.',
    type: 'Villa',
    city: 'Casablanca',
    location: 'Quartier Californie, Casablanca',
    address: 'Rue des Mimosas',
    pricePerNight: 2600,
    maxGuests: 8,
    bedrooms: 4,
    bathrooms: 3,
    amenities: ['Grand jardin', 'Garage', 'Wifi', 'Climatisation', 'Cuisine américaine', 'Espace télétravail', 'Lave-linge'],
    status: 'approved',
    averageRating: 4.85,
  },
  {
    src: 'C:/Users/L9IIRCH/.gemini/antigravity/brain/e457087d-4372-4ab4-a310-6610c044a0bf/.user_uploaded/media_1789033238013.png',
    filename: 'manoir_prestige_souissi_rabat.png',
    title: 'Manoir de Prestige & Jardins Français',
    description: 'Résidence de prestige au style néoclassique d’une rare élégance. Façade blanche immaculée, magnifiques allées paysagées avec buissons taillés et prestations d’exception pour séjour VIP.',
    type: 'Villa',
    city: 'Rabat',
    location: 'Souissi, Rabat',
    address: 'Avenue Mohammed VI, Souissi',
    pricePerNight: 4500,
    maxGuests: 10,
    bedrooms: 5,
    bathrooms: 5,
    amenities: ['Jardin à la française', 'Service de gardiennage', 'Climatisation centrale', 'Wifi ultra-rapide', 'Suites parentales', 'Piscine chauffée', 'Parking 4 véhicules'],
    status: 'approved',
    averageRating: 5.0,
  }
];

async function seedProperties() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/reserverdark';
    console.log('Connecting to MongoDB:', mongoUri);
    await mongoose.connect(mongoUri);

    // Copy images to uploads/properties
    for (const item of sourceImages) {
      const dest = path.join(uploadsDir, item.filename);
      if (fs.existsSync(item.src)) {
        fs.copyFileSync(item.src, dest);
        console.log(` Copied image to: ${dest}`);
      } else {
        console.warn(` Source file not found: ${item.src}`);
      }
    }

    // Find existing owner users
    let owners = await User.find({ role: 'owner' });
    if (!owners || owners.length === 0) {
      owners = await User.find();
    }

    if (!owners || owners.length === 0) {
      console.error(' No existing user accounts found in database.');
      process.exit(1);
    }

    console.log(`Found ${owners.length} existing user/owner account(s):`, owners.map(o => `${o.name} (${o.email})`));

    const createdProps = [];
    for (let i = 0; i < sourceImages.length; i++) {
      const data = sourceImages[i];
      const owner = owners[i % owners.length]; // Distribute among existing owners

      const relativeImagePath = `/uploads/properties/${data.filename}`;

      // Check if property with same title already exists
      let existing = await Property.findOne({ title: data.title });
      if (existing) {
        existing.images = [relativeImagePath];
        existing.pricePerNight = data.pricePerNight;
        existing.description = data.description;
        existing.city = data.city;
        existing.location = data.location;
        existing.address = data.address;
        existing.maxGuests = data.maxGuests;
        existing.bedrooms = data.bedrooms;
        existing.bathrooms = data.bathrooms;
        existing.amenities = data.amenities;
        existing.status = 'approved';
        existing.owner = owner._id;
        await existing.save();
        console.log(` Updated property: "${existing.title}" owned by ${owner.name}`);
        createdProps.push(existing);
      } else {
        const prop = await Property.create({
          owner: owner._id,
          title: data.title,
          description: data.description,
          type: data.type,
          pricePerNight: data.pricePerNight,
          city: data.city,
          location: data.location,
          address: data.address,
          images: [relativeImagePath],
          amenities: data.amenities,
          maxGuests: data.maxGuests,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          status: 'approved',
          averageRating: data.averageRating,
        });
        console.log(` Created new property: "${prop.title}" (${prop.city} - ${prop.pricePerNight} MAD/nuit) owned by ${owner.name}`);
        createdProps.push(prop);
      }
    }

    console.log(`\n Successfully registered all ${createdProps.length} houses with existing owner accounts!`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(' Error during property seed:', err);
    process.exit(1);
  }
}

seedProperties();
