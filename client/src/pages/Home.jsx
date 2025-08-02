import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { MapPin, Calendar, Hotel, Camera, BookOpen, HelpCircle, User, LogIn, LogOut, Settings, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Keep this import for actual navigation
import LoginModal from '../components/LoginModal'; // Correct import for LoginModal
import AuthForm from '../components/AuthForm'; // Correct import for AuthForm
import SearchBar from '../pages/SearchBar'; // Correct import for SearchBar
import Chatbot from '../components/Chatbot'; // Import Chatbot component
function Earth() {
  const { scene } = useGLTF('/earth3d.glb');
  return <primitive object={scene} scale={1.5} />;
}

const locations = {
  India: [
    { img: '/india/india1.jpg', desc: 'The majestic Taj Mahal in Agra, India.' },
    { img: '/india/india2.jpg', desc: 'Bustling markets of Delhi full of life.' },
    { img: '/india/india3.jpg', desc: 'Serene backwaters of Kerala.' },
    { img: '/india/india4.jpg', desc: 'Spiritual vibes in Varanasi.' },
    { img: '/india/india5.jpg', desc: 'Desert safari in Rajasthan.' },
  ],
  France: [
    { img: '/france/france1.jpg', desc: 'The Eiffel Tower lights up Paris.' },
    { img: '/france/france2.jpg', desc: 'Charming streets of Lyon.' },
    { img: '/france/france3.jpg', desc: 'Lavender fields in Provence.' },
    { img: '/france/france4.jpg', desc: 'The Louvre Museum, Paris.' },
    { img: '/france/france5.jpg', desc: 'Coastal beauty in Nice.' },
  ],
  Japan: [
    { img: '/malaysia.jpg', desc: 'Cherry blossoms in Tokyo, Japan.' },
    { img: '/malaysia.jpg', desc: 'Traditional temples in Kyoto.' },
    { img: '/malaysia.jpg', desc: 'Modern cityscape of Osaka.' },
    { img: '/malaysia.jpg', desc: 'Snow festivals in Sapporo.' },
    { img: '/malaysia.jpg', desc: 'Historic shrines and gardens.' },
  ],
  Brazil: [
    { img: '/malaysia.jpg', desc: 'Christ the Redeemer in Rio de Janeiro.' },
    { img: '/malaysia.jpg', desc: 'Carnival celebrations in Brazil.' },
    { img: '/malaysia.jpg', desc: 'Amazon rainforest adventures.' },
    { img: '/malaysia.jpg', desc: 'Beautiful beaches of Copacabana.' },
    { img: '/malaysia.jpg', desc: 'Samba and Brazilian culture.' },
  ],
  'United States': [
    { img: '/malaysia.jpg', desc: 'New York City skyline.' },
    { img: '/malaysia.jpg', desc: 'Hollywood sign in Los Angeles.' },
    { img: '/malaysia.jpg', desc: 'Chicago architecture.' },
    { img: '/malaysia.jpg', desc: 'Grand Canyon natural wonder.' },
    { img: '/malaysia.jpg', desc: 'Las Vegas entertainment.' },
  ],
  Canada: [
    { img: '/malaysia.jpg', desc: 'Niagara Falls natural wonder.' },
    { img: '/malaysia.jpg', desc: 'Vancouver coastal beauty.' },
    { img: '/malaysia.jpg', desc: 'Montreal French culture.' },
    { img: '/malaysia.jpg', desc: 'Toronto cityscape.' },
    { img: '/malaysia.jpg', desc: 'Rocky Mountains adventure.' },
  ],
  Australia: [
    { img: '/malaysia.jpg', desc: 'Sydney Opera House.' },
    { img: '/malaysia.jpg', desc: 'Great Barrier Reef.' },
    { img: '/malaysia.jpg', desc: 'Melbourne culture.' },
    { img: '/malaysia.jpg', desc: 'Brisbane riverside.' },
    { img: '/malaysia.jpg', desc: 'Perth beaches.' },
  ],
  Germany: [
    { img: '/malaysia.jpg', desc: 'Berlin Brandenburg Gate.' },
    { img: '/malaysia.jpg', desc: 'Munich Oktoberfest.' },
    { img: '/malaysia.jpg', desc: 'Hamburg harbor.' },
    { img: '/malaysia.jpg', desc: 'Frankfurt skyline.' },
    { img: '/malaysia.jpg', desc: 'Bavarian castles.' },
  ],
  Italy: [
    { img: '/malaysia.jpg', desc: 'Rome Colosseum.' },
    { img: '/malaysia.jpg', desc: 'Milan fashion capital.' },
    { img: '/malaysia.jpg', desc: 'Florence Renaissance art.' },
    { img: '/malaysia.jpg', desc: 'Venice canals.' },
    { img: '/malaysia.jpg', desc: 'Tuscany countryside.' },
  ],
  Spain: [
    { img: '/malaysia.jpg', desc: 'Madrid Royal Palace.' },
    { img: '/malaysia.jpg', desc: 'Barcelona Sagrada Familia.' },
    { img: '/malaysia.jpg', desc: 'Valencia City of Arts.' },
    { img: '/malaysia.jpg', desc: 'Seville flamenco.' },
    { img: '/malaysia.jpg', desc: 'Ibiza beaches.' },
  ]
};

function Home({ user, setUser }) {
  const [showLogin, setShowLogin] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [location, setLocation] = useState('');
  const [imageLocation, setImageLocation] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  const navigate = useNavigate(); // Use the actual useNavigate hook

  const slider = locations[imageLocation] || [];

  useEffect(() => {
    if (slider.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slider.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [slider]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const actionButtons = [
    {
      label: "Plan a Trip",
      icon: Calendar,
      onClick: () => navigate('/plan-trip'),
      variant: "primary"
    },
    {
      label: "Book Hotel",
      icon: Hotel,
      onClick: () => navigate('/hotel'),
      variant: "primary"
    },
    {
      label: "See Images",
      icon: Camera,
      onClick: () => {
        if (imageLocation) {
          navigate(`/images/${imageLocation.toLowerCase()}`);
        } else {
          // Replaced alert with a more user-friendly approach (e.g., a custom modal or toast)
          console.warn('Please select a location first to see images.');
          // You might want to implement a custom notification here instead of alert()
          // For example: showNotification('Please select a location first.');
        }
      },
      variant: "secondary"
    },
    {
      label: "History",
      icon: BookOpen,
      onClick: () => {
        if (imageLocation) {
          navigate(`/history/${imageLocation.toLowerCase()}`);
        } else {
          // Replaced alert with a more user-friendly approach
          console.warn('Please select a location first to see history.');
          // For example: showNotification('Please select a location first.');
        }
      },
      variant: "secondary"
    },
    {
      label: "FAQs",
      icon: HelpCircle,
      onClick: () => {},
      variant: "tertiary"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Section */}
      <header className="relative z-20 flex justify-between items-center p-6">
        {/* Use the actual AuthForm component */}
        <div className="flex-grow flex justify-center">
          {user ? (
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-white/20">
              <User size={20} className="text-white" />
              <span className="text-white font-medium">Welcome, {user.name}!</span>
              <span className="text-white/70 text-sm">({user.role})</span>
            </div>
          ) : (
            <div className="text-white text-lg font-medium italic">You're not logged in</div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative user-menu">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
              >
                <UserCheck size={18} />
                <span>Profile</span>
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-white/20 overflow-hidden">
                  <div className="p-4 border-b border-white/20">
                    <p className="font-semibold text-gray-800">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role} Account</p>
                    {user.country && (
                      <p className="text-xs text-gray-500 mt-1">
                        📍 {user.city ? `${user.city}, ` : ''}{user.country}
                      </p>
                    )}
                    {user.phone && (
                      <p className="text-xs text-gray-500 mt-1">
                        📞 {user.phone}
                      </p>
                    )}
                  </div>
                  
                  {user.preferences && (user.preferences.travelStyle || user.preferences.budget) && (
                    <div className="p-3 border-b border-white/20 bg-gray-50">
                      <p className="text-xs font-medium text-gray-700 mb-2">Travel Preferences:</p>
                      {user.preferences.travelStyle && (
                        <p className="text-xs text-gray-600">
                          🎯 {user.preferences.travelStyle.charAt(0).toUpperCase() + user.preferences.travelStyle.slice(1)}
                        </p>
                      )}
                      {user.preferences.budget && (
                        <p className="text-xs text-gray-600">
                          💰 {user.preferences.budget.charAt(0).toUpperCase() + user.preferences.budget.slice(1)} Budget
                        </p>
                      )}
                      {user.preferences.preferredCountries && user.preferences.preferredCountries.length > 0 && (
                        <p className="text-xs text-gray-600 mt-1">
                          🌍 {user.preferences.preferredCountries.slice(0, 2).join(', ')}
                          {user.preferences.preferredCountries.length > 2 && '...'}
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div className="p-2">
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                      <Settings size={16} />
                      <span>Settings</span>
                    </button>
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                      <User size={16} />
                      <span>Profile</span>
                    </button>
                    <button 
                      onClick={() => {
                        setUser(null);
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white/90 backdrop-blur-sm text-gray-900 rounded-full hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
            >
              <LogIn size={18} />
              Login
            </button>
          )}
        </div>
      </header>

      {/* Pass onLogin prop to LoginModal */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={setUser} />}

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center px-6">
        {/* Brand Title */}
        <div className="text-center mb-12">
          <h1 className="text-7xl md:text-8xl font-black tracking-[0.3em] text-white mb-4 drop-shadow-2xl">
            BAGRAGI
          </h1>
          <p className="text-xl text-white/80 font-light tracking-wide">
            Discover the World's Hidden Treasures
          </p>
        </div>

        {/* 3D Earth Section */}
        <div className="w-full max-w-6xl mb-12">
          <div className="relative bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 shadow-2xl">
            <div className="w-full h-[500px] sm:h-[600px] md:h-[700px] lg:h-[800px] xl:h-[900px]">
              <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 5, 5]} />
                <Suspense fallback={null}>
                  <Earth />
                </Suspense>
                <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1.5} />
              </Canvas>
            </div>
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
          </div>
        </div>

        {/* Enhanced Search Bar */}
        <div className="w-full max-w-4xl mb-16">
          {/* Use the imported SearchBar component */}
          <SearchBar onLocationSelect={({ displayLocation, imageLocation }) => {
            console.log('Home received location:', { displayLocation, imageLocation });
            setLocation(displayLocation);
            setImageLocation(imageLocation);
            setCurrentSlide(0);
          }} />
        </div>

        {/* Location Showcase */}
        {location && (
          <div className="w-full max-w-6xl mb-16">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <MapPin className="text-white" size={32} />
                <h2 className="text-5xl font-bold text-white tracking-wide">
                  {location}
                </h2>
              </div>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto rounded-full"></div>
            </div>

            {slider.length > 0 ? (
              <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl border border-white/20">
                <div className="relative">
                  <img
                    src={slider[currentSlide].img}
                    alt={`Slide ${currentSlide + 1}`}
                    className="w-full h-[500px] object-cover transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                  {/* Slide indicators */}
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {slider.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          index === currentSlide
                            ? 'bg-white shadow-lg'
                            : 'bg-white/40 hover:bg-white/60'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="p-8 bg-white/5 backdrop-blur-sm">
                  <p className="text-lg text-white/90 text-center leading-relaxed font-light">
                    {slider[currentSlide].desc}
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-full h-64 flex items-center justify-center bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10">
                <div className="text-center">
                  <p className="text-white/60 text-lg mb-4">No images available for {location}</p>
                  <p className="text-white/40 text-sm">Try searching for another location</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full max-w-6xl mb-16">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {actionButtons.map((button, index) => {
              const IconComponent = button.icon;
              const baseClasses = "group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl border backdrop-blur-sm font-semibold text-center";

              let variantClasses = "";
              if (button.variant === "primary") {
                variantClasses = "bg-blue-500/20 border-blue-400/30 text-white hover:bg-blue-500/30 hover:border-blue-400/50";
              } else if (button.variant === "secondary") {
                variantClasses = "bg-purple-500/20 border-purple-400/30 text-white hover:bg-purple-500/30 hover:border-purple-400/50";
              } else {
                variantClasses = "bg-green-500/20 border-green-400/30 text-white hover:bg-green-500/30 hover:border-green-400/50";
              }

              return (
                <button
                  key={index}
                  onClick={button.onClick}
                  className={`${baseClasses} ${variantClasses}`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 rounded-full bg-white/10 group-hover:bg-white/20 transition-all duration-300">
                      <IconComponent size={24} />
                    </div>
                    <span className="text-sm font-medium">{button.label}</span>
                  </div>

                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </button>
              );
            })}
          </div>
        </div>
      </main>
      
      {/* Chatbot */}
      <Chatbot />
    </div>
  );
}

export default Home;