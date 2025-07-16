const ReviewSchema = new mongoose.Schema({
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'Host' },  // optional if reviewing host
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' }, // optional if reviewing property
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: String,
  sentiment: { type: String, enum: ['positive', 'neutral', 'negative'] },
  createdAt: { type: Date, default: Date.now }
});
