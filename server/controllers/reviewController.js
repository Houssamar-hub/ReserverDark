import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import Property from '../models/Property.js';

// @desc    Create review
// @route   POST /api/reviews
// @access  Private (Client only)
// @desc    Create review
// @route   POST /api/reviews
// @access  Private (Client only)
export const createReview = async (req, res) => {
  try {
    const { propertyId, bookingId, rating, comment } = req.body;

    let targetPropertyId = propertyId;
    if (bookingId && !targetPropertyId) {
      const booking = await Booking.findById(bookingId);
      if (booking) targetPropertyId = booking.property;
    }

    if (!targetPropertyId) {
      return res.status(400).json({ message: 'Property ID is required' });
    }

    // Verify property exists
    const property = await Property.findById(targetPropertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Create review
    const review = await Review.create({
      client: req.user._id,
      property: targetPropertyId,
      booking: bookingId || null,
      rating: Number(rating) || 5,
      comment: comment || '',
    });

    // Update property average rating
    const reviews = await Review.find({ property: targetPropertyId });
    const averageRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;

    await Property.findByIdAndUpdate(targetPropertyId, {
      averageRating: Math.round(averageRating * 10) / 10,
    });

    res.status(201).json({
      message: 'Review created successfully',
      review,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get reviews for a property
// @route   GET /api/properties/:propertyId/reviews
// @access  Public
export const getPropertyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ property: req.params.propertyId })
      .populate('client', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({ reviews });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete review (Admin only)
// @route   DELETE /api/reviews/:id
// @access  Private (Admin only)
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Get property and update average rating
    const propertyId = review.property;
    await review.deleteOne();

    // Recalculate average rating
    const reviews = await Review.find({ property: propertyId });
    if (reviews.length > 0) {
      const averageRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;
      await Property.findByIdAndUpdate(propertyId, {
        averageRating: Math.round(averageRating * 10) / 10,
      });
    } else {
      await Property.findByIdAndUpdate(propertyId, { averageRating: 0 });
    }

    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};