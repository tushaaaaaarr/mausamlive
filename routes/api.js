const express = require('express');
const router = express.Router();
const { getCurrentWeather } = require('../controllers/weatherController');
const { getForecast } = require('../controllers/forecastController');
const { searchLocations } = require('../controllers/geocodeController');
const { generateWeatherSummary, getActivityRecommendations, getHealthAdvisory, getTravelTips } = require('../controllers/aiController');

router.get('/weather', getCurrentWeather);
router.get('/forecast', getForecast);
router.get('/geocode', searchLocations);

// AI Routes
router.get('/ai/summary', generateWeatherSummary);
router.get('/ai/activities', getActivityRecommendations);
router.get('/ai/health-advisory', getHealthAdvisory);
router.post('/ai/travel-tips', getTravelTips);

module.exports = router;
