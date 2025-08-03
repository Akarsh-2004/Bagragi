// controllers/inflation.controller.js
const axios = require('axios');
const countryCodes = require('../data/isoCodes'); // mapping of "India" → "IN"

const getInflation = async (req, res) => {
    const countryName = req.params.country;
    const isoCode = countryCodes[countryName];

    if (!isoCode) {
        return res.status(400).json({ error: "Invalid country name" });
    }

    const url = `http://api.worldbank.org/v2/country/${isoCode}/indicator/FP.CPI.TOTL.ZG?format=json&per_page=100`;

    try {
        const response = await axios.get(url);
        const data = response.data[1];

        const latest = data.find(entry => entry.value !== null);
        if (!latest) {
            return res.status(404).json({ error: `No recent inflation data for ${countryName}` });
        }

        return res.json({
            country: countryName,
            year: latest.date,
            inflation: `${latest.value.toFixed(2)}%`,
            indicator: latest.indicator.value
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch inflation data" });
    }
};

module.exports = { getInflation };
