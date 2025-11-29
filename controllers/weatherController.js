const fetch = require('node-fetch');

const API_KEY = process.env.OPENWEATHER_API_KEY;

const getCurrentWeather = async (req, res) => {
  const { lat, lon, units } = req.query;
  
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Weather API response was not ok');
    }
    
    const data = await response.json();
    
    // Fetch AQI data
    try {
      const aqiResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
      );
      
      if (aqiResponse.ok) {
        const aqiData = await aqiResponse.json();
        data.aqi = aqiData;
      }
    } catch (aqiError) {
      console.error('AQI Fetch Error:', aqiError);
      // Continue without AQI data
    }
    
    res.json(data);
  } catch (error) {
    console.error('Weather API Error:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
};

module.exports = {
  getCurrentWeather
};
