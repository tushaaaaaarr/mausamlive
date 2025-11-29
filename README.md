# MausamLive 🌤️

A modern, AI-powered weather application that provides real-time weather forecasts, air quality insights, and personalized health & safety recommendations using Google's Gemini API.

## Features ✨

### 🌍 Weather Information
- **Real-time Weather Data** - Current conditions, temperature, humidity, wind speed, pressure
- **5-Day Forecast** - Detailed daily weather predictions
- **Hourly Breakdown** - 3-hour interval forecasts for precise planning
- **Multiple Locations** - Search and compare weather across different cities
- **Unit Toggle** - Switch between Metric (°C, m/s) and Imperial (°F, mph) units

### 🤖 AI-Powered Insights (Gemini API)
- **Weather Summary** - AI-generated friendly weather descriptions
- **Health & Safety Advisory** - Personalized recommendations based on:
  - Temperature and weather conditions
  - Air quality (AQI) levels
  - Special precautions for vulnerable groups (elderly, children, asthma patients)
  - When to seek medical help
- **Activity Recommendations** - Suggested outdoor activities tailored to current weather
- **Air Quality Analysis** - Detailed AQI with PM2.5 & PM10 tracking using EPA breakpoint formula

### 🎨 User Experience
- **Dark/Light Theme Toggle** - Seamless theme switching
- **Location Persistence** - App remembers your last searched location
- **Geolocation Support** - One-click current location detection
- **Responsive Design** - Works perfectly on mobile, tablet, and desktop
- **Beautiful UI** - Modern, clean interface with smooth animations

## Tech Stack 🛠️

**Frontend:**
- HTML5, CSS3, JavaScript (Vanilla)
- OpenWeather API for weather data
- Google Generative AI (Gemini 2.0 Flash) for AI insights

**Backend:**
- Node.js + Express.js
- OpenWeather API integration
- Google Generative AI SDK
- Environment variables for secure API key management

## Installation & Setup 🚀

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- OpenWeather API Key (free tier available)
- Google Gemini API Key (free tier available)

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/tushaaaaaarr/mausamlive.git
   cd mausamlive
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file in root directory**
   ```env
   OPENWEATHER_API_KEY=your_openweather_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3000
   ```

4. **Get API Keys**
   - **OpenWeather**: https://openweathermap.org/api (Free tier includes current weather, 5-day forecast, and Air Pollution API)
   - **Google Gemini**: https://ai.google.dev/ (Free tier available)

5. **Start the server**
   ```bash
   npm start
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

## Project Structure 📁

```
mausamlive/
├── public/
│   ├── index.html          # Main HTML file
│   └── src/
│       ├── css/
│       │   └── style.css   # Styling
│       ├── js/
│       │   ├── script.js   # Main app logic
│       │   └── aiManager.js # AI integration
│       └── svg/            # Icons and assets
├── controllers/
│   ├── aiController.js     # AI API routes (Gemini)
│   ├── weatherController.js # Weather data handling
│   ├── geocodeController.js # Location search
│   └── forecastController.js # Forecast processing
├── routes/
│   └── api.js             # API route definitions
├── server.js              # Express server setup
├── .env                   # Environment variables (create this)
└── package.json           # Dependencies
```

## API Endpoints 🔌

### Weather APIs
- `GET /api/weather?city=London` - Current weather & AQI
- `GET /api/forecast?lat=51.5074&lon=-0.1278` - 5-day forecast
- `GET /api/geocode?query=London` - Location search

### AI APIs (Gemini)
- `GET /api/ai/summary` - AI weather summary
- `GET /api/ai/activities` - Activity recommendations
- `GET /api/ai/health-advisory` - Health & safety recommendations
- `POST /api/ai/travel-tips` - Travel advice

## How AI Features Work 🧠

### 1. **Weather Summary**
The AI analyzes current weather data and generates:
- Natural language weather descriptions
- What to wear recommendations
- Air quality impact assessment
- Practical safety tips

### 2. **Health Advisory**
Based on temperature, humidity, wind speed, and AQI, the AI provides:
- Temperature-related precautions
- Respiratory safety guidance
- Activity level recommendations
- Special precautions for vulnerable groups
- Medical alert symptoms

### 3. **Activity Recommendations**
The AI suggests 5 activities with:
- Why it's suitable for current conditions
- Recommended duration
- Specific precautions to take
- AQI considerations

### 4. **Air Quality Analysis**
- Uses EPA breakpoint formula for accurate AQI calculation
- Considers both PM2.5 and PM10 pollutants
- Takes the maximum AQI value (EPA standard)
- Provides health impact assessment

## Features in Detail 📋

### 🎯 Smart Location Memory
- App remembers your last searched location
- Persists across browser refreshes
- Easy override with new searches

### 📊 Detailed AQI Information
```
AQI Scale:
0-50      → Good (Green)
51-100    → Moderate (Yellow)
101-150   → Unhealthy for Sensitive Groups (Orange)
151-200   → Unhealthy (Red)
201-300   → Very Unhealthy (Purple)
301+      → Hazardous (Maroon)
```

### 🌡️ Unit Support
- **Metric**: °C, m/s, km
- **Imperial**: °F, mph, miles
- Toggle anytime without losing data

### 🌓 Theme Support
- **Light Mode**: Clean, bright interface
- **Dark Mode**: Eye-friendly dark theme
- Respects system preferences
- Smooth transitions

## Error Handling ✅

The app gracefully handles:
- ❌ Invalid API keys → Clear error messages
- ❌ API quota exceeded → Falls back to smart default responses
- ❌ Network errors → Retry mechanism
- ❌ Invalid locations → Helpful search suggestions
- ❌ Missing HTML elements → Safe null checks

## Browser Support 🌐

- ✅ Chrome/Chromium (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers

## Performance 🚀

- **Optimized API calls** - Efficient data fetching
- **Fallback mechanisms** - Works even when API quota is exceeded
- **Local storage** - Minimizes unnecessary requests
- **Fast loading** - ~2-3 seconds initial load
- **Responsive** - Smooth interactions on all devices

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

## Future Enhancements 🔮

- [ ] Weather alerts and notifications
- [ ] Historical weather data
- [ ] Air pollution heatmap
- [ ] Multi-language support
- [ ] Weather comparison between cities
- [ ] Export weather data to PDF
- [ ] Integration with calendar for event planning

## Troubleshooting 🔧

**Issue: "Cannot set properties of null" error**
- Solution: Ensure all HTML elements in index.html are properly created

**Issue: API returns 429 (Quota Exceeded)**
- Solution: App automatically falls back to smart default responses
- Wait for quota to reset (usually 1 minute for free tier)

**Issue: Location not being remembered**
- Solution: Check if browser allows localStorage
- Clear browser cache and reload

**Issue: Weather icon not showing**
- Solution: Ensure placeholder.svg exists in public/src/svg/

## License 📄

This project is open source and available under the MIT License.

## Contact & Support 📧

- **GitHub**: https://github.com/tushaaaaaarr/mausamlive
- **Issues**: Please report bugs on GitHub Issues
- **Suggestions**: Open a discussion or pull request

## Acknowledgments 🙏

- **OpenWeather API** - For reliable weather data
- **Google Gemini API** - For powerful AI insights
- **Inter Font** - For beautiful typography

---

**Made with ❤️ by Tushar**

Give it a ⭐ if you find it helpful!