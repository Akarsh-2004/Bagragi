// controllers/info.controller.js
const wiki = require('wikijs').default;

const fetchWikipediaSummary = async (title) => {
  try {
    const page = await wiki().page(title);
    return await page.summary();
  } catch (error) {
    return null;
  }
};

const getCountryHistory = async (req, res) => {
  const { country } = req.params;
  const history = await fetchWikipediaSummary(`History of ${country}`) || await fetchWikipediaSummary(country);
  if (history) {
    res.json({ country, history });
  } else {
    res.status(404).json({ error: 'History not found' });
  }
};

const getCountryRelations = async (req, res) => {
  const { country1, country2 } = req.params;
  const title1 = `${country1}–${country2} relations`;
  const title2 = `${country2}–${country1} relations`;

  const relations = await fetchWikipediaSummary(title1) || await fetchWikipediaSummary(title2);
  if (relations) {
    res.json({ countries: [country1, country2], relations });
  } else {
    res.status(404).json({ error: `Relations not found between ${country1} and ${country2}` });
  }
};

module.exports = {
  getCountryHistory,
  getCountryRelations
};
