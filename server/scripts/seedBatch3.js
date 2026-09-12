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
    src: 'C:/Users/L9IIRCH/.gemini/antigravity/brain/e457087d-4372-4ab4-a310-6610c044a0bf/.user_uploaded/media_1789033918311.png',
    filename: 'villa_brique_terrasse_rabat.png',
    title: 'Villa d\'Architecte Brique & Terrasse Panoramique',
    description: 'Somptueuse villa d\'architecte combinant maçonnerie fine en brique et étage blanc minimaliste. Escalier illuminé menant à un jardin luxuriant et terrasse spacieuse pour vos dîners sous les étoiles.',
    type: 'Villa',
    city: 'Rabat',
    location: 'Souissi, Rabat',
    address: 'Rue des Jardins, Souissi',
    pricePerNight: 3200,
    maxGuests: 8,
    bedrooms: 4,
    bathrooms: 3,
    amenities: ['Terrasse panoramique', 'Jardin illuminé', 'Wifi Fibre', 'Climatisation gainée', 'Cuisine de chef', 'Parking privé'],
    status: 'approved',
    averageRating: 4.95
  },
  {
    src: 'C:/Users/L9IIRCH/.gemini/antigravity/brain/e457087d-4372-4ab4-a310-6610c044a0bf/.user_uploaded/media_1789033926712.jpg',
    filename: 'villa_plain_pied_marrakech.jpg',
    title: 'Villa Plain-Pied Méditerranéenne au Calme',
    description: 'Agréable maison de plain-pied aux teintes chaleureuses avec jardin privatif d\'oliviers et cour en gravier. Sécurité, sérénité et ambiance reposante garantie.',
    type: 'Maison',
    city: 'Marrakech',
    location: 'Targa, Marrakech',
    address: 'Avenue Yacoub El Mansour',
    pricePerNight: 1400,
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 2,
    amenities: ['Jardin arboré', 'Climatisation', 'Wifi', 'Place de parking', 'Cuisine équipée', 'Salon marocain'],
    status: 'approved',
    averageRating: 4.87
  },
  {
    src: 'C:/Users/L9IIRCH/.gemini/antigravity/brain/e457087d-4372-4ab4-a310-6610c044a0bf/.user_uploaded/media_1789033934949.png',
    filename: 'maison_lumineuse_pergola_bouskoura.png',
    title: 'Maison Familiale Lumineuse avec Pergola',
    description: 'Superbe maison à étage baignée de lumière avec pergola en bois, allée pavée et vaste pelouse verte. Un cadre idyllique pour des séjours en famille au vert.',
    type: 'Maison',
    city: 'Casablanca',
    location: 'Bouskoura, Casablanca',
    address: 'Les Allées de Bouskoura',
    pricePerNight: 2200,
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 2,
    amenities: ['Pergola & Barbecue', 'Grand jardin', 'Wifi haut débit', 'Climatisation', 'Cuisine moderne', 'Environnement calme'],
    status: 'approved',
    averageRating: 4.91
  },
  {
    src: 'C:/Users/L9IIRCH/.gemini/antigravity/brain/e457087d-4372-4ab4-a310-6610c044a0bf/.user_uploaded/media_1789033947150.jpg',
    filename: 'palais_contemporain_piscine_xxl.jpg',
    title: 'Palais Contemporain Vue Montagne & Piscine XXL',
    description: 'Propriété de très grand luxe d\'une envergure spectaculaire avec immense piscine à débordement, deck en bois noble, salons ouverts sur l\'eau et vue imprenable sur les montagnes.',
    type: 'Villa',
    city: 'Marrakech',
    location: 'Route d\'Amizmiz, Marrakech',
    address: 'Domaine Royal Atlas',
    pricePerNight: 6500,
    maxGuests: 12,
    bedrooms: 6,
    bathrooms: 6,
    amenities: ['Piscine XXL chauffée', 'Deck en bois', 'Vue montagnes', 'Service de majordome', 'Wifi ultra-rapide', 'Climatisation centrale', 'Piano & Salon VIP'],
    status: 'approved',
    averageRating: 5.0
  },
  {
    src: 'C:/Users/L9IIRCH/.gemini/antigravity/brain/e457087d-4372-4ab4-a310-6610c044a0bf/.user_uploaded/media_1789033956592.png',
    filename: 'eco_chalet_terrasse_ifrane.png',
    title: 'Eco-Chalet Moderne & Terrasse Nature',
    description: 'Chalet contemporain et design au cœur d’une nature préservée, doté d’une immense terrasse en bois pour se ressourcer à l’air pur. Équipements modernes et confort optimal.',
    type: 'Maison',
    city: 'Ifrane',
    location: 'Mischliffen, Ifrane',
    address: 'Route des Cascades',
    pricePerNight: 1100,
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 1,
    amenities: ['Terrasse panoramique en bois', 'Vue nature & forêt', 'Poêle à bois', 'Wifi', 'Chauffage', 'Transats'],
    status: 'approved',
    averageRating: 4.89
  }
];

async function run() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/reserverdark';
    await mongoose.connect(mongoUri);

    // 1. Copy files
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
      const owner = owners[(i + 1) % owners.length];

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
          createdAt: new Date(),
          updatedAt: new Date()
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
