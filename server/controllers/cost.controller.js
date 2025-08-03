const axios = require('axios');
require('dotenv').config();

const RAPIDAPI_HOST = 'find-places-to-live.p.rapidapi.com';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '7af33edfebmsh9ebd3c62880d54bp1dc77djsn0595d545767f';

const getCostOfLiving = async (req, res) => {
  const { place, type } = req.query;

  if (!place || !type) {
    return res.status(400).json({ error: 'Missing "place" or "type" query parameters.' });
  }

  try {
    const response = await axios.get('https://find-places-to-live.p.rapidapi.com/placesToLive', {
      params: { place, type },
      headers: {
        'x-rapidapi-host': RAPIDAPI_HOST,
        'x-rapidapi-key': RAPIDAPI_KEY
      }
    });

    const data = response.data;

    if (Array.isArray(data) && data.length > 0) {
      return res.json({
        place,
        type,
        costOfLiving: data[0].costOfLiving,
        summary: data[0]
      });
    } else {
      return res.status(404).json({ error: `No results found for ${place}` });
    }
  } catch (error) {
    const msg = error.response?.data?.errors || error.message;
    return res.status(500).json({ status: 'error', error: msg });
  }
};

module.exports = { getCostOfLiving };
