const fetch = require('node-fetch');

const API_KEY = process.env.OPENWEATHER_API_KEY;

const searchLocations = async (req, res) => {
  const { q } = req.query;
  
  try {
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${q}&limit=5&appid=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Geocode API response was not ok');
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Geocode API Error:', error);
    res.status(500).json({ error: 'Failed to fetch location data' });
  }
};

module.exports = {
  searchLocations
};
