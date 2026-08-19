import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Un client ne peut ajouter une propriété qu'une seule fois aux favoris
favoriteSchema.index({ client: 1, property: 1 }, { unique: true });

const Favorite = mongoose.model('Favorite', favoriteSchema);
export default Favorite;