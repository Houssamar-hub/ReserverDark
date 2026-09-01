import Booking from '../models/Booking.js';
import Property from '../models/Property.js';
import Notification from '../models/Notification.js';

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private (Client only)
export const createBooking = async (req, res) => {
  try {
    const { propertyId, checkIn, checkOut, guests } = req.body;

    // Check property exists and is approved
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.status !== 'approved') {
      return res.status(400).json({ message: 'Property is not available for booking' });
    }

    // Check guests capacity
    if (guests > property.maxGuests) {
      return res.status(400).json({ message: `Maximum ${property.maxGuests} guests allowed` });
    }

    // Check dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
      return res.status(400).json({ message: 'Check-out must be after check-in' });
    }

    // Check if dates are available
    const conflictingBooking = await Booking.findOne({
      property: propertyId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          checkIn: { $lt: checkOutDate },
          checkOut: { $gt: checkInDate },
        },
      ],
    });

    if (conflictingBooking) {
      return res.status(400).json({ message: 'These dates are already booked' });
    }

    // Calculate nights and total price
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * property.pricePerNight;

    // Create booking
    const booking = await Booking.create({
      client: req.user._id,
      property: propertyId,
      owner: property.owner,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      nights,
      pricePerNight: property.pricePerNight,
      totalPrice,
      status: 'pending',
    });

    // Create notification for owner
    await Notification.create({
      user: property.owner,
      title: 'New Booking Request',
      message: `${req.user.name} wants to book ${property.title}`,
      type: 'booking_created',
    });

    res.status(201).json({
      message: 'Booking request created successfully',
      booking,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get client bookings
// @route   GET /api/bookings/my
// @access  Private (Client only)
export const getMyBookings = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 0;
    const bookings = await Booking.find({ client: req.user._id })
      .populate('property', 'title images location city')
      .populate('owner', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({ bookings });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get owner bookings
// @route   GET /api/bookings/owner
// @access  Private (Owner only)
export const getOwnerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ owner: req.user._id })
      .populate('property', 'title images location city')
      .populate('client', 'name avatar email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({ bookings });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update booking status (Owner)
// @route   PATCH /api/bookings/:id/status
// @access  Private (Owner only)
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id)
      .populate('property', 'title')
      .populate('client', 'name');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is owner or admin
    if (booking.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    booking.status = status;
    await booking.save();

    // Create notification for client
    let notificationTitle = '';
    let notificationMessage = '';
    let notificationType = '';

    switch (status) {
      case 'confirmed':
        notificationTitle = 'Booking Confirmed';
        notificationMessage = `Your booking for ${booking.property.title} has been confirmed`;
        notificationType = 'booking_confirmed';
        break;
      case 'rejected':
        notificationTitle = 'Booking Rejected';
        notificationMessage = `Your booking for ${booking.property.title} has been rejected`;
        notificationType = 'booking_rejected';
        break;
      case 'cancelled':
        notificationTitle = 'Booking Cancelled';
        notificationMessage = `Your booking for ${booking.property.title} has been cancelled`;
        notificationType = 'booking_cancelled';
        break;
      default:
        notificationTitle = 'Booking Updated';
        notificationMessage = `Your booking status has been updated to ${status}`;
        notificationType = 'booking_created';
    }

    await Notification.create({
      user: booking.client,
      title: notificationTitle,
      message: notificationMessage,
      type: notificationType,
    });

    res.status(200).json({
      message: `Booking ${status} successfully`,
      booking,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Cancel booking (Client)
// @route   DELETE /api/bookings/:id/cancel
// @access  Private (Client only)
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is client or admin
    if (booking.client.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if booking can be cancelled
    if (booking.status === 'confirmed' || booking.status === 'pending') {
      booking.status = 'cancelled';
      await booking.save();

      // Notify owner
      await Notification.create({
        user: booking.owner,
        title: 'Booking Cancelled',
        message: `Booking for ${booking.property.title} has been cancelled by client`,
        type: 'booking_cancelled',
      });

      res.status(200).json({ message: 'Booking cancelled successfully' });
    } else {
      res.status(400).json({ message: `Cannot cancel booking with status: ${booking.status}` });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get booking statistics for owner
// @route   GET /api/bookings/stats
// @access  Private (Owner only)
export const getBookingStats = async (req, res) => {
  try {
    const [stats, propertyCount] = await Promise.all([
      Booking.aggregate([
        { $match: { owner: req.user._id } },
        {
          $group: {
            _id: null,
            totalBookings: { $sum: 1 },
            pendingBookings: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
            },
            confirmedBookings: {
              $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] },
            },
            completedBookings: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
            },
            totalRevenue: {
              $sum: {
                $cond: [
                  { $in: ['$status', ['confirmed', 'completed']] },
                  '$totalPrice',
                  0
                ]
              }
            },
            pendingRevenue: {
              $sum: {
                $cond: [
                  { $eq: ['$status', 'pending'] },
                  '$totalPrice',
                  0
                ]
              }
            },
          },
        },
      ]),
      Property.countDocuments({ owner: req.user._id })
    ]);

    const result = stats[0] || {
      totalBookings: 0,
      pendingBookings: 0,
      confirmedBookings: 0,
      completedBookings: 0,
      totalRevenue: 0,
      pendingRevenue: 0
    };

    result.revenue = result.totalRevenue || 0;
    result.properties = propertyCount || 0;

    res.status(200).json({ stats: result });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};