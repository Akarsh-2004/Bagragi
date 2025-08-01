import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // assuming city comes from route
import axios from 'axios';

const History = () => {
  const { selected_city } = useParams(); // e.g., /history/jaipur
  const [segments, setSegments] = useState([]);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/history/${selected_city}`);
      setSegments(res.data?.segments || []);
    } catch (err) {
      setError('Failed to load city history.');
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [selected_city]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">
        Hey, welcome to <span className="text-indigo-600 capitalize">{selected_city}</span>!
      </h1>

      {error && <p className="text-red-500">{error}</p>}

      {segments.length === 0 && !error && <p>Loading history...</p>}

      {segments.map((seg, idx) => (
        <div key={idx} className="mb-6">
          <h2 className="text-xl font-semibold mb-2">{seg.title}</h2>
          <p className="text-gray-700">{seg.content}</p>
        </div>
      ))}
    </div>
  );
};

export default History;
