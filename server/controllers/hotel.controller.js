const Hotel = require('../models/hotel.model');

// 🏨 Create Hotel (host only)
exports.createHotel = async (req, res) => {
  try {
    if (req.user.role !== 'host') {
      return res.status(403).json({ message: 'Only hosts can create hotels' });
    }

    const hotel = new Hotel({
      ...req.body,
      hostId: req.user.userId
    });

    await hotel.save();
    res.status(201).json({ message: 'Hotel created successfully', hotel });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create hotel', error: err.message });
  }
};

// 📃 Get All Hotels (public)
exports.getAllHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find().populate('hostId', 'name email');
    res.json(hotels);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch hotels', error: err.message });
  }
};

// 🔎 Get Hotel by ID
exports.getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id)
      .populate('hostId', 'name email')
      .populate('reviews'); // Optional if reviews are populated

    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

    res.json(hotel);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving hotel', error: err.message });
  }
};

// 🔁 Get Hotels by Host (host's dashboard)
exports.getHotelsByHost = async (req, res) => {
  try {
    if (req.user.role !== 'host') {
      return res.status(403).json({ message: 'Only hosts can view their hotels' });
    }

    const hotels = await Hotel.find({ hostId: req.user.userId });
    res.json(hotels);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch your hotels', error: err.message });
  }
};

// ✏️ Update Hotel (host only)
exports.updateHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
    if (hotel.hostId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    Object.assign(hotel, req.body);
    await hotel.save();

    res.json({ message: 'Hotel updated successfully', hotel });
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};

// ❌ Delete Hotel (host only)
exports.deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
    if (hotel.hostId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await hotel.deleteOne();
    res.json({ message: 'Hotel deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
};
