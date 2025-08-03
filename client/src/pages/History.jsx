import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Calendar, BookOpen, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const History = () => {
  const { selected_city } = useParams();
  const [history, setHistory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${process.env.REACT_APP_NODE_API}/api/info/history/${selected_city}`);
      setHistory(res.data.history);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError('Failed to load city history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [selected_city]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Home</span>
            </Link>
            <div className="flex items-center gap-3">
              <MapPin className="text-blue-600" size={24} />
              <h1 className="text-3xl font-bold text-gray-800 capitalize">
                History of {selected_city}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-gray-600">Loading history...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3">
              <BookOpen className="text-red-500" size={24} />
              <div>
                <h3 className="text-lg font-semibold text-red-800">Unable to Load History</h3>
                <p className="text-red-600 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && history && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="text-blue-600" size={28} />
              <h2 className="text-2xl font-bold text-gray-800">
                Historical Overview
              </h2>
            </div>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {history}
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <BookOpen size={16} />
                <span>Source: Wikipedia</span>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && !history && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 text-center">
            <BookOpen className="text-gray-400 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No History Available</h3>
            <p className="text-gray-500">
              We couldn't find historical information for {selected_city}. 
              Try searching for a different location.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
