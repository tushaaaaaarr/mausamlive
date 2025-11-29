const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Try to get the first available model, default to gemini-2.0-flash-exp
let MODEL_NAME = "gemini-2.0-flash-exp";

// Function to find available model
async function findAvailableModel() {
  try {
    const models = await genAI.listModels();
    for (const model of models.models) {
      if (model.name.includes("generateContent")) {
        console.log("Found available model:", model.name);
        return model.name.split("/").pop();
      }
    }
  } catch (e) {
    console.log("Could not list models, using default");
  }
  return MODEL_NAME;
}

// Initialize model on startup
findAvailableModel().then(model => {
  MODEL_NAME = model;
  console.log("Using AI Model:", MODEL_NAME);
});

// Generate a friendly weather summary with AQI insights
async function generateWeatherSummary(req, res) {
  const { city, temp, condition, humidity, windSpeed, feelsLike, aqi, aqiLabel, pm25, pm10 } = req.query;

  if (!city || !temp || !condition) {
    return res.status(400).json({ error: "Missing required weather parameters" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    let aqiContext = '';
    if (aqi) {
      aqiContext = `Air Quality Index (AQI): ${aqi} (${aqiLabel}). PM2.5: ${pm25} µg/m³, PM10: ${pm10} µg/m³.`;
    }

    const prompt = `Generate a concise weather summary in this exact format:

**Current Conditions:** [1 sentence describing the weather in ${city}]

**How It Feels:** [1 sentence about what to wear and comfort level]

**Air Quality Impact:** ${aqi ? `[1 sentence about ${aqiLabel} air quality (AQI ${aqi}) and outdoor recommendations]` : '[1 sentence activity recommendation]'}

**Quick Tip:** [1 practical safety or comfort tip]

Data: ${temp}°C (feels ${feelsLike}°C), ${condition}, Humidity ${humidity}%, Wind ${windSpeed} m/s${aqiContext ? ` | ${aqiContext}` : ''}`;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    res.json({ summary });
  } catch (error) {
    console.error("AI Summary Error:", error);
    
    // Fallback response when quota is exceeded
    if (error.status === 429) {
      let fallbackSummary = `In ${city}, expect ${condition} conditions with a temperature of ${temp}°C (feels like ${feelsLike}°C). With ${humidity}% humidity and wind speeds of ${windSpeed} m/s, dress appropriately for the conditions.`;
      if (aqi) {
        fallbackSummary += ` Air quality is ${aqiLabel} (AQI: ${aqi}), so consider wearing a mask if you have respiratory issues and limit prolonged outdoor exposure.`;
      }
      return res.json({ summary: fallbackSummary });
    }
    
    res.status(500).json({ error: "Failed to generate weather summary" });
  }
}

// Get activity recommendations based on weather and AQI
async function getActivityRecommendations(req, res) {
  const { temp, condition, windSpeed, humidity, aqi, aqiLabel } = req.query;

  if (!temp || !condition) {
    return res.status(400).json({ error: "Missing required weather parameters" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    let aqiContext = '';
    if (aqi) {
      aqiContext = `\nAir Quality Index (AQI): ${aqi} (${aqiLabel}). Consider indoor or low-exertion activities if AQI is high.`;
    }

    const prompt = `Suggest 5 activities for Temperature ${temp}°C, ${condition}, Wind ${windSpeed} m/s, Humidity ${humidity}%${aqiContext}

Return ONLY valid JSON array. Each object must have exactly these 4 properties:
{
  "activity": "Activity Name",
  "reason": "Why it's suitable (mention AQI if relevant)",
  "duration": "30-45 minutes",
  "precautions": "Specific safety tip"
}

Example format:
[
  {"activity": "Walking", "reason": "Low-impact exercise suitable for current conditions", "duration": "30-45 min", "precautions": "Wear sunscreen"},
  ...
]

No markdown, no code blocks, only JSON array.`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    
    // Clean up the response to extract JSON
    text = text.replace(/```json\n?|\n?```/g, '').replace(/```\n?/g, '').trim();
    
    let activities;
    try {
      activities = JSON.parse(text);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError, "Text:", text);
      // Return formatted activities as fallback
      activities = [
        { activity: "Outdoor Walking", reason: "Good for light exercise and fresh air", duration: "30-45 minutes", precautions: "Wear sunscreen and stay hydrated" },
        { activity: "Cycling", reason: "Enjoy the weather and get exercise", duration: "45-60 minutes", precautions: "Wear helmet and stay visible" },
        { activity: "Picnic", reason: "Perfect outdoor meal with friends or family", duration: "1-2 hours", precautions: "Check weather and bring water" },
        { activity: "Jogging", reason: "Great cardio workout and fresh air", duration: "30-45 minutes", precautions: "Warm up properly and wear appropriate shoes" },
        { activity: "Photography", reason: "Capture nature and weather", duration: "1-2 hours", precautions: "Protect your equipment from weather" }
      ];
    }

    res.json({ activities });
  } catch (error) {
    console.error("AI Activities Error:", error);
    
    // Fallback response when quota is exceeded
    if (error.status === 429) {
      const fallbackActivities = [
        { activity: "Walking", reason: "Simple and healthy outdoor activity", duration: "30-45 minutes", precautions: "Dress appropriately for temperature" },
        { activity: "Jogging", reason: "Great for fitness and fresh air", duration: "30-45 minutes", precautions: "Warm up before and cool down after" },
        { activity: "Photography", reason: "Capture the weather and scenery", duration: "1-2 hours", precautions: "Protect equipment from weather elements" },
        { activity: "Outdoor Meditation", reason: "Peaceful and relaxing", duration: "20-30 minutes", precautions: "Find a comfortable spot away from traffic" },
        { activity: "Casual Sports", reason: "Basketball, tennis, or football", duration: "45-60 minutes", precautions: "Stay hydrated and use proper equipment" }
      ];
      return res.json({ activities: fallbackActivities });
    }
    
    res.status(500).json({ error: "Failed to generate activity recommendations" });
  }
}

// Get health and safety recommendations based on weather and AQI
async function getHealthAdvisory(req, res) {
  const { temp, condition, humidity, windSpeed, aqi, aqiLabel, pm25, pm10 } = req.query;

  if (!temp || !condition) {
    return res.status(400).json({ error: "Missing required weather parameters" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    let aqiContext = '';
    if (aqi) {
      aqiContext = `\nAir Quality: AQI ${aqi} (${aqiLabel}) - PM2.5: ${pm25} µg/m³, PM10: ${pm10} µg/m³`;
    }

    const prompt = `Return ONLY a valid JSON object (no markdown, no code blocks, no extra text) with health and safety recommendations.

Return this exact JSON structure with concise, actionable bullet points:
{
  "temperatureAlert": {
    "title": "Temperature Impact",
    "points": [
      "specific advice for ${temp}°C",
      "what to wear",
      "activity adjustment needed"
    ]
  },
  "airQualityAlert": {
    "title": "Air Quality & Respiratory Safety",
    "points": [
      "N95 mask recommendation if AQI is high",
      "outdoor activity restriction level",
      "indoor air quality improvement"
    ]
  },
  "activityLevel": {
    "title": "Safe Activity Recommendations",
    "points": [
      "Overall activity safety level (light/moderate/restricted)",
      "specific activities to avoid if any",
      "best time to go outdoors if applicable"
    ]
  },
  "vulnerableGroups": {
    "title": "Special Precautions for Vulnerable Groups",
    "points": [
      "Elderly: specific action",
      "Children: specific action",
      "Asthma/Respiratory conditions: specific action"
    ]
  },
  "protectionTips": {
    "title": "Practical Protection Measures",
    "points": [
      "tip 1",
      "tip 2",
      "tip 3",
      "tip 4"
    ]
  },
  "medicalAlert": {
    "title": "When to Seek Medical Help",
    "points": [
      "symptom 1 requiring attention",
      "symptom 2 requiring attention",
      "emergency warning signs"
    ]
  }
}

Weather: ${temp}°C, ${condition}, Humidity ${humidity}%, Wind ${windSpeed} m/s${aqiContext}

Requirements:
- Each point must be 1 sentence max, starting with action verbs
- No extra formatting, symbols, or asterisks
- Make points practical and specific
- Consider ${aqi ? 'high AQI ' : ''}conditions in recommendations`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    
    // Clean up the response to extract JSON
    text = text.replace(/```json\n?|\n?```/g, '').replace(/```\n?/g, '').trim();
    
    let advisory;
    try {
      advisory = JSON.parse(text);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError, "Text:", text);
      // Return formatted advisory as fallback
      advisory = {
        temperatureAlert: {
          title: "Temperature Impact",
          points: [
            `At ${temp}°C, dress in layers for comfort and flexibility`,
            "Monitor your body temperature during outdoor activities",
            "Avoid prolonged sun exposure if temperature is high"
          ]
        },
        airQualityAlert: {
          title: "Air Quality & Respiratory Safety",
          points: [
            aqi ? `AQI ${aqi} (${aqiLabel}) - wear N95 mask when outdoors` : "Air quality is acceptable for outdoor activities",
            aqi ? "Limit strenuous outdoor activities" : "Enjoy outdoor activities safely",
            aqi ? "Use HEPA air purifier indoors" : "Ensure good ventilation in your home"
          ]
        },
        activityLevel: {
          title: "Safe Activity Recommendations",
          points: [
            aqi && aqi > 150 ? "Activity level: Restricted - avoid outdoor exertion" : "Activity level: Safe for most people",
            aqi && aqi > 100 ? "Avoid running, cycling, and strenuous sports" : "All outdoor activities are safe",
            "Best to be active during cooler parts of the day"
          ]
        },
        vulnerableGroups: {
          title: "Special Precautions for Vulnerable Groups",
          points: [
            "Elderly: Stay indoors with good ventilation; limit outdoor exposure",
            "Children: Keep indoors during high pollution; supervise outdoor time",
            "Asthma sufferers: Keep rescue inhaler accessible; monitor symptoms closely"
          ]
        },
        protectionTips: {
          title: "Practical Protection Measures",
          points: [
            aqi ? "Wear N95 or KN95 mask when outdoors" : "Apply sunscreen regularly",
            "Stay hydrated throughout the day",
            aqi ? "Use air purifier with HEPA filter indoors" : "Keep windows open for fresh air",
            "Avoid areas with heavy traffic or pollution sources"
          ]
        },
        medicalAlert: {
          title: "When to Seek Medical Help",
          points: [
            "Seek help if experiencing persistent coughing or wheezing",
            "Get medical attention for chest pain or difficulty breathing",
            "Contact doctor if you have dizziness, fainting, or severe headache"
          ]
        }
      };
    }

    res.json({ advisory });
  } catch (error) {
    console.error("AI Advisory Error:", error);
    
    // Fallback response when quota is exceeded
    if (error.status === 429) {
      const fallbackAdvisory = {
        temperatureAlert: {
          title: "Temperature Impact",
          points: [
            `At ${temp}°C, wear appropriate layers`,
            "Adjust activity level based on how you feel",
            "Stay in well-ventilated areas"
          ]
        },
        airQualityAlert: {
          title: "Air Quality & Respiratory Safety",
          points: [
            aqi ? `Air quality is ${aqiLabel} (AQI: ${aqi}) - limit outdoor time` : "Current air quality is acceptable",
            aqi ? "Wear N95 mask if going outdoors" : "No mask needed for air quality",
            aqi ? "Keep windows closed to reduce indoor pollution" : "Ensure good air circulation"
          ]
        },
        activityLevel: {
          title: "Safe Activity Recommendations",
          points: [
            aqi && aqi > 150 ? "Restricted - stay indoors or do light activities only" : "Moderate activity is safe",
            aqi && aqi > 100 ? "Avoid strenuous exercise outdoors" : "All activities are safe",
            "Plan indoor activities if air quality is poor"
          ]
        },
        vulnerableGroups: {
          title: "Special Precautions for Vulnerable Groups",
          points: [
            "Elderly: Minimize outdoor exposure, stay indoors",
            "Children: Limit outdoor playtime during poor air quality",
            "Asthma sufferers: Keep inhalers accessible at all times"
          ]
        },
        protectionTips: {
          title: "Practical Protection Measures",
          points: [
            aqi ? "Wear N95 mask outdoors" : "Use sunscreen",
            "Drink plenty of water",
            aqi ? "Use air purifier indoors" : "Open windows for fresh air",
            "Avoid strenuous activities in poor conditions"
          ]
        },
        medicalAlert: {
          title: "When to Seek Medical Help",
          points: [
            "Contact doctor if experiencing cough or difficulty breathing",
            "Seek immediate help for chest pain or severe symptoms",
            "Monitor children and elderly for health changes"
          ]
        }
      };
      return res.json({ advisory: fallbackAdvisory });
    }
    
    res.status(500).json({ error: "Failed to generate health advisory" });
  }
}

// Generate travel tips based on forecast
async function getTravelTips(req, res) {
  try {
    const { destination, forecastData } = req.body;

    if (!destination || !forecastData) {
      return res.status(400).json({ error: "Missing destination or forecast data" });
    }

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `Generate travel tips for ${destination} based on this forecast data: ${JSON.stringify(forecastData)}. Provide 3-4 practical travel recommendations.`;

    const result = await model.generateContent(prompt);
    const tips = result.response.text();

    res.json({ tips });
  } catch (error) {
    console.error("AI Travel Tips Error:", error);
    res.status(500).json({ error: "Failed to generate travel tips" });
  }
}

module.exports = {
  generateWeatherSummary,
  getActivityRecommendations,
  getHealthAdvisory,
  getTravelTips
};
