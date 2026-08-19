import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import Property from '../models/Property.js';

// @desc    Create review
// @route   POST /api/reviews
// @access  Private (Client only)
export const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    // Check booking exists and is completed
    const booking = await Booking.findById(bookingId)
      .populate('property');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is the client
    if (booking.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to review this booking' });
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed bookings' });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this booking' });
    }

    // Create review
    const review = await Review.create({
      client: req.user._id,
      property: booking.property._id,
      booking: bookingId,
      rating,
      comment,
    });

    // Update property average rating
    const reviews = await Review.find({ property: booking.property._id });
    const averageRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;

    await Property.findByIdAndUpdate(booking.property._id, {
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