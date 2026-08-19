import Favorite from '../models/Favorite.js';
import Property from '../models/Property.js';

// @desc    Add property to favorites
// @route   POST /api/favorites
// @access  Private (Client only)
export const addFavorite = async (req, res) => {
  try {
    const { propertyId } = req.body;

    // Check property exists and is approved
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.status !== 'approved') {
      return res.status(400).json({ message: 'Property is not available' });
    }

    // Check if already favorited
    const existing = await Favorite.findOne({
      client: req.user._id,
      property: propertyId,
    });

    if (existing) {
      return res.status(400).json({ message: 'Property already in favorites' });
    }

    const favorite = await Favorite.create({
      client: req.user._id,
      property: propertyId,
    });

    res.status(201).json({
      message: 'Property added to favorites',
      favorite,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Remove property from favorites
// @route   DELETE /api/favorites/:propertyId
// @access  Private (Client only)
export const removeFavorite = async (req, res) => {
  try {
    const favorite = await Favorite.findOneAndDelete({
      client: req.user._id,
      property: req.params.propertyId,
    });

    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    res.status(200).json({ message: 'Property removed from favorites' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user favorites
// @route   GET /api/favorites
// @access  Private (Client only)
export const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ client: req.user._id })
      .populate('property')
      .sort({ createdAt: -1 });

    res.status(200).json({ favorites });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Check if property is favorited
// @route   GET /api/favorites/check/:propertyId
// @access  Private (Client only)
export const checkFavorite = async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      client: req.user._id,
      property: req.params.propertyId,
    });

    res.status(200).json({ isFavorite: !!favorite });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};