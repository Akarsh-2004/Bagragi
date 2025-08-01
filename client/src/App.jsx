import './App.css';
import { Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

import BackgroundVideo from './components/BackgroundVideo';
import HotelPage from './pages/HotelPage';
import Home from './pages/Home';

function App() {
  return (
    <div className="relative min-h-screen">
      <BackgroundVideo />

      <div className="relative z-10 p-6">
        <nav className="flex space-x-8 text-[30px]">
          <Link
            to="/"
            className="transition-transform text-white duration-200 hover:scale-110 hover:text-blue-500"
          >
            Home
          </Link>
          <Link
            to="/hotel"
            className="transition-transform text-white duration-200 hover:scale-110 hover:text-blue-500"
          >
            Hotel
          </Link>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/hotel" element={<HotelPage/>} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
