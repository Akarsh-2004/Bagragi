import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

function Earth (){
    const {scene}=useGLTF('/earth3d.glb');
    return <primitive object={scene} scale={1.5}/>
}

function Home(){
    return (
        <div className="bg-white inset-0 flex flex-col items-center">
          <h1 className='text-center pt-10 pb-4 text-6xl tracking-widest'>B    A    G    R    A    G    I</h1>
          {/* 3d image */}
          <div className="w-full h-[350px] ">
        <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} />
          <Suspense fallback={null}>
            <Earth />
          </Suspense>
          <OrbitControls enableZoom={false} enablePan={false} autoRotate={true} autoRotateSpeed={1.5} />
        </Canvas>
      </div>
      <div className='w-full mt-20'>
        <input type="text" placeholder="Enter the place you wish to tour.." className='block mx-auto px-5 py-3 w-[350px] border-4 border-black rounded-full'/>
      </div>
      <div className="flex flex-col w-full mt-20 bg-gradient-to-br from-blue-100 to-white p-6 rounded-3xl shadow-xl">
  <div className="text-center mb-10">
    <h1 className="text-4xl font-extrabold text-blue-900 tracking-wide">📍 Location: Malaysia</h1>
  </div>

  <div className="flex gap-8 flex-wrap justify-center">
    {/* Left: Map */}
    <div className="w-[700px] h-[450px] rounded-3xl bg-white shadow-md">
  <img
    src="/malaysia.jpg"
    alt="Malaysia Map"
    className="w-full h-full rounded-2xl shadow-inner object-cover"
  />
</div>


    {/* Right: Buttons */}
    <div className="flex flex-col gap-6 w-[350px]">
      <div className="border-2 border-gray-800 p-6 rounded-3xl bg-white shadow-md">
        <button className="w-full border border-black p-3 mb-3 rounded-full bg-blue-200 hover:bg-blue-400 transition-all duration-200 font-semibold">Plan a Trip</button>
        <button className="w-full border border-black p-3 mb-3 rounded-full bg-blue-200 hover:bg-blue-400 transition-all duration-200 font-semibold">Book Hotel</button>
        <button className="w-full border border-black p-3 mb-3 rounded-full bg-blue-200 hover:bg-blue-400 transition-all duration-200 font-semibold">See Images</button>
      </div>
      <div className="border-2 border-gray-800 p-6 rounded-3xl bg-white shadow-md">
        <button className="w-full border border-black p-3 mb-3 rounded-full bg-green-200 hover:bg-green-400 transition-all duration-200 font-semibold">History</button>
        <button className="w-full border border-black p-3 mb-3 rounded-full bg-green-200 hover:bg-green-400 transition-all duration-200 font-semibold">FAQs</button>
      </div>
    </div>
  </div>
</div>

        </div>
    )
}

export default Home;