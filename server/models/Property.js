import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 2000,
    },
    type: {
      type: String,
      enum: ['Appartement', 'Villa', 'Maison', 'Studio', 'Chambre', 'Riad', 'Autre'],
      required: true,
    },
    pricePerNight: {
      type: Number,
      required: [true, 'Price per night is required'],
      min: 0,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    images: {
      type: [String],
      default: [],
    },
    amenities: {
      type: [String],
      default: [],
    },
    maxGuests: {
      type: Number,
      required: [true, 'Max guests is required'],
      min: 1,
    },
    bedrooms: {
      type: Number,
      required: [true, 'Bedrooms is required'],
      min: 0,
    },
    bathrooms: {
      type: Number,
      required: [true, 'Bathrooms is required'],
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'unavailable'],
      default: 'pending',
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

const Property = mongoose.model('Property', propertySchema);
export default Property;