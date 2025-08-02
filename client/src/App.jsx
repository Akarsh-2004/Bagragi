import './App.css';
import { Routes, Route, Link } from 'react-router-dom';
import { useState } from 'react';

import BackgroundVideo from './components/BackgroundVideo';
import HotelPage from './pages/HotelPage';
import Home from './pages/Home';
import CityImages from './pages/CityImages';
import History from './pages/History';
import PlanTrip from './pages/PlanTrip';

function App() {
  const [user, setUser] = useState(null);

  return (
    <div className="relative min-h-screen">
      <BackgroundVideo />

      <div className="relative z-10 p-6">
        <nav className="flex justify-between items-center mb-8">
          <div className="flex space-x-8 text-[30px]">
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
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-white/80 text-sm">
              Discover • Explore • Experience
            </span>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home user={user} setUser={setUser} />} />
          <Route path="/hotel" element={<HotelPage user={user} />} />
          <Route path="/images/:city" element={<CityImages />} />
          <Route path="/history/:selected_city" element={<History />} />
          <Route path="/plan-trip" element={<PlanTrip />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
