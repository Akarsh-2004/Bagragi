import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import axios from "axios";

const CityImages = () => {
  const { city } = useParams();
  const decodedCity = decodeURIComponent(city || "");
  const [images, setImages] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchImages = async () => {
    try {
      setLoading(true);
      console.log("Fetching images for city:", decodedCity);

      const res = await axios.get(
        `https://bagragi-node-latest.onrender.com/api/pexels/images?query=${encodeURIComponent(decodedCity)}`
      );

      const data = res.data;
      const images = data?.images || [];

      if (Array.isArray(images) && images.length > 0) {
        setImages(images);
        setCurrent(0);
        setError("");
      } else {
        setImages([]);
        setError(`No photos found for ${decodedCity}.`);
      }
    } catch (err) {
      console.error("Error fetching city images:", err);
      setImages([]);
      setError(`Failed to fetch images for ${decodedCity}.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [decodedCity]);

  const nextImage = () => setCurrent((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrent((prev) => (prev - 1 + images.length) % images.length);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="backdrop-blur-md bg-white/10 p-8 rounded-3xl border border-white/20 shadow-2xl">
          <Loader2 className="h-10 w-10 animate-spin text-white mx-auto mb-4" />
          <p className="text-white text-lg font-medium">Loading photos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="backdrop-blur-md bg-white/10 p-8 rounded-3xl border border-white/20 shadow-2xl text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-white text-lg font-medium mb-6">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <ArrowLeft size={18} />
            Go Back
          </Link>
        </div>
      </div>
    );
  }

  const currentImage = images[current];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            to="/" 
            className="group flex items-center gap-3 backdrop-blur-md bg-white/10 px-6 py-3 rounded-full border border-white/20 text-white hover:bg-white/20 transition-all duration-300 shadow-lg"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-medium">Back to Home</span>
          </Link>
          
          <div className="text-center flex-grow mx-8">
            <h1 className="text-4xl font-bold text-white capitalize bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent drop-shadow-lg">
              Photos of {decodedCity}
            </h1>
          </div>
          
          <div className="w-32" /> {/* Spacer */}
        </div>

        {/* Image Container */}
        <div className="relative backdrop-blur-lg bg-white/5 rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
          {currentImage ? (
            <div className="relative">
              <img
                src={currentImage.url}
                alt={currentImage.description || `Image of ${decodedCity}`}
                className="w-full h-[600px] object-cover"
              />
              
              {/* Gradient overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />
            </div>
          ) : (
            <div className="h-[600px] flex items-center justify-center">
              <p className="text-white text-xl">No image available</p>
            </div>
          )}

          {/* Image Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 backdrop-blur-md bg-black/30 border-t border-white/10">
            <div className="p-6 flex justify-between items-center">
              <div className="flex-grow">
                <h3 className="text-xl font-semibold text-white mb-2">
                  {currentImage?.description || `Beautiful scenery from ${decodedCity}`}
                </h3>
                <div className="flex items-center gap-4 text-white/80">
                  <span className="text-sm font-medium">
                    {current + 1} of {images.length}
                  </span>
                  <div className="flex gap-1">
                    {images.map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          idx === current ? 'bg-white' : 'bg-white/30'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              {currentImage?.url && (
                <a
                  href={currentImage.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-4 backdrop-blur-md bg-white/20 hover:bg-white/30 p-3 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg"
                  title="View full size"
                >
                  <ExternalLink size={20} className="text-white" />
                </a>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute top-1/2 left-6 transform -translate-y-1/2 backdrop-blur-md bg-black/40 hover:bg-black/60 text-white p-4 rounded-full border border-white/20 transition-all duration-300 hover:scale-110 shadow-lg"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={nextImage}
                className="absolute top-1/2 right-6 transform -translate-y-1/2 backdrop-blur-md bg-black/40 hover:bg-black/60 text-white p-4 rounded-full border border-white/20 transition-all duration-300 hover:scale-110 shadow-lg"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Keyboard navigation hint */}
          {images.length > 1 && (
            <div className="absolute top-6 right-6">
              <div className="backdrop-blur-md bg-black/30 px-4 py-2 rounded-full border border-white/20">
                <p className="text-white/70 text-sm">Use ← → keys</p>
              </div>
            </div>
          )}
        </div>

        {/* Thumbnail strip for larger collections */}
        {images.length > 3 && (
          <div className="mt-6 flex justify-center">
            <div className="backdrop-blur-md bg-white/5 p-4 rounded-2xl border border-white/10 shadow-lg">
              <div className="flex gap-2 max-w-md overflow-x-auto">
                {images.slice(Math.max(0, current - 2), current + 3).map((img, idx) => {
                  const actualIdx = Math.max(0, current - 2) + idx;
                  return (
                    <button
                      key={actualIdx}
                      onClick={() => setCurrent(actualIdx)}
                      className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                        actualIdx === current 
                          ? 'border-white shadow-lg scale-110' 
                          : 'border-white/30 hover:border-white/60'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CityImages;
