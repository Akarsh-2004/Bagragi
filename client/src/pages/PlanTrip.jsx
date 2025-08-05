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
    if (isNaN(num) || num < 0) return "low";
    if (num < 1000) return "low";
    if (num < 2500) return "medium";
    return "high";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setPlan(null);

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
        "https://bagragi-node-latest.onrender.com/api/trips/plan",
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
      setPlan(response.data.tripPlan);
      setError("");
    } catch (error) {
      console.error("Error creating trip plan:", error);
      if (error.response && error.response.status === 404) {
        setError("Trip plan API endpoint not found.");
      } else {
        setError(
          error.response?.data?.error ||
          error.message ||
          "Unknown error creating trip"
        );
      }
      setPlan(null);
    }
  };

  const fetchSuggestions = async () => {
    if (!formData.destination.trim()) {
      setSuggestions([]);
      return;
    }
    const normalized = normalizeDestination(formData.destination);
    try {
      const res = await axios.get(
        `https://bagragi-node-latest.onrender.com/api/trips/suggestions/${normalized}`
      );
      setSuggestions(res.data.suggestions.cities || []);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setError(
        error.response?.data?.error || error.message || "Error fetching suggestions"
      );
      setSuggestions([]);
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
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl mt-6 text-white space-y-4">
          <h3 className="text-2xl font-bold">🎉 Your Trip Plan</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><span className="font-semibold">📍 Destination:</span> {plan.destination}</p>
              <p><span className="font-semibold">💰 Budget:</span> {plan.budget}</p>
              <p><span className="font-semibold">🕒 Duration:</span> {plan.duration}</p>
            </div>
            <div>
              <p><span className="font-semibold">🏨 Accommodation:</span> {plan.accommodation}</p>
              <p><span className="font-semibold">💸 Estimated Cost:</span> {plan.estimatedCost}</p>
            </div>
          </div>

          <div>
            <p className="font-semibold mb-1">🧘 Activities:</p>
            <ul className="list-disc ml-6 space-y-1">
              {plan.activities.map((activity, idx) => (
                <li key={idx}>{activity}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-semibold mb-1">📌 Recommendations:</p>
            <ul className="list-disc ml-6 space-y-1">
              {plan.recommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanTrip;
