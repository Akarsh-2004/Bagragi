import React, { useState, useEffect } from "react";
import axios from "axios";

const PlanTrip = () => {
  const [formData, setFormData] = useState({
    destination: "",
    budget: "",
    travelStyle: "relaxing",
    groupSize: 1,
    duration: 3,
  });
  const [suggestions, setSuggestions] = useState([]);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      let parsedValue = value;
      if (name === "groupSize" || name === "duration") {
        // Ensure that empty string remains empty, otherwise parse
        parsedValue = value === "" ? "" : parseInt(value);
      } else if (name === "budget") {
        parsedValue = value;
      }
      return {
        ...prev,
        [name]: parsedValue,
      };
    });
  };

  const normalizeDestination = (destination) =>
    destination.trim().toLowerCase().replace(/\s+/g, "");

  const mapBudget = (value) => {
    const num = parseInt(value);
    if (isNaN(num) || num < 0) return "low"; // Handle NaN or negative for budget mapping
    if (num < 1000) return "low";
    if (num < 2500) return "medium";
    return "high";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setPlan(null); // Clear previous plan

    // Frontend validation for required fields
    if (!formData.destination.trim()) {
      setError("Please enter a destination.");
      return;
    }
    if (!formData.budget || isNaN(parseInt(formData.budget))) {
      setError("Please enter a valid budget (a number).");
      return;
    }
    if (isNaN(formData.groupSize) || formData.groupSize < 1) {
      setError("Group size must be at least 1.");
      return;
    }
    if (isNaN(formData.duration) || formData.duration < 1) {
      setError("Duration must be at least 1 day.");
      return;
    }

    const normalized = normalizeDestination(formData.destination);

    try {
      const response = await axios.post(
        "https://bagragi-node-latest.onrender.com/api/trips/plan", // <-- FIXED: Changed /api/trip to /api/trips
        {
          destination: normalized,
          budget: mapBudget(formData.budget),
          preferences: {
            travelStyle: formData.travelStyle,
            groupSize: formData.groupSize,
            duration: formData.duration,
          },
        }
      );
      setPlan(response.data.tripPlan); // Access the tripPlan object from the response
      setError(""); // Clear any error if successful
    } catch (error) {
      console.error("Error creating trip plan:", error);
      // More specific error message for 404
      if (error.response && error.response.status === 404) {
        setError("Trip plan API endpoint not found. Check backend deployment and routes (expecting /api/trips/plan).");
      } else {
        setError(
          error.response?.data?.error || error.message || "Unknown error creating trip"
        );
      }
      setPlan(null); // Ensure plan is null on error
    }
  };

  const fetchSuggestions = async () => {
    if (!formData.destination.trim()) {
      setSuggestions([]); // Clear suggestions if destination is empty
      return;
    }
    const normalized = normalizeDestination(formData.destination);
    try {
      const res = await axios.get(
        `https://bagragi-node-latest.onrender.com/api/trips/suggestions/${normalized}` // <-- FIXED: Changed /api/trip to /api/trips
      );
      setSuggestions(res.data.suggestions.cities || []); // Access cities or default to empty array
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setError(
        error.response?.data?.error || error.message || "Error fetching suggestions"
      );
      setSuggestions([]); // Clear suggestions on error
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      if (formData.destination.trim()) {
        fetchSuggestions();
      } else {
        setSuggestions([]);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [formData.destination]);

  return (
    <div className="max-w-xl mx-auto p-6 bg-white/5 backdrop-blur-md rounded-2xl shadow-md space-y-6">
      <h2 className="text-xl font-semibold text-white">Plan Your Trip</h2>
      <form onSubmit={handleSubmit} className="space-y-4 text-white">
        <input
          type="text"
          name="destination"
          placeholder="Destination"
          value={formData.destination}
          onChange={handleChange}
          className="w-full p-2 bg-white/10 rounded-md"
          required
        />
        <input
          type="number"
          name="budget"
          placeholder="Budget (₹)"
          value={formData.budget}
          onChange={handleChange}
          className="w-full p-2 bg-white/10 rounded-md"
          required
          min="0"
        />
        <select
          name="travelStyle"
          value={formData.travelStyle}
          onChange={handleChange}
          className="w-full p-2 bg-white/10 rounded-md"
        >
          <option value="relaxing">Relaxing</option>
          <option value="adventurous">Adventurous</option>
          <option value="cultural">Cultural</option>
        </select>
        <input
          type="number"
          name="groupSize"
          placeholder="Group Size"
          value={formData.groupSize}
          onChange={handleChange}
          className="w-full p-2 bg-white/10 rounded-md"
          min={1}
          required
        />
        <input
          type="number"
          name="duration"
          placeholder="Trip Duration (days)"
          value={formData.duration}
          onChange={handleChange}
          className="w-full p-2 bg-white/10 rounded-md"
          min={1}
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-md font-semibold"
        >
          Generate Trip Plan
        </button>
      </form>

      {error && <div className="text-red-400">❌ {error}</div>}

      {suggestions.length > 0 && (
        <div className="text-white">
          <h3 className="mt-6 mb-2 font-bold">Suggestions:</h3>
          <ul className="list-disc ml-5 space-y-1">
            {suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      {plan && (
        <div className="text-white mt-6">
          <h3 className="font-bold mb-2">Your Trip Plan:</h3>
          <pre className="whitespace-pre-wrap bg-white/10 p-3 rounded-md">
            {JSON.stringify(plan, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default PlanTrip;
