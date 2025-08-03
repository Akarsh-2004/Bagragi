import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, ExternalLink } from 'lucide-react';

const CityImages = () => {
  const { city } = useParams();
  const [images, setImages] = useState([]);
  const [current, setCurrent] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Decode the city name from URL encoding
  const decodedCity = decodeURIComponent(city);

  // Fetch images from backend when city changes
  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      setError('');
      setImages([]); // Clear previous images

      try {
        console.log('Fetching images for city:', decodedCity);
        
        // Use the environment variable for the Python API base URL
        const baseUrl = process.env.REACT_APP_NODE_API || "http://localhost:8000";
        const res = await fetch(`${baseUrl}/api/pexels/images?query=${encodeURIComponent(decodedCity)}`);
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
          throw new Error(`HTTP error! Status: ${res.status}. Message: ${errorData.error || errorData.message}`);
        }

        const data = await res.json();
        console.log('API Response for CityImages:', data);
        
        // Ensure the response structure matches what's expected
        const fetchedImages = data?.images || [];

        if (Array.isArray(fetchedImages) && fetchedImages.length > 0) {
          setImages(fetchedImages);
          setCurrent(0);
          setError('');
        } else {
          setImages([]);
          setError(`No photos found for ${decodedCity}.`);
        }
      } catch (err) {
        console.error('Error fetching city images:', err);
        setImages([]);
        setError(`Failed to fetch images for ${decodedCity}. ${err.message || 'Please check your connection and try again.'}`);
      } finally {
        setLoading(false);
      }
    };

    if (decodedCity) {
      fetchImages();
    } else {
      setLoading(false);
      setError("No city specified to search for images.");
    }
  }, [decodedCity]);

  // Slideshow effect
  useEffect(() => {
    if (!images.length) return;

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [images]);

  // Navigation functions
  const goToPrevious = () => {
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrent((prev) => (prev + 1) % images.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 to-indigo-200 flex flex-col items-center justify-center p-6 font-inter">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4 capitalize">
            Loading Images for {decodedCity}
          </h1>
          <p className="text-gray-600">Please wait while we fetch beautiful images...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 to-indigo-200 flex flex-col p-6 font-inter">
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-8">
        <Link 
          to="/" 
          className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-300 shadow-lg text-gray-700 font-medium"
        >
          <ArrowLeft size={20} />
          Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold text-center text-gray-800 tracking-wider capitalize flex-grow">
          Discover the Beauty of {decodedCity}
        </h1>
        
        <div className="w-32"></div> {/* Spacer for centering */}
      </div>

      <div className="flex-grow flex items-center justify-center">
        {error ? (
          <div className="text-center bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg max-w-md">
            <p className="text-red-600 text-lg font-medium mb-4">{error}</p>
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <ArrowLeft size={18} />
              Try Another Location
            </Link>
          </div>
        ) : images.length > 0 ? (
          <div className="w-full max-w-6xl">
            {/* Main image display */}
            <div className="relative w-full h-[600px] overflow-hidden rounded-xl shadow-2xl bg-white">
              <img
                key={images[current]?.id || current}
                src={images[current]?.src?.large || images[current]?.url}
                alt={images[current]?.alt || images[current]?.description || `Scene from ${decodedCity}`}
                className="w-full h-full object-cover transition-opacity duration-1000"
                onError={(e) => {
                  console.error('Image failed to load:', images[current]?.src?.large || images[current]?.url);
                  e.target.src = `https://placehold.co/1200x600/E0E7FF/4338CA?text=Image+Load+Error`; // Placeholder on error
                }}
              />
              
              {/* Overlay with image info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
                <div className="flex justify-between items-end">
                  <div className="text-white">
                    <p className="text-lg font-medium mb-2">
                      {images[current]?.alt || images[current]?.description || `A beautiful view of ${decodedCity}`}
                    </p>
                    <p className="text-sm text-white/80">
                      Image {current + 1} of {images.length}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    {/* Link to original Pexels page if available */}
                    {images[current]?.photographer_url && (
                       <a
                         href={images[current].photographer_url}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                         title="View on Pexels"
                       >
                         <ExternalLink size={18} className="text-white" />
                       </a>
                    )}
                    {/* Direct download link if available (Pexels often provides 'original' or 'large2x') */}
                    {images[current]?.src?.original && (
                      <a
                        href={images[current].src.original}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                        title="Download image"
                      >
                        <Download size={18} className="text-white" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={goToPrevious}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-300"
                    title="Previous image"
                  >
                    <ArrowLeft size={24} />
                  </button>
                  <button
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-300"
                    title="Next image"
                  >
                    <ArrowLeft size={24} className="rotate-180" />
                  </button>
                </>
              )}
            </div>

            {/* Image counter and thumbnails */}
            {images.length > 1 && (
              <div className="mt-6 text-center">
                <p className="text-gray-700 mb-4 font-medium">
                  {current + 1} of {images.length} images
                </p>
                
                {/* Thumbnail navigation */}
                <div className="flex justify-center gap-2 flex-wrap max-w-4xl mx-auto">
                  {images.map((img, index) => (
                    <button
                      key={img.id || index}
                      onClick={() => setCurrent(index)}
                      className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                        index === current 
                          ? 'border-indigo-500 shadow-lg scale-110' 
                          : 'border-white/50 hover:border-indigo-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img.src?.small || img.url} // Use Pexels 'src.small' or fallback to 'url'
                        alt={img.alt || `Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = `https://placehold.co/64x48/E0E7FF/4338CA?text=X`; // Tiny placeholder on error
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg max-w-md">
            <p className="text-gray-700 text-lg mb-4">No images found for {decodedCity}</p>
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <ArrowLeft size={18} />
              Try Another Location
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CityImages;
