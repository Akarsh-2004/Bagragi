import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  MapPin, 
  DollarSign, 
  Calendar, 
  Heart, 
  ArrowLeft, 
  Plane, 
  Hotel, 
  Utensils, 
  Camera, 
  CheckCircle,
  Loader2,
  Star,
  Clock,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PlanTrip = () => {
  const [formData, setFormData] = useState({
    destination: '',
    budget: 'medium',
    travelStyle: 'cultural',
    duration: '5-7 days',
    groupSize: '2',
    startDate: '',
    endDate: ''
  });
  
  const [tripPlan, setTripPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState(null);

  const travelStyles = [
    { value: 'adventure', label: 'Adventure', icon: '🏔️' },
    { value: 'relaxing', label: 'Relaxing', icon: '🌴' },
    { value: 'cultural', label: 'Cultural', icon: '🏛️' },
    { value: 'wildlife', label: 'Wildlife', icon: '🦁' },
    { value: 'luxury', label: 'Luxury', icon: '💎' }
  ];

  const budgetLevels = [
    { value: 'low', label: 'Budget', range: '$500-1000', icon: '💰' },
    { value: 'medium', label: 'Mid-Range', range: '$1000-2500', icon: '💳' },
    { value: 'high', label: 'Luxury', range: '$2500-5000+', icon: '👑' }
  ];

  const groupSizes = [
    { value: '1', label: 'Solo Traveler' },
    { value: '2', label: 'Couple' },
    { value: '3-5', label: 'Small Group (3-5)' },
    { value: '6+', label: 'Large Group (6+)' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Corrected fetchSuggestions function
  const fetchSuggestions = async (destination) => {
    if (!destination) {
      setSuggestions(null); // Clear suggestions if destination is empty
      return;
    }
    
    try {
      // Use the environment variable for the Python API base URL
      const baseUrl = process.env.REACT_APP_PYTHON_API || "http://localhost:5000";
      const response = await axios.get(`${baseUrl}/api/trip/suggestions/${encodeURIComponent(destination)}`);
      
      // The Python backend is designed to return an object, not an array for suggestions
      if (response.data && response.data.suggestions && typeof response.data.suggestions === 'object') {
        setSuggestions(response.data.suggestions);
      } else {
        console.warn("Unexpected response structure for suggestions:", response.data);
        setSuggestions(null); // Clear suggestions if structure is unexpected
      }

    } catch (error) {
      console.error("Error fetching suggestions:", error.message || error);
      setSuggestions(null); // Clear suggestions on error
    }
  };

  useEffect(() => {
    // Only fetch suggestions if the destination has a value
    if (formData.destination) {
      const handler = setTimeout(() => {
        fetchSuggestions(formData.destination);
      }, 500); // Debounce to prevent too many API calls
      return () => clearTimeout(handler);
    } else {
      setSuggestions(null); // Clear suggestions when destination input is empty
    }
  }, [formData.destination]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTripPlan(null);

    try {
      // Use the environment variable for the Python API base URL
      const baseUrl = process.env.REACT_APP_PYTHON_API || "http://localhost:5000";
      const response = await axios.post(`${baseUrl}/api/trip/plan`, {
        destination: formData.destination,
        budget: formData.budget,
        preferences: {
          travelStyle: formData.travelStyle,
          groupSize: formData.groupSize,
          duration: formData.duration
        }
      });

      setTripPlan(response.data.tripPlan);
    } catch (error) {
      console.error('Error creating trip plan:', error);
      setError(error.response?.data?.error || 'Failed to create trip plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-inter">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200 rounded-b-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors rounded-full p-2 hover:bg-gray-100"
            >
              <ArrowLeft size={20} />
              <span>Back to Home</span>
            </Link>
            <div className="flex items-center gap-3">
              <Plane className="text-blue-600" size={24} />
              <h1 className="text-3xl font-bold text-gray-800">
                Plan Your Trip
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Trip Planning Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Create Your Perfect Trip
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Destination */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline mr-2" size={16} />
                  Destination
                </label>
                <input
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleInputChange}
                  placeholder="Where do you want to go?"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <DollarSign className="inline mr-2" size={16} />
                  Budget Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {budgetLevels.map((budget) => (
                    <label
                      key={budget.value}
                      className={`cursor-pointer p-3 border rounded-lg transition-all ${
                        formData.budget === budget.value
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="budget"
                        value={budget.value}
                        checked={formData.budget === budget.value}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <div className="text-2xl mb-1">{budget.icon}</div>
                        <div className="font-medium text-sm">{budget.label}</div>
                        <div className="text-xs text-gray-500">{budget.range}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Travel Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Heart className="inline mr-2" size={16} />
                  Travel Style
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {travelStyles.map((style) => (
                    <label
                      key={style.value}
                      className={`cursor-pointer p-3 border rounded-lg transition-all ${
                        formData.travelStyle === style.value
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="travelStyle"
                        value={style.value}
                        checked={formData.travelStyle === style.value}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <div className="text-2xl mb-1">{style.icon}</div>
                        <div className="text-xs font-medium">{style.label}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Group Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="inline mr-2" size={16} />
                  Group Size
                </label>
                <select
                  name="groupSize"
                  value={formData.groupSize}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {groupSizes.map((size) => (
                    <option key={size.value} value={size.value}>
                      {size.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline mr-2" size={16} />
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline mr-2" size={16} />
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Creating Your Trip Plan...
                  </div>
                ) : (
                  'Generate Trip Plan'
                )}
              </button>
            </form>
          </div>

          {/* Suggestions and Trip Plan */}
          <div className="space-y-6">
            {/* Destination Suggestions */}
            {suggestions && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  <Star className="inline mr-2 text-yellow-500" size={20} />
                  About {formData.destination}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Top Cities</h4>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.cities && suggestions.cities.map((city, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {city}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Highlights</h4>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.highlights && suggestions.highlights.map((highlight, index) => (
                        <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-1">Best Time</h4>
                      <p className="text-sm text-gray-600">{suggestions.bestTime}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-1">Currency</h4>
                      <p className="text-sm text-gray-600">{suggestions.currency}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Trip Plan Results */}
            {tripPlan && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  <CheckCircle className="inline mr-2 text-green-600" size={20} />
                  Your Trip Plan
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="text-blue-600" size={20} />
                    <div>
                      <p className="font-semibold">{tripPlan.destination}</p>
                      <p className="text-sm text-gray-600">{tripPlan.duration}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <DollarSign className="text-green-600" size={20} />
                    <div>
                      <p className="font-semibold">Budget: {tripPlan.budget}</p>
                      <p className="text-sm text-gray-600">Estimated: {tripPlan.estimatedCost}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Hotel className="text-purple-600" size={20} />
                    <div>
                      <p className="font-semibold">Accommodation</p>
                      <p className="text-sm text-gray-600">{tripPlan.accommodation}</p>
                    </div>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Activities</p>
                    <div className="flex flex-wrap gap-2">
                      {tripPlan.activities && tripPlan.activities.map((activity, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {activity}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Recommendations</p>
                    <ul className="space-y-1">
                      {tripPlan.recommendations && tripPlan.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle className="text-green-500 mt-0.5" size={14} />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanTrip;
