import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import SearchBar from './SearchBar';

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
  ]
};

function Home() {
  const [location, setLocation] = useState('');
  const [imageLocation, setImageLocation] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  const slider = locations[imageLocation] || [];

  useEffect(() => {
    if (slider.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slider.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [slider]);

  return (
    <div className="bg-white inset-0 flex flex-col items-center">
      <h1 className='text-center pt-10 pb-4 text-6xl tracking-widest'>B A G R A G I</h1>

      {/* 3D Earth */}
      <div className="w-full h-[350px]">
        <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} />
          <Suspense fallback={null}>
            <Earth />
          </Suspense>
          <OrbitControls enableZoom={false} enablePan={false} autoRotate={true} autoRotateSpeed={1.5} />
        </Canvas>
      </div>

      {/* Search Bar */}
      <SearchBar onLocationSelect={({ displayLocation, imageLocation }) => {
        setLocation(displayLocation);
        setImageLocation(imageLocation);
        setCurrentSlide(0); // reset slide when country changes
      }} />

      {/* Slideshow */}
      {/* Slideshow */}
{location && (
  <div className='flex flex-col w-full mt-20 items-center'>
    <div className='text-center mb-10'>
      <h1 className='text-4xl font-extrabold text-blue-900 tracking-wide'>📍 Location: {location}</h1>
    </div>

    {slider.length > 0 ? (
      <div className='flex flex-col items-center justify-center bg-gradient-to-br from-blue-200 to-white p-6 rounded-2xl shadow-xl'>
        <img
          src={slider[currentSlide].img}
          alt={`Slide ${currentSlide + 1}`}
          className='w-full max-w-[500px] h-[400px] object-cover rounded-t-2xl transition-all duration-300 mx-auto'
        />
        <p className='p-4 text-lg text-gray-700 text-center bg-white rounded-b-2xl max-w-[500px] w-full mx-auto'>
          {slider[currentSlide].desc}
        </p>
      </div>
    ) : (
      <div className='w-full h-full flex items-center justify-center text-gray-500'>No slides available</div>
    )}
  </div>
)}
{/* Horizontal Button Row After Slideshow */}
<div className="flex flex-wrap justify-center gap-4 mt-10">
  <button className="border border-black px-5 py-3 rounded-full bg-blue-200 hover:bg-blue-400 transition-all duration-200 font-semibold">Plan a Trip</button>
  <button className="border border-black px-5 py-3 rounded-full bg-blue-200 hover:bg-blue-400 transition-all duration-200 font-semibold">Book Hotel</button>
  <button className="border border-black px-5 py-3 rounded-full bg-blue-200 hover:bg-blue-400 transition-all duration-200 font-semibold">See Images</button>
  <button className="border border-black px-5 py-3 rounded-full bg-green-200 hover:bg-green-400 transition-all duration-200 font-semibold">History</button>
  <button className="border border-black px-5 py-3 rounded-full bg-green-200 hover:bg-green-400 transition-all duration-200 font-semibold">FAQs</button>
</div>


    </div>
  );
}

export default Home;
