import React, { useState } from 'react';
import axios from 'axios';

const roomOptions = ['Single', 'Double', 'Suite', 'Deluxe', 'Family'];

const CreateHotel = ({ onSuccess }) => {
  const [form, setForm] = useState({
    name: '',
    roomTypes: [],
    price: '',
    location: '',
    images: [],
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRoomTypesChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setForm({ ...form, roomTypes: selectedOptions });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length < 3) {
      setError('Please upload at least 3 images.');
      setForm({ ...form, images: [] });
    } else {
      setError('');
      setForm({ ...form, images: files });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.images.length < 3) {
      return setError('At least 3 images are required.');
    }

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('price', form.price);
    formData.append('location', form.location);
    form.roomTypes.forEach(type => formData.append('roomTypes[]', type));
    form.images.forEach(img => formData.append('images', img));

    try {
      await axios.post('http://localhost:5000/api/hotels', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess('Hotel created successfully!');
      setError('');
      setForm({ name: '', roomTypes: [], price: '', location: '', images: [] });

      if (onSuccess) onSuccess(); // Trigger parent to hide form and reload hotels
    } catch (err) {
      setSuccess('');
      setError('Failed to create hotel');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow rounded mt-8">
      <h2 className="text-2xl font-semibold mb-4">Create Hotel</h2>

      {error && <p className="text-red-600 mb-2">{error}</p>}
      {success && <p className="text-green-600 mb-2">{success}</p>}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="mb-4">
          <label className="block mb-1 font-medium">Hotel Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Room Types</label>
          <select
            multiple
            value={form.roomTypes}
            onChange={handleRoomTypesChange}
            className="w-full border p-2 rounded"
            required
          >
            {roomOptions.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">
            Hold Ctrl (or Cmd on Mac) to select multiple
          </p>
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Price (per night)</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Location</label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Upload Images (min 3)</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="w-full"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default CreateHotel;
