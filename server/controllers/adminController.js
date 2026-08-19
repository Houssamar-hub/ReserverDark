import User from '../models/User.js';
import Property from '../models/Property.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import Notification from '../models/Notification.js';

// @desc    Get admin statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
export const getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalOwners,
      totalProperties,
      pendingProperties,
      totalBookings,
      confirmedBookings,
      totalRevenue,
    ] = await Promise.all([
      User.countDocuments({ role: 'client' }),
      User.countDocuments({ role: 'owner' }),
      Property.countDocuments(),
      Property.countDocuments({ status: 'pending' }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.aggregate([
        { $match: { status: { $in: ['confirmed', 'completed'] } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
    ]);

    res.status(200).json({
      stats: {
        totalUsers,
        totalOwners,
        totalProperties,
        pendingProperties,
        totalBookings,
        confirmedBookings,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all users (Admin)
// @route   GET /api/admin/users
// @access  Private (Admin only)
export const getUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Toggle block user
// @route   PATCH /api/admin/users/:id/block
// @access  Private (Admin only)
export const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot block admin' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    await Notification.create({
      user: user._id,
      title: user.isBlocked ? 'Account Blocked' : 'Account Unblocked',
      message: user.isBlocked
        ? 'Your account has been blocked by admin'
        : 'Your account has been unblocked',
      type: 'booking_created',
    });

    res.status(200).json({
      message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all properties (Admin)
// @route   GET /api/admin/properties
// @access  Private (Admin only)
export const getProperties = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [properties, total] = await Promise.all([
      Property.find(filter)
        .populate('owner', 'name email')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      Property.countDocuments(filter),
    ]);

    res.status(200).json({
      properties,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Approve property
// @route   PATCH /api/admin/properties/:id/approve
// @access  Private (Admin only)
export const approveProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    property.status = 'approved';
    await property.save();

    await Notification.create({
      user: property.owner,
      title: 'Property Approved',
      message: `Your property "${property.title}" has been approved by admin`,
      type: 'property_approved',
    });

    res.status(200).json({
      message: 'Property approved successfully',
      property,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Reject property
// @route   PATCH /api/admin/properties/:id/reject
// @access  Private (Admin only)
export const rejectProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    property.status = 'rejected';
    await property.save();

    await Notification.create({
      user: property.owner,
      title: 'Property Rejected',
      message: `Your property "${property.title}" has been rejected by admin`,
      type: 'property_rejected',
    });

    res.status(200).json({
      message: 'Property rejected successfully',
      property,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/admin/bookings
// @access  Private (Admin only)
export const getBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('client', 'name email')
        .populate('property', 'title images')
        .populate('owner', 'name email')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      Booking.countDocuments(filter),
    ]);

    res.status(200).json({
      bookings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all reviews (Admin)
// @route   GET /api/admin/reviews
// @access  Private (Admin only)
export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('client', 'name email')
      .populate('property', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({ reviews });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete review (Admin)
// @route   DELETE /api/admin/reviews/:id
// @access  Private (Admin only)
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

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