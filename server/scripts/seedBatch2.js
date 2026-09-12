import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import Property from '../models/Property.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverUploadsDir = path.join(__dirname, '..', 'uploads', 'properties');
const clientUploadsDir = path.join(__dirname, '..', '..', 'client', 'public', 'uploads', 'properties');
const clientImagesDir = path.join(__dirname, '..', '..', 'client', 'public', 'images');

[serverUploadsDir, clientUploadsDir, clientImagesDir].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const items = [
  {
    src: 'C:/Users/L9IIRCH/.gemini/antigravity/brain/e457087d-4372-4ab4-a310-6610c044a0bf/.user_uploaded/media_1789033761747.jpg',
    filename: 'manoir_briques_rabat.jpg',
    title: 'Manoir Historique & Demeure de Caractère',
    description: 'Somptueuse demeure de maître en briques rouges d\'inspiration classique avec volets noirs, perron en pierre et grand parc arboré. Idéale pour les réceptions de prestige et séjours d\'exception.',
    type: 'Villa',
    city: 'Rabat',
    location: 'Souissi, Rabat',
    address: 'Avenue de la Victoire',
    pricePerNight: 3500,
    maxGuests: 10,
    bedrooms: 5,
    bathrooms: 4,
    amenities: ['Parc privé', 'Cheminée d\'époque', 'Wifi Fibre', 'Climatisation', 'Parking 6 véhicules', 'Service conciergerie'],
    status: 'approved',
    averageRating: 4.96
  },
  {
    src: 'C:/Users/L9IIRCH/.gemini/antigravity/brain/e457087d-4372-4ab4-a310-6610c044a0bf/.user_uploaded/media_1789033776623.png',
    filename: 'villa_cubiste_lumineuse_marrakech.png',
    title: 'Villa Cubiste d\'Exception avec Piscine Miroir',
    description: 'Chef-d\'œuvre architectural contemporain composé de volumes cubiques épurés, d\'immenses façades vitrées et d\'un splendide bassin miroir. Éclairage design nocturne féerique.',
    type: 'Villa',
    city: 'Marrakech',
    location: 'Route de l\'Ourika, Marrakech',
    address: 'Km 12, Domaine des Oliviers',
    pricePerNight: 4200,
    maxGuests: 8,
    bedrooms: 4,
    bathrooms: 4,
    amenities: ['Piscine miroir', 'Terrasse rooftop', 'Smart Home', 'Wifi très haut débit', 'Climatisation gainée', 'Jardin zen'],
    status: 'approved',
    averageRating: 5.0
  },
  {
    src: 'C:/Users/L9IIRCH/.gemini/antigravity/brain/e457087d-4372-4ab4-a310-6610c044a0bf/.user_uploaded/media_1789033782026.jpg',
    filename: 'villa_bois_verre_tanger.jpg',
    title: 'Villa Contemporaine Bois & Verre avec Terrasse',
    description: 'Sublime villa moderne à étage alliant bardage bois naturel et baies vitrées toute hauteur. Allée de bois, jardin intime et vue panoramique apaisante.',
    type: 'Maison',
    city: 'Tanger',
    location: 'Malabata, Tanger',
    address: 'Corniche de Malabata',
    pricePerNight: 2400,
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 2,
    amenities: ['Terrasse en bois', 'Vue dégagée', 'Wifi', 'Climatisation', 'Cuisine américaine', 'Garage fermé'],
    status: 'approved',
    averageRating: 4.9
  },
  {
    src: 'C:/Users/L9IIRCH/.gemini/antigravity/brain/e457087d-4372-4ab4-a310-6610c044a0bf/.user_uploaded/media_1789033792193.jpg',
    filename: 'penthouse_design_escalier_casa.jpg',
    title: 'Penthouse de Luxe avec Escalier Hélicoïdal',
    description: 'Penthouse spectaculaire au design haut de gamme avec double hauteur sous plafond, escalier sculptural hélicoïdal, mobilier contemporain de prestige et vue imprenable.',
    type: 'Appartement',
    city: 'Casablanca',
    location: 'Anfa Supérieur, Casablanca',
    address: 'Boulevard d\'Anfa',
    pricePerNight: 3100,
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 3,
    amenities: ['Ascenseur privé', 'Terrasse panoramique', 'Design d\'architecte', 'Wifi Fibre', 'Home Cinéma', 'Parking sécurisé'],
    status: 'approved',
    averageRating: 4.98
  },
  {
    src: 'C:/Users/L9IIRCH/.gemini/antigravity/brain/e457087d-4372-4ab4-a310-6610c044a0bf/.user_uploaded/media_1789033797265.png',
    filename: 'villa_balneaire_piscine_agadir.png',
    title: 'Villa Balnéaire avec Grande Piscine & Espace BBQ',
    description: 'Superbe villa balnéaire moderne avec immense terrasse extérieure couverte en bois noble, grande piscine turquoise, cuisine d\'été avec barbecue intégré et palmiers.',
    type: 'Villa',
    city: 'Agadir',
    location: 'Baie des Palmiers, Agadir',
    address: 'Secteur Balnéaire Founty',
    pricePerNight: 3800,
    maxGuests: 8,
    bedrooms: 4,
    bathrooms: 4,
    amenities: ['Piscine extérieure', 'Barbecue & Bar extérieur', 'Accès plage 5 min', 'Wifi', 'Climatisation totale', 'Transats & Pergola'],
    status: 'approved',
    averageRating: 4.94
  }
];

async function run() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/reserverdark';
    await mongoose.connect(mongoUri);

    // Copy files
    for (const item of items) {
      if (fs.existsSync(item.src)) {
        fs.copyFileSync(item.src, path.join(serverUploadsDir, item.filename));
        fs.copyFileSync(item.src, path.join(clientUploadsDir, item.filename));
        fs.copyFileSync(item.src, path.join(clientImagesDir, item.filename));
        console.log(`✅ Copied ${item.filename}`);
      } else {
        console.warn(`⚠️ Source file not found: ${item.src}`);
      }
    }

    let owners = await User.find({ role: 'owner' });
    if (!owners || owners.length === 0) owners = await User.find();

    console.log(`Found ${owners.length} owners/users in database`);

    for (let i = 0; i < items.length; i++) {
      const data = items[i];
      const owner = owners[(i + 3) % owners.length];

      const relativeImagePath = `/uploads/properties/${data.filename}`;

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
        console.log(`🔄 Updated: ${existing.title}`);
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
        console.log(`✨ Created: "${prop.title}" (${prop.city} - ${prop.pricePerNight} MAD/nuit) owned by ${owner.name}`);
      }
    }

    console.log('🎉 Successfully added all 5 properties!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

run();
