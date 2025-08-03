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
} from "lucide-react";

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
      setError(err.message || "Failed to load hotels.");
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

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat relative">
      {/* Hero with Filters */}
      <div className="relative max-w-5xl mx-auto px-6 py-12 mt-8 bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-xl z-10">
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
                className="flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-xl hover:bg-white/30 transition-all duration-300"
              >
                <X size={16} />
                Clear
              </button>
            )}
          </div>
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

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-white">Country</label>
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
                <label className="block text-sm font-semibold text-white">City</label>
                <input
                  type="text"
                  className="w-full bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:border-blue-500 focus:ring-0 transition-all duration-300"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  placeholder="e.g. Mumbai, Goa"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-white">Minimum Star Rating</label>
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
                <label className="block text-sm font-semibold text-white">Max Price (₹)</label>
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

      {/* Rest of the page content */}
      <div className="max-w-7xl mx-auto px-6 mt-12">
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4 mb-6 backdrop-blur-sm">
            <p className="text-red-200 font-medium">{error}</p>
          </div>
        )}

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

        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        )}

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
                {/* Render hotels (same as before) */}
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
