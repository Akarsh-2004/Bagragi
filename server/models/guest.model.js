const GuestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

  preferences: {
    travelStyle: { type: String, enum: ['adventure', 'relaxing', 'cultural', 'wildlife', 'luxury'] },
    budget: { type: String, enum: ['low', 'medium', 'high'] },
    preferredCountries: [String]
  },

  savedProperties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }], // wishlist
  tripHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Trip' }]
});
