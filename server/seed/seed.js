import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import User from '../models/User.js';
import Property from '../models/Property.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import Favorite from '../models/Favorite.js';

dotenv.config();

// Cities marocaines
const CITIES = [
  'Marrakech',
  'Casablanca',
  'Rabat',
  'Agadir',
  'Tanger',
  'Fès',
  'Beni Mellal',
  'Essaouira',
  'Chefchaouen',
  'Ouarzazate',
];

const PROPERTY_TYPES = ['Appartement', 'Villa', 'Maison', 'Studio', 'Chambre', 'Riad', 'Autre'];

const AMENITIES = [
  'WiFi',
  'Climatisation',
  'Chauffage',
  'Cuisine équipée',
  'Parking gratuit',
  'Piscine',
  'Jardin',
  'Terrasse',
  'Vue sur mer',
  'Balcon',
  'Machine à laver',
  'Lave-vaisselle',
  'Télévision',
  'Eau chaude',
  'Petit-déjeuner inclus',
  'Animaux acceptés',
  'Fumeurs acceptés',
  'Accessible fauteuil roulant',
];

// Propriétés avec descriptions réalistes
const PROPERTY_DESCRIPTIONS = [
  'Superbe appartement moderne avec vue panoramique sur la ville. Idéal pour un séjour confortable.',
  'Magnifique villa traditionnelle marocaine avec un grand jardin et une piscine privée.',
  'Riad authentique au cœur de la médina, rénové avec goût tout en conservant le charme d\'antan.',
  'Appartement lumineux et spacieux, parfait pour les familles ou les groupes d\'amis.',
  'Maison de charme avec terrasse et vue imprenable sur les montagnes de l\'Atlas.',
  'Studio cosy et bien équipé, situé à proximité de toutes les commodités.',
  'Chambre d\'hôte dans une villa de luxe avec petit-déjeuner inclus.',
  'Loft moderne avec design industriel, situé dans un quartier branché.',
  'Duplex élégant avec toit-terrasse et vue sur l\'océan.',
  'Penthouse exclusif avec piscine privée et vue à 360°.',
];

// Noms marocains
const MOROCCAN_NAMES = [
  'Mohammed Ali',
  'Fatima Zahra',
  'Youssef Benali',
  'Khadija Mansouri',
  'Omar El Fassi',
  'Nadia Tazi',
  'Hassan Berrada',
  'Soukaina El Idrissi',
  'Karim Benjelloun',
  'Ghita Amrani',
  'Rachid El Alaoui',
  'Meryem Bennani',
  'Said El Kadiri',
  'Lamiae Chaoui',
  'Nabil Bouazza',
];

// Emails marocains
const getEmail = (name) => {
  const parts = name.toLowerCase().split(' ');
  return `${parts[0]}.${parts[parts.length - 1]}@gmail.com`;
};

// Générer des dates aléatoires
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max) => Number((Math.random() * (max - min) + min).toFixed(2));

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Fonction pour générer des équipements aléatoires
const randomAmenities = () => {
  const count = randomInt(3, 8);
  const shuffled = [...AMENITIES].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Fonction pour générer des descriptions détaillées
const generateDescription = (type, city) => {
  const base = pickRandom(PROPERTY_DESCRIPTIONS);
  const details = [
    `Ce ${type} situé à ${city} offre un confort exceptionnel.`,
    `Parfait pour un séjour en famille ou entre amis, ce ${type} saura vous séduire.`,
    `Découvrez le charme de ${city} depuis ce ${type} magnifiquement aménagé.`,
    `Ce ${type} allie modernité et tradition pour un séjour inoubliable.`,
  ];
  return `${base} ${pickRandom(details)}`;
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting seeding...');

    // Delete existing data
    await User.deleteMany({});
    await Property.deleteMany({});
    await Booking.deleteMany({});
    await Review.deleteMany({});
    await Favorite.deleteMany({});

    console.log('🗑️  Existing data cleared');

    // Create Admin
    const adminPassword = await bcrypt.hash('Admin@123', 12);
    const admin = await User.create({
      name: 'Admin ReserverDark',
      email: 'admin@reserverdark.com',
      password: adminPassword,
      phone: '+212 600-000001',
      role: 'admin',
      isBlocked: false,
    });
    console.log('👤 Admin created');

    // Create Owners
    const owners = [];
    for (let i = 0; i < 5; i++) {
      const name = MOROCCAN_NAMES[i];
      const password = await bcrypt.hash('Owner@123', 12);
      const owner = await User.create({
        name,
        email: `owner${i + 1}@reserverdark.com`,
        password,
        phone: `+212 6${String(randomInt(0, 9))}${String(randomInt(100000, 999999))}`,
        role: 'owner',
        isBlocked: false,
      });
      owners.push(owner);
      console.log(`👤 Owner ${i + 1} created: ${name}`);
    }

    // Create Clients
    const clients = [];
    for (let i = 0; i < 15; i++) {
      const name = MOROCCAN_NAMES[i + 5] || `Client ${i + 1}`;
      const password = await bcrypt.hash('Client@123', 12);
      const client = await User.create({
        name,
        email: `client${i + 1}@reserverdark.com`,
        password,
        phone: `+212 6${String(randomInt(0, 9))}${String(randomInt(100000, 999999))}`,
        role: 'client',
        isBlocked: false,
      });
      clients.push(client);
      console.log(`👤 Client ${i + 1} created`);
    }

    // Create Properties
    const properties = [];
    const statuses = ['pending', 'approved', 'approved', 'approved', 'approved', 'approved', 'rejected'];

    for (let i = 0; i < 20; i++) {
      const owner = pickRandom(owners);
      const city = pickRandom(CITIES);
      const type = pickRandom(PROPERTY_TYPES);
      const status = pickRandom(statuses);

      const property = await Property.create({
        owner: owner._id,
        title: `${pickRandom(['Magnifique', 'Superbe', 'Charmant', 'Élégant', 'Moderne', 'Spacieux'])} ${type} à ${city}`,
        description: generateDescription(type, city),
        type,
        pricePerNight: randomInt(200, 2000),
        location: `${city}, Maroc`,
        address: `${randomInt(1, 200)} ${pickRandom(['Rue', 'Avenue', 'Boulevard', 'Impasse'])} ${pickRandom(['Mohammed V', 'Hassan II', 'Al Fassi', 'Moulay Youssef', 'Oued', 'Tariq'])}`,
        city,
        latitude: randomFloat(30.0, 34.0),
        longitude: randomFloat(-8.0, -4.0),
        images: [
          `https://picsum.photos/seed/${i + 100}/800/600`,
          `https://picsum.photos/seed/${i + 200}/800/600`,
          `https://picsum.photos/seed/${i + 300}/800/600`,
          `https://picsum.photos/seed/${i + 400}/800/600`,
        ],
        amenities: randomAmenities(),
        maxGuests: randomInt(2, 10),
        bedrooms: randomInt(1, 5),
        bathrooms: randomInt(1, 4),
        status,
        averageRating: 0,
      });
      properties.push(property);
      console.log(`🏠 Property ${i + 1} created: ${property.title} (${status})`);
    }

    // Get approved properties
    const approvedProperties = properties.filter(p => p.status === 'approved');

    // Create Bookings
    const bookingStatuses = ['pending', 'confirmed', 'confirmed', 'confirmed', 'completed', 'completed', 'cancelled'];
    const bookings = [];

    for (let i = 0; i < 30; i++) {
      const property = pickRandom(approvedProperties);
      const client = pickRandom(clients);
      const status = pickRandom(bookingStatuses);

      // Dates aléatoires
      const now = new Date();
      const futureDate = new Date(now);
      futureDate.setDate(now.getDate() + randomInt(1, 180));

      const checkIn = new Date(futureDate);
      const nights = randomInt(1, 14);
      const checkOut = new Date(checkIn);
      checkOut.setDate(checkIn.getDate() + nights);

      const totalPrice = nights * property.pricePerNight;

      const booking = await Booking.create({
        client: client._id,
        property: property._id,
        owner: property.owner,
        checkIn,
        checkOut,
        guests: randomInt(1, property.maxGuests),
        nights,
        pricePerNight: property.pricePerNight,
        totalPrice,
        status,
        paymentStatus: status === 'cancelled' ? 'refunded' : 'paid',
      });
      bookings.push(booking);
      console.log(`📅 Booking ${i + 1} created: ${client.name} → ${property.title}`);
    }

    // Create Reviews for completed bookings
    const completedBookings = bookings.filter(b => b.status === 'completed');
    let reviewCount = 0;

    for (const booking of completedBookings) {
      const property = await Property.findById(booking.property);
      if (!property) continue;

      const rating = randomInt(3, 5);
      const review = await Review.create({
        client: booking.client,
        property: booking.property,
        booking: booking._id,
        rating,
        comment: [
          'Très bon séjour, je recommande !',
          'Magnifique endroit, parfait pour des vacances.',
          'Propriétaire très accueillant et serviable.',
          'Superbe location, tout était parfait.',
          'Très belle expérience, je reviendrai !',
          'Conforme aux photos, vraiment bien.',
          'Excellent rapport qualité-prix.',
          'Endroit calme et reposant.',
          'Parfait pour une escapade en famille.',
          'Je recommande vivement ce logement.',
        ][randomInt(0, 9)],
      });
      reviewCount++;
      console.log(`⭐ Review ${reviewCount} created for ${property.title}`);
    }

    // Recalculate average ratings for properties
    for (const property of approvedProperties) {
      const reviews = await Review.find({ property: property._id });
      if (reviews.length > 0) {
        const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
        property.averageRating = Math.round(avg * 10) / 10;
        await property.save();
      }
    }

    // Create Favorites
    for (let i = 0; i < 25; i++) {
      const client = pickRandom(clients);
      const property = pickRandom(approvedProperties);

      // Vérifier si le favori existe déjà
      const existing = await Favorite.findOne({
        client: client._id,
        property: property._id,
      });

      if (!existing) {
        await Favorite.create({
          client: client._id,
          property: property._id,
        });
        console.log(`❤️ Favorite created: ${client.name} → ${property.title}`);
      }
    }

    console.log('\n✅ Seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - ${await User.countDocuments()} users (${await User.countDocuments({ role: 'admin' })} admin, ${await User.countDocuments({ role: 'owner' })} owners, ${await User.countDocuments({ role: 'client' })} clients)`);
    console.log(`   - ${await Property.countDocuments()} properties (${await Property.countDocuments({ status: 'approved' })} approved, ${await Property.countDocuments({ status: 'pending' })} pending, ${await Property.countDocuments({ status: 'rejected' })} rejected)`);
    console.log(`   - ${await Booking.countDocuments()} bookings`);
    console.log(`   - ${await Review.countDocuments()} reviews`);
    console.log(`   - ${await Favorite.countDocuments()} favorites`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();