const express = require('express');
const axios = require('axios');
const router = express.Router();

const PEXELS_API_KEY = process.env.API_KEY;
const PEXELS_BASE_URL = 'https://api.pexels.com/v1/search';

router.get('/images', async (req, res) => {
  try {
    const query = req.query.query;

    // Logging to debug
    console.log('Incoming image query:', query);

    if (!query) {
      return res.status(400).json({ error: 'Missing query parameter' });
    }

    const formattedQuery = query.toLowerCase();

    const response = await axios.get(PEXELS_BASE_URL, {
      headers: { Authorization: PEXELS_API_KEY },
      params: { query: formattedQuery, per_page: 12 },
    });

    const images = response.data.photos.map(photo => ({
      url: photo.src.landscape,
      description: photo.alt || `Scene from ${formattedQuery}`,
    }));

    res.json({ images });

  } catch (error) {
    console.error('Pexels fetch error:', error.message);
    res.status(500).json({ error: 'Failed to fetch images from Pexels' });
  }
});

module.exports = router;
