import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const CityImages = () => {
  const { city } = useParams();
  const [images, setImages] = useState([]);
  const [current, setCurrent] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/pexels/images', {
          params: {
            query: city.toLowerCase(),
          },
        });

        const photos = res.data?.photos || [];

        if (Array.isArray(photos)) {
          setImages(photos);
          setCurrent(0);
        } else {
          setError('No photos found for this city.');
        }
      } catch (err) {
        console.error('Error fetching city images:', err);
        setError('Failed to fetch city images.');
      }
    };

    fetchImages();
  }, [city]);

  useEffect(() => {
    if (!images.length) return;

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
          <img
            key={images[current]?.id || current}
            src={images[current]?.src?.large}
            alt={images[current]?.alt || `Scene from ${city}`}
            className="w-full h-full object-cover rounded-xl transition-opacity duration-1000"
          />
          <div className="absolute bottom-0 bg-black/50 text-white p-4 w-full text-center text-sm md:text-base">
            {images[current]?.alt || `A view of ${city}`}
          </div>
        </div>
      ) : (
        !error && <p className="text-gray-700 mt-10">Loading images...</p>
      )}
    </div>
  );
};

export default CityImages;
