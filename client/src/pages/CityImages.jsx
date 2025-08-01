import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const UNSPLASH_API_KEY = 'YOUR_UNSPLASH_ACCESS_KEY'; // Replace with your key

const CityImages = () => {
  const { city } = useParams();
  const [images, setImages] = useState([]);
  const [current, setCurrent] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await axios.get(
          `https://api.unsplash.com/search/photos`,
          {
            params: {
              query: city,
              per_page: 10,
            },
            headers: {
              Authorization: `Client-ID ${UNSPLASH_API_KEY}`,
            },
          }
        );
        setImages(res.data.results);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch images');
      }
    };

    fetchImages();
  }, [city]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 to-indigo-200 flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold text-center mb-6 text-gray-800 tracking-wider">
        Discover the Beauty of {city}
      </h1>

      {error && <p className="text-red-500">{error}</p>}

      {images.length > 0 ? (
        <div className="relative w-full max-w-4xl h-[500px] overflow-hidden rounded-xl shadow-xl">
          <AnimatePresence>
            <motion.img
              key={images[current].id}
              src={images[current].urls.regular}
              alt={images[current].alt_description}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="w-full h-full object-cover rounded-xl"
            />
          </AnimatePresence>
          <div className="absolute bottom-0 bg-black/50 text-white p-4 w-full text-center">
            {images[current].description || images[current].alt_description || `Scene from ${city}`}
          </div>
        </div>
      ) : (
        <p className="text-gray-700 mt-10">Loading images...</p>
      )}
    </div>
  );
};

export default CityImages;
