import React, { useEffect, useState } from "react";
import { Search, Star, MapPin, DollarSign, Filter, X, Plus, Edit, Trash2, Wifi, Car, Coffee, Dumbbell, Users, Waves } from "lucide-react";

const CreateHotel = ({ onSuccess }) => (
  <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
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

  // Filter states
  const [minStars, setMinStars] = useState("");
  const [maxDistance, setMaxDistance] = useState("");
  const [maxPredictedPrice, setMaxPredictedPrice] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("India");
  const [selectedCity, setSelectedCity] = useState("");

  const fetchHotels = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:8000/api/hotel_info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          country: selectedCountry,
          city: selectedCity,
          stars: minStars ? parseFloat(minStars) : null,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setHotels(data.hotels || []);
      setAveragePrice(data.average_price);
      setCount(data.count || 0);
    } catch (err) {
      console.error("Error fetching hotels:", err);
      setError(err.message || "Failed to load hotels. Please check your connection.");
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
      'WiFi': Wifi,
      'Pool': Waves,
      'Gym': Dumbbell,
      'Restaurant': Coffee,
      'Parking': Car,
      'Bar': Coffee,
      'Beach Access': Waves,
      'Water Sports': Waves,
      'Hiking': Users,
      'Fireplace': Coffee,
      'Spa': Users
    };
    return iconMap[amenity] || Coffee;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Discover Amazing Hotels
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Find your perfect stay from luxury resorts to cozy retreats
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-10">
        {/* Filter Bar */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-6 mb-8 border border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
                  className="flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-xl hover:bg-white/30 transition-all duration-300"
                >
                  <X size={16} />
                  Clear
                </button>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm">
              {averagePrice && (
                <div className="flex items-center gap-2 bg-green-500/20 text-green-200 px-4 py-2 rounded-xl backdrop-blur-sm border border-green-500/30">
                  <DollarSign size={16} />
                  Avg: ₹{averagePrice}
                </div>
              )}
              {count > 0 && (
                <div className="bg-blue-500/20 text-blue-200 px-4 py-2 rounded-xl backdrop-blur-sm border border-blue-500/30">
                  {count} hotels found
                </div>
              )}
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-white">
                    Country
                  </label>
                  <select
                    className="w-full bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-0 transition-all duration-300"
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
                  <label className="block text-sm font-semibold text-white">
                    City
                  </label>
                  <input
                    type="text"
                    className="w-full bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:border-blue-500 focus:ring-0 transition-all duration-300"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    placeholder="e.g. Mumbai, Goa"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-white">
                    Minimum Star Rating
                  </label>
                  <select
                    className="w-full bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-0 transition-all duration-300"
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
                  <label className="block text-sm font-semibold text-white">
                    Max Price (₹)
                  </label>
                  <input
                    type="number"
                    className="w-full bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:border-blue-500 focus:ring-0 transition-all duration-300"
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

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4 mb-6 backdrop-blur-sm">
            <p className="text-red-200 font-medium">{error}</p>
          </div>
        )}

        {/* Hotel Creation Form */}
        {user?.role === "host" && showForm && (
          <div className="mb-8">
            <CreateHotel onSuccess={handleHotelCreated} />
            <div className="flex justify-end mt-4">
              <button
                onClick={handleSkip}
                className="px-6 py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-300 backdrop-blur-sm"
              >
                Skip for now
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        )}

        {/* Hotel Grid */}
        {!loading && (
          <>
            {hotels.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                  <Search size={40} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">No hotels found</h3>
                <p className="text-white/70 text-lg">Try adjusting your filters to see more results</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-12">
                {hotels.map((hotel, idx) => (
                  <div
                    key={idx}
                    className="group bg-white/10 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/20"
                  >
                    {/* Image */}
                    <div className="relative overflow-hidden h-64">
                      {hotel.Images?.[0] && (
                        <img
                          src={hotel.Images[0]}
                          alt="Hotel"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      )}
                      <div className="absolute top-4 right-4">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                          <Star size={14} className="text-yellow-500 fill-current" />
                          <span className="text-sm font-bold text-gray-900">
                            {hotel.Stars || "N/A"}
                          </span>
                        </div>
                      </div>
                      {hotel["Host Hotel"] && user?.role === "host" && (
                        <div className="absolute top-4 left-4">
                          <div className="bg-blue-600 text-white rounded-full px-3 py-1 text-xs font-semibold">
                            Your Property
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors duration-300">
                        {hotel.Name || hotel["Hotel Name"] || "Unnamed Hotel"}
                      </h3>

                      <p className="text-white/70 text-sm mb-4 line-clamp-2">
                        {hotel.Description || hotel.description || "No description available"}
                      </p>

                      <div className="flex items-center gap-2 text-white/80 mb-3">
                        <MapPin size={16} className="text-blue-400" />
                        <span className="text-sm">
                          {hotel["Location"] || `${hotel["City/Place"] || ""}, ${hotel.Country || ""}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-white/60 mb-4">
                        <span>📏 {typeof hotel["Distance from Center"] === "string" 
                          ? hotel["Distance from Center"] 
                          : `${hotel["Distance from Center"] ?? "?"} km`}
                        </span>
                      </div>

                      {/* Pricing */}
                      <div className="space-y-2 mb-4">
                        {hotel["Predicted Price"] && (
                          <div className="flex items-center justify-between bg-green-500/20 rounded-xl px-3 py-2 border border-green-500/30">
                            <span className="text-sm text-green-200 font-medium">Predicted Price</span>
                            <span className="text-lg font-bold text-green-100">₹{hotel["Predicted Price"]}</span>
                          </div>
                        )}
                        {hotel["Price Per Night"] && (
                          <div className="flex items-center justify-between bg-blue-500/20 rounded-xl px-3 py-2 border border-blue-500/30">
                            <span className="text-sm text-blue-200 font-medium">Actual Price</span>
                            <span className="text-lg font-bold text-blue-100">₹{hotel["Price Per Night"]}</span>
                          </div>
                        )}
                      </div>

                      {/* Amenities */}
                      {hotel.Amenities?.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-white/80 mb-2">AMENITIES</p>
                          <div className="flex flex-wrap gap-2">
                            {hotel.Amenities.slice(0, 4).map((amenity, i) => {
                              const IconComponent = getAmenityIcon(amenity);
                              return (
                                <div key={i} className="flex items-center gap-1 bg-white/20 rounded-lg px-2 py-1 backdrop-blur-sm">
                                  <IconComponent size={12} className="text-white/70" />
                                  <span className="text-xs text-white/80">{amenity}</span>
                                </div>
                              );
                            })}
                            {hotel.Amenities.length > 4 && (
                              <div className="bg-white/20 rounded-lg px-2 py-1 backdrop-blur-sm">
                                <span className="text-xs text-white/80">+{hotel.Amenities.length - 4} more</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      {hotel["Host Hotel"] && user?.role === "host" && (
                        <div className="flex gap-3 pt-4 border-t border-white/20">
                          <button
                            className="flex items-center gap-2 text-blue-300 hover:text-blue-200 font-medium transition-colors duration-200"
                            onClick={() => handleEdit(hotel)}
                          >
                            <Edit size={16} />
                            Edit
                          </button>
                          <button
                            className="flex items-center gap-2 text-red-300 hover:text-red-200 font-medium transition-colors duration-200"
                            onClick={() => handleDelete(hotel._id)}
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Add Hotel Button for Hosts */}
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