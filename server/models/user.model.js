const mongoose= require('mongoose');
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: { type: String, required: true },
  city: String,
  email: { type: String, unique: true, required: true, index: true },
  role: { type: String, enum: ['guest', 'host'], required: true },
  password: { type: String, required: true },
  phone: String,
  profileImage: String,
  bio: String,
  preferences: {
    travelStyle: { type: String, enum: ['adventure', 'relaxing', 'cultural', 'wildlife', 'luxury'] },
    budget: { type: String, enum: ['low', 'medium', 'high'] },
    preferredCountries: [String]
  },
  createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('User', UserSchema); // ✅ THIS is important