import React, { useEffect, useState } from "react";
import {
  Search,
  Star,
  MapPin,
  DollarSign,
  Filter,
  X,
  Plus,
  Edit,
  Trash2,
  Wifi,
  Car,
  Coffee,
  Dumbbell,
  Users,
  Waves,
  AlertCircle,
} from "lucide-react";

const CreateHotel = ({ onSuccess }) => (
  <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10">
    <h3 className="text-2xl font-bold text-white mb-4">Create New Hotel</h3>
    <p className="text-white/80 mb-6">Add your property to our platform</p>
    <button
      onClick={onSuccess}
      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
    >
      Create Hotel
    </button>
  </div>
);

const HotelPage = ({ user = { role: "guest" } }) => {
  const [hotels, setHotels] = useState([]);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(user?.role === "host");
  const [averagePrice, setAveragePrice] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");

  const [minStars, setMinStars] = useState("");
  const [maxDistance, setMaxDistance] = useState("");
  const [maxPredictedPrice, setMaxPredictedPrice] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("India");
  const [selectedCity, setSelectedCity] = useState("");

  const fetchHotels = async () => {
    setLoading(true);
    setError("");
    setDebugInfo("");
    
    const requestBody = {
      country: selectedCountry,
      city: selectedCity,
      stars: minStars ? parseFloat(minStars) : null,
    };
    
    setDebugInfo(`Making request to: http://localhost:8000/api/hotel_info with body: ${JSON.stringify(requestBody)}`);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_NODE_API}/api/hotel_info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      setDebugInfo(prev => prev + `\nResponse status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        setDebugInfo(prev => prev + `\nError response: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      setDebugInfo(prev => prev + `\nResponse received. Hotels count: ${data.hotels?.length || 0}`);

      if (data.error) {
        throw new Error(data.error);
      }

      setHotels(data.hotels || []);
      setAveragePrice(data.average_price);
      setCount(data.count || 0);
      
      setDebugInfo(prev => prev + `\nHotels loaded successfully: ${data.hotels?.length || 0} hotels`);
    } catch (err) {
      const errorMessage = err.message || "Failed to load hotels.";
      setError(errorMessage);
      setDebugInfo(prev => prev + `\nError caught: ${errorMessage}`);
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const handleFilterApply = () => {
    fetchHotels();
    setShowFilters(false);
  };

  const clearFilters = () => {
    setMinStars("");
    setMaxDistance("");
    setMaxPredictedPrice("");
    setSelectedCountry("India");
    setSelectedCity("");
    fetchHotels();
  };

  const handleHotelCreated = () => {
    setShowForm(false);
    fetchHotels();
  };

  const handleSkip = () => setShowForm(false);
  const handleEdit = (hotel) => console.log("Edit hotel", hotel);
  const handleDelete = (hotelId) => console.log("Delete hotel ID:", hotelId);

  const getAmenityIcon = (amenity) => {
    const iconMap = {
      WiFi: Wifi,
      Pool: Waves,
      Gym: Dumbbell,
      Restaurant: Coffee,
      Parking: Car,
      Bar: Coffee,
      "Beach Access": Waves,
      "Water Sports": Waves,
      Hiking: Users,
      Fireplace: Coffee,
      Spa: Users,
    };
    return iconMap[amenity] || Coffee;
  };

  // Helper function to get amenities as array
  const getAmenitiesArray = (amenities) => {
    if (Array.isArray(amenities)) {
      return amenities;
    }
    if (typeof amenities === 'string') {
      return amenities.split(',').map(a => a.trim());
    }
    return ['WiFi', 'Restaurant', 'Parking']; // Default amenities
  };

  // Helper function to get star rating
  const getStarRating = (stars) => {
    if (typeof stars === 'number' && stars > 0) {
      return stars;
    }
    return 3; // Default rating
  };

  // Helper function to get price
  const getPrice = (hotel) => {
    if (hotel["Predicted Price"] && hotel["Predicted Price"] !== null) {
      return Math.round(hotel["Predicted Price"]);
    }
    if (hotel["Avg Price per Night (USD)"]) {
      return Math.round(hotel["Avg Price per Night (USD)"] * 83); // Convert USD to INR approximately
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-transparent relative">
      {/* Hero with Filters */}
      <div className="relative max-w-5xl mx-auto px-6 py-12 mt-8 bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 shadow-xl z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            Discover Amazing Hotels
          </h1>
          <p className="text-lg md:text-xl text-white/90 mt-4">
            Find your perfect stay from luxury resorts to cozy retreats
          </p>
        </div>

        

        {/* Embedded Filter Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Filter size={20} />
              Filters
            </button>
            {(minStars || maxDistance || maxPredictedPrice || selectedCity) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-xl hover:bg-white/20 transition-all duration-300"
              >
                <X size={16} />
                Clear
              </button>
            )}
          </div>
          <div className="flex items-center gap-6 text-sm">
            {averagePrice && (
              <div className="flex items-center gap-2 bg-green-500/10 text-green-200 px-4 py-2 rounded-xl backdrop-blur-sm border border-green-500/20">
                <DollarSign size={16} />
                Avg: ₹{averagePrice}
              </div>
            )}
            {count > 0 && (
              <div className="bg-blue-500/10 text-blue-200 px-4 py-2 rounded-xl backdrop-blur-sm border border-blue-500/20">
                {count} hotels found
              </div>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-white">Country</label>
                <select
                  className="w-full bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-0 transition-all duration-300"
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                >
                  <option value="India" className="text-gray-900">India</option>
                  <option value="USA" className="text-gray-900">USA</option>
                  <option value="UK" className="text-gray-900">UK</option>
                  <option value="France" className="text-gray-900">France</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-white">City</label>
                <input
                  type="text"
                  className="w-full bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:border-blue-500 focus:ring-0 transition-all duration-300"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  placeholder="e.g. Mumbai, Goa, Delhi"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-white">Minimum Star Rating</label>
                <select
                  className="w-full bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-0 transition-all duration-300"
                  value={minStars}
                  onChange={(e) => setMinStars(e.target.value)}
                >
                  <option value="" className="text-gray-900">Any rating</option>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <option key={s} value={s} className="text-gray-900">
                      {s}+ stars
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-white">Max Price (₹)</label>
                <input
                  type="number"
                  className="w-full bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:border-blue-500 focus:ring-0 transition-all duration-300"
                  value={maxPredictedPrice}
                  onChange={(e) => setMaxPredictedPrice(e.target.value)}
                  placeholder="e.g. 5000"
                  min={0}
                />
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={handleFilterApply}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Rest of the page content */}
      <div className="max-w-7xl mx-auto px-6 mt-12">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6 backdrop-blur-sm">
            <p className="text-red-200 font-medium">{error}</p>
          </div>
        )}

        {user?.role === "host" && showForm && (
          <div className="mb-8">
            <CreateHotel onSuccess={handleHotelCreated} />
            <div className="flex justify-end mt-4">
              <button
                onClick={handleSkip}
                className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-300 backdrop-blur-sm"
              >
                Skip for now
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        )}

        {!loading && (
          <>
            {hotels.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-white/5 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/10">
                  <Search size={40} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">No hotels found</h3>
                <p className="text-white/70 text-lg">Try adjusting your filters to see more results</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-12">
                {hotels.map((hotel, index) => {
                  const amenities = getAmenitiesArray(hotel.Amenities);
                  const stars = getStarRating(hotel.Stars);
                  const price = getPrice(hotel);
                  
                  return (
                    <div
                      key={index}
                      className="group bg-white/5 backdrop-blur-md rounded-3xl overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-500 hover:transform hover:-translate-y-2 hover:shadow-2xl"
                    >
                      {/* Hotel Image */}
                      <div className="relative h-64 overflow-hidden">
                        {hotel.Images && hotel.Images.length > 0 ? (
                          <img
                            src={hotel.Images[0]}
                            alt={hotel.Name || hotel["Hotel Name"]}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            onError={(e) => {
                              e.target.src = `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop`;
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center">
                            <Coffee size={48} className="text-white/30" />
                          </div>
                        )}
                        
                        <div className="absolute top-4 left-4 flex items-center gap-2">
                          {hotel["Host Hotel"] && (
                            <div className="bg-green-500/80 text-white px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                              Host Property
                            </div>
                          )}
                          <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full flex items-center gap-1">
                            <Star size={12} className="fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-semibold">{stars}</span>
                          </div>
                        </div>

                        {user?.role === "host" && hotel["Host Hotel"] && (
                          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(hotel)}
                                className="bg-blue-500/80 hover:bg-blue-600/80 text-white p-2 rounded-full backdrop-blur-sm transition-colors duration-300"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(hotel.id)}
                                className="bg-red-500/80 hover:bg-red-600/80 text-white p-2 rounded-full backdrop-blur-sm transition-colors duration-300"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Hotel Content */}
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-xl font-bold text-white leading-tight group-hover:text-blue-200 transition-colors duration-300 flex-1 mr-3">
                            {hotel.Name || hotel["Hotel Name"] || "Unnamed Hotel"}
                          </h3>
                          {price && (
                            <div className="text-right flex-shrink-0">
                              <div className="text-2xl font-bold text-green-400">
                                ₹{price}
                              </div>
                              <div className="text-xs text-white/60">per night</div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mb-4 text-white/80">
                          <MapPin size={16} className="text-blue-400 flex-shrink-0" />
                          <span className="text-sm">
                            {hotel["City/Place"] || hotel.Location}, {hotel.Country}
                          </span>
                        </div>

                        {hotel.Description && (
                          <p className="text-white/70 text-sm mb-4 line-clamp-2">
                            {hotel.Description}
                          </p>
                        )}

                        {amenities && amenities.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {amenities.slice(0, 3).map((amenity, idx) => {
                              const AmenityIcon = getAmenityIcon(amenity);
                              return (
                                <div
                                  key={idx}
                                  className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full text-xs text-white/90 backdrop-blur-sm border border-white/10"
                                >
                                  <AmenityIcon size={12} />
                                  {amenity}
                                </div>
                              );
                            })}
                            {amenities.length > 3 && (
                              <div className="flex items-center bg-white/5 px-3 py-1 rounded-full text-xs text-white/90 backdrop-blur-sm border border-white/10">
                                +{amenities.length - 3} more
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs">
                            {hotel.Rating && hotel.Rating !== "Scored" && hotel.Rating !== 0 && (
                              <div className="flex items-center gap-1">
                                <Star size={12} className="fill-yellow-400 text-yellow-400" />
                                <span className="text-white/80">{hotel.Rating}</span>
                              </div>
                            )}
                            {hotel["Distance from Center"] && (
                              <div className="text-white/60">
                                {hotel["Distance from Center"]}
                              </div>
                            )}
                          </div>
                          
                          <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {user?.role === "host" && !showForm && (
          <div className="fixed bottom-8 right-8">
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-110"
            >
              <Plus size={24} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelPage;