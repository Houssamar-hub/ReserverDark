import Property from '../models/Property.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import cloudinary from '../config/cloudinary.js';

// @desc    Create property
// @route   POST /api/properties
// @access  Private (Owner only)
export const createProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      pricePerNight,
      location,
      address,
      city,
      latitude,
      longitude,
      amenities,
      maxGuests,
      bedrooms,
      bathrooms,
    } = req.body;

    // Check if user is owner
    if (req.user.role !== 'owner' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only owners can create properties' });
    }

    const property = await Property.create({
      owner: req.user._id,
      title,
      description,
      type,
      pricePerNight,
      location,
      address,
      city,
      latitude,
      longitude,
      amenities: amenities || [],
      maxGuests,
      bedrooms,
      bathrooms,
      images: Array.isArray(req.body.images) && req.body.images.length > 0 ? req.body.images : [],
      status: 'pending',
    });

    res.status(201).json({
      message: 'Property created successfully, waiting for admin approval',
      property,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all properties (public - only approved)
// @route   GET /api/properties
// @access  Public
export const getProperties = async (req, res) => {
  try {
    const {
      city,
      minPrice,
      maxPrice,
      type,
      bedrooms,
      maxGuests,
      amenities,
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = { status: 'approved' };

    // City filter
    if (city) {
      filter.city = { $regex: city, $options: 'i' };
    }

    // Price filter
    if (minPrice || maxPrice) {
      filter.pricePerNight = {};
      if (minPrice) filter.pricePerNight.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerNight.$lte = Number(maxPrice);
    }

    // Type filter
    if (type) {
      filter.type = type;
    }

    // Bedrooms filter
    if (bedrooms) {
      filter.bedrooms = { $gte: Number(bedrooms) };
    }

    // Max guests filter
    if (maxGuests) {
      filter.maxGuests = { $gte: Number(maxGuests) };
    }

    // Amenities filter
    if (amenities) {
      const amenitiesArray = amenities.split(',');
      filter.amenities = { $all: amenitiesArray };
    }

    // Sorting
    let sortOption = {};
    switch (sort) {
      case 'price_asc':
        sortOption = { pricePerNight: 1 };
        break;
      case 'price_desc':
        sortOption = { pricePerNight: -1 };
        break;
      case 'rating':
        sortOption = { averageRating: -1 };
        break;
      case 'popularity':
        sortOption = { createdAt: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const [properties, total] = await Promise.all([
      Property.find(filter)
        .populate('owner', 'name email avatar')
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit)),
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

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('owner', 'name email avatar phone');

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // If property is pending, only owner and admin can see it
    if (property.status === 'pending') {
      const ownerId = property.owner?._id ? property.owner._id.toString() : property.owner ? property.owner.toString() : null;
      if (!req.user || (ownerId && req.user._id.toString() !== ownerId && req.user.role !== 'admin')) {
        return res.status(403).json({ message: 'This property is not available yet' });
      }
    }

    // Fetch reviews for this property
    const reviews = await Review.find({ property: property._id })
      .populate('client', 'name avatar')
      .sort({ createdAt: -1 });

    const propertyObj = property.toObject();
    propertyObj.reviews = reviews || [];

    res.status(200).json({ property: propertyObj });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private (Owner only)
export const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if user is owner or admin
    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this property' });
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: 'Property updated successfully',
      property: updatedProperty,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (Owner/Admin)
export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if user is owner or admin
    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this property' });
    }

    // Delete images from Cloudinary
    for (const imageUrl of property.images) {
      const publicId = imageUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`properties/${publicId}`);
    }

    await property.deleteOne();

    res.status(200).json({ message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Upload property images
// @route   POST /api/properties/:id/images
// @access  Private (Owner only)
export const uploadImages = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if user is owner or admin
    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    const uploadPromises = req.files.map(async (file) => {
      let imageUrl = `${req.protocol}://${req.get('host')}/uploads/properties/${file.filename}`;
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
        try {
          const res = await cloudinary.uploader.upload(file.path, {
            folder: 'properties',
            width: 1200,
            height: 800,
            crop: 'limit',
          });
          imageUrl = res.secure_url;
        } catch (cloudErr) {
          console.error('Cloudinary fallback to local:', cloudErr.message);
        }
      }
      return imageUrl;
    });

    const results = await Promise.all(uploadPromises);

    property.images = [...property.images, ...results];
    await property.save();

    res.status(200).json({
      message: 'Images uploaded successfully',
      images: property.images,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Standalone upload property photos (returns uploaded URLs)
// @route   POST /api/properties/upload
// @access  Private (Owner/Admin)
export const uploadPropertyPhotos = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    const uploadPromises = req.files.map(async (file) => {
      let imageUrl = `${req.protocol}://${req.get('host')}/uploads/properties/${file.filename}`;
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
        try {
          const cloudRes = await cloudinary.uploader.upload(file.path, {
            folder: 'properties',
            width: 1200,
            height: 800,
            crop: 'limit',
          });
          imageUrl = cloudRes.secure_url;
        } catch (cloudErr) {
          console.error('Cloudinary fallback to local file:', cloudErr.message);
        }
      }
      return imageUrl;
    });

    const imageUrls = await Promise.all(uploadPromises);

    res.status(200).json({
      message: 'Images uploaded successfully',
      images: imageUrls,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete property image
// @route   DELETE /api/properties/:id/images/:imageIndex
// @access  Private (Owner only)
export const deleteImage = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const imageIndex = parseInt(req.params.imageIndex);
    if (imageIndex < 0 || imageIndex >= property.images.length) {
      return res.status(400).json({ message: 'Invalid image index' });
    }

    const imageUrl = property.images[imageIndex];
    const publicId = imageUrl.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(`properties/${publicId}`);

    property.images.splice(imageIndex, 1);
    await property.save();

    res.status(200).json({
      message: 'Image deleted successfully',
      images: property.images,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get owner properties
// @route   GET /api/properties/owner/my
// @access  Private (Owner only)
export const getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({ properties });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};