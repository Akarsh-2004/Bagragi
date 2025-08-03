const mongoose = require('mongoose');

const HotelSchema = new mongoose.Schema({
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: String,

  location: {
    country: { type: String, required: true },
    city: { type: String, required: true },
    address: String,
    coordinates: {
      lat: Number,
      long: Number
    }
  },

  images: [String],
  pricePerNight: { type: Number, required: true },
  amenities: [String],
  isAvailable: { type: Boolean, default: true },

  roomTypes: [{
    name: String,
    description: String,
    priceModifier: Number,
    maxGuests: Number
  }],
  maxGuests: Number,

  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },

  // ✅ Added enhancements:
  checkInTime: { type: String, default: "14:00" },
  checkOutTime: { type: String, default: "11:00" },
  cancellationPolicy: { type: String, default: "Free cancellation within 24 hours before check-in" },

  stars: { type: Number, min: 1, max: 5 },
  languagesSpoken: [String],
  parkingAvailable: Boolean,
  petFriendly: Boolean,
  smokingAllowed: Boolean,
  tags: [String],

  availabilityCalendar: [{
    date: Date,
    isAvailable: Boolean,
    price: Number
  }],

  isVerified: { type: Boolean, default: false },
  safetyScore: { type: Number, default: 0 },
  viewsCount: { type: Number, default: 0 },
  bookingsCount: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Hotel', HotelSchema);
