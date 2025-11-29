let currentLocation = {}
let forecastData = {}
let currentDisplayMode = "all"
let currentSelectedDay = 0
let currentUnit = localStorage.getItem("clim8_unit") || "metric"
let currentTimezoneOffset = 0 
let locationButtonActive = false
const iconMapping = {
  "01d": "clear-day.svg",
  "01n": "clear-night.svg",
  "02d": "partly-cloudy-day.svg",
  "02n": "partly-cloudy-night.svg",
  "03d": "cloudy.svg",
  "03n": "cloudy.svg",
  "04d": "overcast-day.svg",
  "04n": "overcast-night.svg",
  "09d": "overcast-day-rain.svg",
  "09n": "overcast-night-rain.svg",
  "10d": "partly-cloudy-day-rain.svg",
  "10n": "partly-cloudy-night-rain.svg",
  "11d": "thunderstorms-day.svg",
  "11n": "thunderstorms-night.svg",
  "13d": "partly-cloudy-day-snow.svg",
  "13n": "partly-cloudy-night-snow.svg",
  "50d": "fog-day.svg",
  "50n": "fog-night.svg",
}
const getIconUrl = (iconCode) => {
  const svgFileName = iconMapping[iconCode] || "not-available.svg"
  return `src/svg/${svgFileName}`
}
const windDescriptions = [
  { max: 0.2, text: "Calm" },
  { max: 1.5, text: "Light Air" },
  { max: 3.3, text: "Light Breeze" },
  { max: 5.4, text: "Gentle Breeze" },
  { max: 7.9, text: "Moderate Breeze" },
  { max: 10.7, text: "Fresh Breeze" },
  { max: 13.8, text: "Strong Breeze" },
  { max: 17.1, text: "Near Gale" },
  { max: 20.7, text: "Gale" },
  { max: 24.4, text: "Strong Gale" },
  { max: 28.4, text: "Storm" },
  { max: 32.6, text: "Violent Storm" },
  { max: Number.POSITIVE_INFINITY, text: "Hurricane" },
]
const fallbackCities = [
  { name: "London", country: "GB", lat: 51.5074, lon: -0.1278 },
  { name: "New York", country: "US", lat: 40.7128, lon: -74.006 },
  { name: "Tokyo", country: "JP", lat: 35.6762, lon: 139.6503 },
  { name: "Paris", country: "FR", lat: 48.8566, lon: 2.3522 },
  { name: "Sydney", country: "AU", lat: -33.8688, lon: 151.2093 },
]
function getLocationTime(timestamp) {
  const utcDate = new Date(timestamp * 1000);
  const browserOffset = new Date().getTimezoneOffset() * 60;
  const finalTimestamp = timestamp + currentTimezoneOffset + browserOffset;
  return new Date(finalTimestamp * 1000);
}
function setLoadingPlaceholders() {
  document.getElementById("current-temp").textContent = "--°"
  document.getElementById("feels-like").textContent = "Feels like --°"
  document.getElementById("weather-description").textContent = "--"
  document.getElementById("wind-description").textContent = "--"
  document.getElementById("wind-speed").textContent = "--"
  document.getElementById("humidity").textContent = "--"
  document.getElementById("pressure").textContent = "--"
  document.getElementById("visibility").textContent = "--"
  document.getElementById("sunrise").textContent = "--:--"
  document.getElementById("sunset").textContent = "--:--"
  document.getElementById("weather-icon-placeholder").style.display = "flex"
  document.getElementById("weather-icon").classList.add("hidden")
}
function requestLocation() {
  document.getElementById("loading").style.display = "block"
  document.getElementById("error-message").style.display = "none"
  document.getElementById("search-error").style.display = "none"
  setLoadingPlaceholders()
  locationButtonActive = true
  updateLocationButton()
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lon = position.coords.longitude
        currentLocation = { lat, lon }
        getWeatherData(lat, lon)
        getForecastData(lat, lon)
      },
      (error) => {
        console.error("Error getting location:", error)
        const fallbackLocation = getFallbackLocation()
        currentLocation = { lat: fallbackLocation.lat, lon: fallbackLocation.lon }
        document.getElementById("error-message").style.display = "block"
        getWeatherData(fallbackLocation.lat, fallbackLocation.lon)
        getForecastData(fallbackLocation.lat, fallbackLocation.lon)
        locationButtonActive = false
        updateLocationButton()
      },
    )
  } else {
    const fallbackLocation = getFallbackLocation()
    currentLocation = { lat: fallbackLocation.lat, lon: fallbackLocation.lon }
    document.getElementById("error-message").style.display = "block"
    getWeatherData(fallbackLocation.lat, fallbackLocation.lon)
    getForecastData(fallbackLocation.lat, fallbackLocation.lon)
    locationButtonActive = false
    updateLocationButton()
  }
}
function updateLocationButton() {
  const locationBtn = document.getElementById("location-btn")
  if (locationButtonActive) {
    locationBtn.classList.remove("btn-outline")
    locationBtn.classList.add("btn-active")
  } else {
    locationBtn.classList.remove("btn-active")
    locationBtn.classList.add("btn-outline")
  }
}
document.addEventListener("DOMContentLoaded", () => {
  setLoadingPlaceholders()
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.body.classList.add("dark-mode")
    document.getElementById("dark-btn").classList.add("btn-active")
    document.getElementById("light-btn").classList.add("btn-outline")
  } else {
    document.getElementById("light-btn").classList.add("btn-active")
    document.getElementById("dark-btn").classList.add("btn-outline")
  }
  document.getElementById("light-btn").addEventListener("click", () => {
    document.body.classList.remove("dark-mode")
    document.getElementById("light-btn").classList.remove("btn-outline")
    document.getElementById("light-btn").classList.add("btn-active")
    document.getElementById("dark-btn").classList.remove("btn-active")
    document.getElementById("dark-btn").classList.add("btn-outline")
  })
  document.getElementById("dark-btn").addEventListener("click", () => {
    document.body.classList.add("dark-mode")
    document.getElementById("dark-btn").classList.remove("btn-outline")
    document.getElementById("dark-btn").classList.add("btn-active")
    document.getElementById("light-btn").classList.remove("btn-active")
    document.getElementById("light-btn").classList.add("btn-outline")
  })
  document.getElementById("location-btn").classList.add("btn-outline")
  document.getElementById("location-btn").addEventListener("click", requestLocation)
  document.getElementById("metric-btn").addEventListener("click", () => {
    if (currentUnit !== "metric") {
      currentUnit = "metric"
      localStorage.setItem("clim8_unit", "metric")
      updateUnitButtons()
      refreshWeatherData()
    }
  })
  document.getElementById("imperial-btn").addEventListener("click", () => {
    if (currentUnit !== "imperial") {
      currentUnit = "imperial"
      localStorage.setItem("clim8_unit", "imperial")
      updateUnitButtons()
      refreshWeatherData()
    }
  })
  updateUnitButtons()
  document.getElementById("search-input").addEventListener("input", () => {
    locationButtonActive = false
    updateLocationButton()
  })
  
  // Check if there's a saved location in localStorage, otherwise use geolocation
  const savedLocation = localStorage.getItem("clim8_lastLocation");
  const savedLocationName = localStorage.getItem("clim8_lastLocationName");
  
  if (savedLocation) {
    // Restore last searched location
    const { lat, lon } = JSON.parse(savedLocation);
    currentLocation = { lat, lon };
    if (savedLocationName) {
      document.getElementById("search-input").value = savedLocationName;
    }
    document.getElementById("loading").style.display = "block";
    getWeatherData(lat, lon);
    getForecastData(lat, lon);
    locationButtonActive = false;
    updateLocationButton();
  } else {
    // Use geolocation as fallback
    requestLocation();
  }
  
  setupSearch()
})
function updateUnitButtons() {
  const metricBtn = document.getElementById("metric-btn")
  const imperialBtn = document.getElementById("imperial-btn")
  if (currentUnit === "metric") {
    metricBtn.classList.remove("btn-outline")
    metricBtn.classList.add("btn-active")
    imperialBtn.classList.remove("btn-active")
    imperialBtn.classList.add("btn-outline")
  } else {
    metricBtn.classList.remove("btn-active")
    metricBtn.classList.add("btn-outline")
    imperialBtn.classList.remove("btn-outline")
    imperialBtn.classList.add("btn-active")
  }
}
function refreshWeatherData() {
  if (currentLocation.lat && currentLocation.lon) {
    getWeatherData(currentLocation.lat, currentLocation.lon)
    getForecastData(currentLocation.lat, currentLocation.lon)
  }
}
function getFallbackLocation() {
  return fallbackCities[Math.floor(Math.random() * fallbackCities.length)]
}
function setupSearch() {
  const searchInput = document.getElementById("search-input")
  const suggestionsContainer = document.getElementById("suggestions")
  const searchError = document.getElementById("search-error")
  let timeoutId
  searchInput.addEventListener("input", () => {
    clearTimeout(timeoutId)
    const query = searchInput.value.trim()
    if (query.length < 2) {
      suggestionsContainer.style.display = "none"
      searchError.style.display = "none"
      return
    }
    timeoutId = setTimeout(() => {
      fetch(`/api/geocode?q=${query}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.length > 0) {
            suggestionsContainer.innerHTML = ""
            data.forEach((item) => {
              const suggestion = document.createElement("div")
              suggestion.className = "suggestion-item"
              suggestion.textContent = `${item.name}, ${item.country}`
              suggestion.addEventListener("click", () => {
                const locationName = `${item.name}, ${item.country}`
                searchInput.value = locationName
                suggestionsContainer.style.display = "none"
                searchError.style.display = "none"
                currentLocation = { lat: item.lat, lon: item.lon }
                
                // Save location to localStorage
                localStorage.setItem("clim8_lastLocation", JSON.stringify({ lat: item.lat, lon: item.lon }))
                localStorage.setItem("clim8_lastLocationName", locationName)
                
                document.getElementById("loading").style.display = "block"
                setLoadingPlaceholders()
                locationButtonActive = false
                updateLocationButton()
                getWeatherData(item.lat, item.lon)
                getForecastData(item.lat, item.lon)
              })
              suggestionsContainer.appendChild(suggestion)
            })
            suggestionsContainer.style.display = "block"
            searchError.style.display = "none"
          } else {
            suggestionsContainer.style.display = "none"
            searchError.style.display = "block"
          }
        })
        .catch((error) => {
          console.error("Error fetching suggestions:", error)
          suggestionsContainer.style.display = "none"
          searchError.style.display = "block"
        })
    }, 300)
  })
  document.addEventListener("click", (e) => {
    if (e.target !== searchInput) {
      suggestionsContainer.style.display = "none"
    }
  })
}
function getWeatherData(lat, lon) {
  document.getElementById("loading").style.display = "block"
  document.getElementById("error-message").style.display = "none"
  document.getElementById("search-error").style.display = "none"
  fetch(`/api/weather?lat=${lat}&lon=${lon}&units=${currentUnit}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      return response.json()
    })
    .then((data) => {
      currentTimezoneOffset = data.timezone 
      updateCurrentWeather(data)
      document.getElementById("loading").style.display = "none"
    })
    .catch((error) => {
      console.error("Error fetching weather data:", error)
      document.getElementById("error-message").style.display = "block"
      document.getElementById("loading").style.display = "none"
    })
}
function getForecastData(lat, lon) {
  fetch(`/api/forecast?lat=${lat}&lon=${lon}&units=${currentUnit}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      return response.json()
    })
    .then((data) => {
      forecastData = data
      updateDayButtons()
      updateForecast()
    })
    .catch((error) => {
      console.error("Error fetching forecast data:", error)
    })
}
function getWindDescription(speed) {
  const speedInMps = currentUnit === "imperial" ? speed / 2.237 : speed
  for (const desc of windDescriptions) {
    if (speedInMps <= desc.max) {
      return desc.text
    }
  }
  return "Hurricane"
}
function createDayForecastElement(date, dayForecasts, minTemp, maxTemp, isToday, tempUnit) {
  const forecastContainer = document.getElementById("forecast-days")
  const dayElement = document.createElement("div")
  dayElement.className = "forecast-day"
  const dayHeader = document.createElement("div")
  dayHeader.className = "day-header"
  const dateElement = document.createElement("div")
  dateElement.className = "forecast-date"
  dateElement.textContent = date
  const dayTemps = document.createElement("div")
  dayTemps.className = "day-temps"
  dayTemps.innerHTML = `
    <span class="hour-temp-max">${Math.round(maxTemp)}${tempUnit}</span>
    <span class="hour-temp-min">${Math.round(minTemp)}${tempUnit}</span>
  `
  dayHeader.appendChild(dateElement)
  dayHeader.appendChild(dayTemps)
  dayElement.appendChild(dayHeader)
  const hoursContainer = document.createElement("div")
  hoursContainer.className = "forecast-hours"
  dayForecasts.forEach((forecast) => {
    const hourTime = getLocationTime(forecast.dt)
    const hourElement = document.createElement("div")
    hourElement.className = "forecast-hour"
    const iconUrl = getIconUrl(forecast.weather[0].icon)
    hourElement.innerHTML = `
            <div class="hour-time">${hourTime.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}</div>
            <img class="hour-icon" src="${iconUrl}" alt="${forecast.weather[0].description}" width="50" height="50">
            <div class="hour-description">${forecast.weather[0].description}</div>
            <div class="hour-temps">
                <span class="hour-temp">${Math.round(forecast.main.temp)}${tempUnit}</span>
            </div>
        `
    hoursContainer.appendChild(hourElement)
  })
  dayElement.appendChild(hoursContainer)
  forecastContainer.appendChild(dayElement)
}
function updateCurrentWeather(data) {
  const locationName = data.name || "Unknown Location"
  const country = data.sys?.country || ""
  document.getElementById("location-name").textContent = country ? `${locationName}, ${country}` : locationName
  const locationTime = getLocationTime(data.dt)
  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
  document.getElementById("current-date").textContent = locationTime.toLocaleDateString("en-US", options)
  const tempUnit = currentUnit === "metric" ? "°C" : "°F"
  document.getElementById("current-temp").textContent = `${Math.round(data.main.temp)}${tempUnit}`
  document.getElementById("feels-like").textContent = `Feels like ${Math.round(data.main.feels_like)}${tempUnit}`
  document.getElementById("weather-description").textContent = data.weather[0].description
  const windDesc = getWindDescription(data.wind.speed)
  document.getElementById("wind-description").textContent = windDesc
  const iconCode = data.weather[0].icon
  const weatherIcon = document.getElementById("weather-icon")
  weatherIcon.src = getIconUrl(iconCode)
  weatherIcon.alt = data.weather[0].description
  document.getElementById("weather-icon-placeholder").style.display = "none"
  weatherIcon.classList.remove("hidden")
  const speedUnit = currentUnit === "metric" ? "m/s" : "mph"
  const speedValue = currentUnit === "metric" ? data.wind.speed : (data.wind.speed * 2.237).toFixed(1)
  document.getElementById("wind-speed").textContent = `${speedValue} ${speedUnit}`
  document.getElementById("humidity").textContent = `${data.main.humidity}%`
  document.getElementById("pressure").textContent = `${data.main.pressure} hPa`
  const visibilityUnit = currentUnit === "metric" ? "km" : "miles"
  const visibilityValue =
    currentUnit === "metric" ? (data.visibility / 1000).toFixed(1) : (data.visibility / 1609).toFixed(1)
  document.getElementById("visibility").textContent = `${visibilityValue} ${visibilityUnit}`
  
  // Display AQI with exact numeric value and label using proper formula
  if (data.aqi?.list?.[0]) {
    const components = data.aqi.list[0].components;
    const pm25 = components?.pm2_5 || 0;
    const pm10 = components?.pm10 || 0;
    
    // AQI Breakpoint Tables
    const breakpointsPM25 = [
      { BLo: 0, BHi: 12, ILo: 0, IHi: 50, label: "Good", color: "#2ecc71" },
      { BLo: 12.1, BHi: 35.4, ILo: 51, IHi: 100, label: "Moderate", color: "#f1c40f" },
      { BLo: 35.5, BHi: 55.4, ILo: 101, IHi: 150, label: "Unhealthy for Sensitive Groups", color: "#e67e22" },
      { BLo: 55.5, BHi: 150.4, ILo: 151, IHi: 200, label: "Unhealthy", color: "#e74c3c" },
      { BLo: 150.5, BHi: 250.4, ILo: 201, IHi: 300, label: "Very Unhealthy", color: "#9b59b6" },
      { BLo: 250.5, BHi: Infinity, ILo: 301, IHi: 500, label: "Hazardous", color: "#8b0000" }
    ];
    
    const breakpointsPM10 = [
      { BLo: 0, BHi: 54, ILo: 0, IHi: 50, label: "Good", color: "#2ecc71" },
      { BLo: 55, BHi: 154, ILo: 51, IHi: 100, label: "Moderate", color: "#f1c40f" },
      { BLo: 155, BHi: 254, ILo: 101, IHi: 150, label: "Unhealthy for Sensitive Groups", color: "#e67e22" },
      { BLo: 255, BHi: 354, ILo: 151, IHi: 200, label: "Unhealthy", color: "#e74c3c" },
      { BLo: 355, BHi: 424, ILo: 201, IHi: 300, label: "Very Unhealthy", color: "#9b59b6" },
      { BLo: 425, BHi: Infinity, ILo: 301, IHi: 500, label: "Hazardous", color: "#8b0000" }
    ];
    
    // Function to calculate AQI for a pollutant
    const calculateAQI = (concentration, breakpoints) => {
      let breakpoint = breakpoints[0];
      for (let bp of breakpoints) {
        if (concentration >= bp.BLo && concentration <= bp.BHi) {
          breakpoint = bp;
          break;
        }
      }
      const aqi = Math.round(
        ((breakpoint.IHi - breakpoint.ILo) / (breakpoint.BHi - breakpoint.BLo)) * 
        (concentration - breakpoint.BLo) + breakpoint.ILo
      );
      return { aqi, breakpoint };
    };
    
    // Calculate AQI for both PM2.5 and PM10
    const aqiPM25 = calculateAQI(pm25, breakpointsPM25);
    const aqiPM10 = calculateAQI(pm10, breakpointsPM10);
    
    // Use the maximum AQI (EPA standard approach)
    let finalAQI, finalBreakpoint;
    if (aqiPM25.aqi >= aqiPM10.aqi) {
      finalAQI = aqiPM25.aqi;
      finalBreakpoint = aqiPM25.breakpoint;
    } else {
      finalAQI = aqiPM10.aqi;
      finalBreakpoint = aqiPM10.breakpoint;
    }
    
    document.getElementById("aqi").textContent = `${finalAQI} - ${finalBreakpoint.label}`;
    document.getElementById("aqi").style.color = finalBreakpoint.color;
  } else {
    document.getElementById("aqi").textContent = "--"
  }
  
  if (data.sys?.sunrise) {
    const sunriseTime = getLocationTime(data.sys.sunrise)
    document.getElementById("sunrise").textContent = sunriseTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  } else {
    document.getElementById("sunrise").textContent = "--:--"
  }
  if (data.sys?.sunset) {
    const sunsetTime = getLocationTime(data.sys.sunset)
    document.getElementById("sunset").textContent = sunsetTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  } else {
    document.getElementById("sunset").textContent = "--:--"
  }

  // Trigger AI insights
  const triggerAIInsights = () => {
    if (typeof aiWeatherManager !== 'undefined') {
      console.log('AI Manager available, triggering insights...');
      const temp = Math.round(data.main.temp)
      const condition = data.weather[0].description
      const humidity = data.main.humidity
      const windSpeed = data.wind.speed
      const feelsLike = Math.round(data.main.feels_like)
      
      // Extract AQI data if available
      let aqi = null;
      let aqiLabel = null;
      let pm25 = null;
      let pm10 = null;
      
      if (data.aqi?.list?.[0]) {
        const components = data.aqi.list[0].components;
        pm25 = components?.pm2_5 || 0;
        pm10 = components?.pm10 || 0;
        
        // Get the AQI value and label from the DOM display
        const aqiElement = document.getElementById("aqi").textContent;
        if (aqiElement && aqiElement !== "--") {
          const parts = aqiElement.split(" - ");
          aqi = parseInt(parts[0]);
          aqiLabel = parts[1] || null;
        }
      }

      // Call all AI functions with AQI data
      aiWeatherManager.displayWeatherSummary(locationName, temp, condition, humidity, windSpeed, feelsLike, aqi, aqiLabel, pm25, pm10)
      aiWeatherManager.displayHealthAdvisory(temp, condition, humidity, windSpeed, aqi, aqiLabel, pm25, pm10)
      aiWeatherManager.displayActivities(temp, condition, windSpeed, humidity, aqi, aqiLabel)
    } else {
      console.warn('AI Manager not available');
    }
  }

  // Try immediately, or wait a bit if not ready
  if (typeof aiWeatherManager !== 'undefined') {
    triggerAIInsights();
  } else {
    setTimeout(triggerAIInsights, 100);
  }
}
function updateDayButtons() {
  if (!forecastData || !forecastData.list) return;
  const dayButtonsContainer = document.getElementById("day-buttons");
  dayButtonsContainer.innerHTML = "";
  const dailyForecasts = {};
  const now = getLocationTime(Math.floor(Date.now() / 1000));
  now.setMinutes(0, 0, 0);
  forecastData.list.forEach((forecast) => {
    const date = getLocationTime(forecast.dt);
    const dateString = date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
    const isToday = date.toDateString() === now.toDateString();
    if (!isToday) {
      if (!dailyForecasts[dateString]) {
        dailyForecasts[dateString] = {
          forecasts: [],
          minTemp: Number.POSITIVE_INFINITY,
          maxTemp: Number.NEGATIVE_INFINITY,
          firstForecastTime: date
        };
      }
      dailyForecasts[dateString].forecasts.push(forecast);
      dailyForecasts[dateString].minTemp = Math.min(dailyForecasts[dateString].minTemp, forecast.main.temp_min);
      dailyForecasts[dateString].maxTemp = Math.max(dailyForecasts[dateString].maxTemp, forecast.main.temp_max);
    }
  });
  const forecastDates = Object.keys(dailyForecasts);
  const allButton = document.createElement("button");
  allButton.className = `btn ${currentDisplayMode === "all" ? "btn-active" : "btn-outline"}`;
  allButton.textContent = "All Days";
  allButton.addEventListener("click", () => {
    currentDisplayMode = "all";
    updateForecast();
    updateDayButtons();
  });
  dayButtonsContainer.appendChild(allButton);
  forecastDates.forEach((date, index) => {
    const dayButton = document.createElement("button");
    dayButton.className = `btn ${currentDisplayMode === "day" && currentSelectedDay === index ? "btn-active" : "btn-outline"}`;
    const forecastDate = dailyForecasts[date].firstForecastTime;
    const shortDate = forecastDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    dayButton.textContent = shortDate;
    dayButton.addEventListener("click", () => {
      currentDisplayMode = "day";
      currentSelectedDay = index;
      updateForecast();
      updateDayButtons();
    });
    dayButtonsContainer.appendChild(dayButton);
  });
}
function updateTodayForecast() {
  if (!forecastData || !forecastData.list) return;
  const todayHoursContainer = document.getElementById("today-hours");
  if (!todayHoursContainer) return;
  todayHoursContainer.innerHTML = "";
  const now = getLocationTime(Math.floor(Date.now() / 1000));
  const currentHour = now.getHours();
  now.setMinutes(0, 0, 0);
  let todayForecasts = forecastData.list.filter(forecast => {
    const forecastDate = getLocationTime(forecast.dt);
    return forecastDate.toDateString() === now.toDateString();
  });
  if (todayForecasts.length === 0) {
    const sortedForecasts = [...forecastData.list].sort((a, b) => b.dt - a.dt);
    const lastForecast = sortedForecasts.find(forecast => {
      const forecastDate = getLocationTime(forecast.dt);
      return forecastDate <= now;
    });
    if (lastForecast) {
      todayForecasts = [lastForecast];
    }
  }
  todayForecasts.forEach(forecast => {
    const hourElement = document.createElement("div");
    const forecastTime = getLocationTime(forecast.dt);
    const forecastHour = forecastTime.getHours();
    hourElement.className = `timeline-hour ${forecastHour === currentHour ? 'current' : ''}`;
    const iconUrl = getIconUrl(forecast.weather[0].icon);
    const tempUnit = currentUnit === "metric" ? "°C" : "°F";
    hourElement.innerHTML = `
      <div class="hour-time">${forecastTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })}</div>
      <img class="hour-icon" src="${iconUrl}" alt="${forecast.weather[0].description}" width="32" height="32">
      <div class="hour-description">${forecast.weather[0].description}</div>
      <div class="hour-temp">${Math.round(forecast.main.temp)}${tempUnit}</div>
    `;
    todayHoursContainer.appendChild(hourElement);
  });
  const currentHourElement = todayHoursContainer.querySelector('.current');
  if (currentHourElement) {
    todayHoursContainer.scrollLeft = currentHourElement.offsetLeft - todayHoursContainer.offsetWidth / 2 + currentHourElement.offsetWidth / 2;
  }
}
function updateForecast() {
  if (!forecastData || !forecastData.list) return;
  updateTodayForecast();
  const forecastContainer = document.getElementById("forecast-days");
  forecastContainer.innerHTML = "";
  const dailyForecasts = {};
  const now = getLocationTime(Math.floor(Date.now() / 1000));
  now.setMinutes(0, 0, 0);
  forecastData.list.forEach((forecast) => {
    const date = getLocationTime(forecast.dt);
    const dateString = date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
    const isToday = date.toDateString() === now.toDateString();
    if (!isToday) {
      if (!dailyForecasts[dateString]) {
        dailyForecasts[dateString] = {
          forecasts: [],
          minTemp: Number.POSITIVE_INFINITY,
          maxTemp: Number.NEGATIVE_INFINITY,
          firstForecastTime: date
        };
      }
      dailyForecasts[dateString].forecasts.push(forecast);
      dailyForecasts[dateString].minTemp = Math.min(dailyForecasts[dateString].minTemp, forecast.main.temp_min);
      dailyForecasts[dateString].maxTemp = Math.max(dailyForecasts[dateString].maxTemp, forecast.main.temp_max);
    }
  });
  const forecastDates = Object.keys(dailyForecasts);
  const tempUnit = currentUnit === "metric" ? "°C" : "°F";
  if (currentDisplayMode === "all") {
    forecastDates.forEach((date) => {
      createDayForecastElement(
        date,
        dailyForecasts[date].forecasts,
        dailyForecasts[date].minTemp,
        dailyForecasts[date].maxTemp,
        false,
        tempUnit
      );
    });
  } else if (currentDisplayMode === "day" && forecastDates[currentSelectedDay]) {
    const selectedDate = forecastDates[currentSelectedDay];
    createDayForecastElement(
      selectedDate,
      dailyForecasts[selectedDate].forecasts,
      dailyForecasts[selectedDate].minTemp,
      dailyForecasts[selectedDate].maxTemp,
      false,
      tempUnit
    );
  }
}
