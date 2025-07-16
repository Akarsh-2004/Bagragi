const HostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

  properties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],

  averageRating: {
    type: Number,
    default: 0
  },

  totalReviews: {
    type: Number,
    default: 0
  },

  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }]
});
