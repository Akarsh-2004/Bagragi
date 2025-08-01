import React, { useEffect, useState } from "react";
import axios from "axios";
import CreateHotel from "../components/CreateHotel";

const HotelPage = ({ user }) => {
  const [hotels, setHotels] = useState([]);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(user?.role === 'host'); // show form for host initially

  const fetchHotels = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/hotels");
      setHotels(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load hotels");
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const handleHotelCreated = () => {
    setShowForm(false);
    fetchHotels(); // Refresh list
  };

  const handleSkip = () => {
    setShowForm(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Hotels</h1>

      {error && <p className="text-red-500">{error}</p>}

      {user?.role === "host" && showForm ? (
        <>
          <CreateHotel onSuccess={handleHotelCreated} />
          <div className="flex justify-end mt-4">
            <button
              onClick={handleSkip}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 mr-2"
            >
              Skip
            </button>
          </div>
        </>
      ) : (
        <>
          {hotels.length === 0 ? (
            <p className="text-gray-500">No hotels available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotels.map((hotel) => (
                <div
                  key={hotel._id}
                  className="bg-white rounded-xl shadow p-4 flex flex-col justify-between"
                >
                  <div>
                    <h2 className="text-xl font-semibold">{hotel.name}</h2>
                    <p className="text-gray-700">{hotel.description}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Hosted by: {hotel.hostId?.name || "Unknown"}
                    </p>
                  </div>

                  {user?.role === "host" &&
                    user.userId === hotel.hostId?._id && (
                      <div className="mt-4 flex gap-2">
                        <button
                          className="text-blue-600 hover:underline"
                          onClick={() => {
                            // Navigate to edit page
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-600 hover:underline"
                          onClick={() => {
                            // Trigger delete
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HotelPage;
