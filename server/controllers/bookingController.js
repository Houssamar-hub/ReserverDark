import Booking from '../models/Booking.js';
import Property from '../models/Property.js';
import Notification from '../models/Notification.js';
import { emitToUser, emitToRole, broadcastEvent } from '../config/socket.js';

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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkInZero = new Date(checkInDate);
    checkInZero.setHours(0, 0, 0, 0);

    if (checkInZero < today) {
      return res.status(400).json({ message: "La date d'arrivée ne peut pas être dans le passé" });
    }

    if (checkInDate >= checkOutDate) {
      return res.status(400).json({ message: "La date de départ doit être postérieure à la date d'arrivée" });
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

    // Populate full booking object for real-time dispatch
    const populatedBooking = await Booking.findById(booking._id)
      .populate('property', 'title images location city pricePerNight maxGuests')
      .populate('client', 'name avatar email phone')
      .populate('owner', 'name avatar email phone');

    // Create notification for owner
    const notification = await Notification.create({
      user: property.owner,
      title: 'Nouvelle demande de réservation',
      message: `${req.user.name} souhaite réserver ${property.title}`,
      type: 'booking_created',
      link: '/owner/bookings',
      data: { bookingId: booking._id, propertyId: property._id },
    });

    const notifObj = { ...notification.toObject(), read: false };

    // Emit Real-Time Socket Events
    emitToUser(property.owner.toString(), 'booking:new', populatedBooking);
    emitToUser(property.owner.toString(), 'notification:new', notifObj);
    emitToRole('admin', 'booking:new', populatedBooking);

    res.status(201).json({
      message: 'Booking request created successfully',
      booking: populatedBooking,
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
      .populate('property', 'title images location city pricePerNight')
      .populate('owner', 'name avatar email phone')
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
      .populate('property', 'title images location city pricePerNight')
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
      .populate('property', 'title images location city pricePerNight')
      .populate('client', 'name avatar email phone')
      .populate('owner', 'name avatar email phone');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is owner or admin
    if (booking.owner._id ? booking.owner._id.toString() !== req.user._id.toString() : booking.owner.toString() !== req.user._id.toString()) {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    booking.status = status;
    await booking.save();

    // Create notification for client
    let notificationTitle = '';
    let notificationMessage = '';
    let notificationType = '';

    switch (status) {
      case 'confirmed':
        notificationTitle = 'Réservation confirmée';
        notificationMessage = `Votre réservation pour ${booking.property?.title || 'le logement'} a été confirmée !`;
        notificationType = 'booking_confirmed';
        break;
      case 'rejected':
        notificationTitle = 'Réservation refusée';
        notificationMessage = `Votre réservation pour ${booking.property?.title || 'le logement'} a été refusée.`;
        notificationType = 'booking_rejected';
        break;
      case 'cancelled':
        notificationTitle = 'Réservation annulée';
        notificationMessage = `La réservation pour ${booking.property?.title || 'le logement'} a été annulée.`;
        notificationType = 'booking_cancelled';
        break;
      default:
        notificationTitle = 'Mise à jour de réservation';
        notificationMessage = `Le statut de votre réservation a été mis à jour : ${status}`;
        notificationType = 'booking_created';
    }

    const clientId = booking.client?._id ? booking.client._id.toString() : booking.client.toString();
    const ownerId = booking.owner?._id ? booking.owner._id.toString() : booking.owner.toString();

    const notification = await Notification.create({
      user: clientId,
      title: notificationTitle,
      message: notificationMessage,
      type: notificationType,
      link: '/client/bookings',
      data: { bookingId: booking._id, propertyId: booking.property?._id },
    });

    const notifObj = { ...notification.toObject(), read: false };

    // Emit real-time events to client, owner, and admin
    emitToUser(clientId, 'booking:updated', booking);
    emitToUser(clientId, 'notification:new', notifObj);
    emitToUser(ownerId, 'booking:updated', booking);
    emitToRole('admin', 'booking:updated', booking);

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
    const booking = await Booking.findById(req.params.id)
      .populate('property', 'title images location city pricePerNight')
      .populate('client', 'name avatar email phone')
      .populate('owner', 'name avatar email phone');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const clientId = booking.client?._id ? booking.client._id.toString() : booking.client.toString();
    const ownerId = booking.owner?._id ? booking.owner._id.toString() : booking.owner.toString();

    // Check if user is client or admin
    if (clientId !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if booking can be cancelled
    if (booking.status === 'confirmed' || booking.status === 'pending') {
      booking.status = 'cancelled';
      await booking.save();

      // Notify owner
      const notification = await Notification.create({
        user: ownerId,
        title: 'Réservation annulée',
        message: `La réservation pour ${booking.property?.title || 'le logement'} a été annulée par le voyageur`,
        type: 'booking_cancelled',
        link: '/owner/bookings',
        data: { bookingId: booking._id },
      });

      const notifObj = { ...notification.toObject(), read: false };

      // Emit real-time events
      emitToUser(ownerId, 'booking:updated', booking);
      emitToUser(ownerId, 'notification:new', notifObj);
      emitToUser(clientId, 'booking:updated', booking);
      emitToRole('admin', 'booking:updated', booking);

      res.status(200).json({ message: 'Booking cancelled successfully', booking });
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