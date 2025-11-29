// AI Functions for Weather App

class AIWeatherManager {
  constructor() {
    this.apiBase = '/api/ai';
  }

  // Get AI-generated weather summary
  async getWeatherSummary(city, temp, condition, humidity, windSpeed, feelsLike, aqi, aqiLabel, pm25, pm10) {
    try {
      const params = new URLSearchParams({
        city,
        temp,
        condition,
        humidity,
        windSpeed,
        feelsLike
      });
      
      if (aqi) {
        params.append('aqi', aqi);
        params.append('aqiLabel', aqiLabel);
        params.append('pm25', pm25);
        params.append('pm10', pm10);
      }

      console.log('Fetching summary with params:', Object.fromEntries(params));
      const response = await fetch(`${this.apiBase}/summary?${params}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${errorData.error}`);
      }
      
      const data = await response.json();
      console.log('Summary received:', data.summary);
      return data.summary;
    } catch (error) {
      console.error('Error fetching weather summary:', error);
      return null;
    }
  }

  // Get activity recommendations
  async getActivityRecommendations(temp, condition, windSpeed, humidity, aqi, aqiLabel) {
    try {
      const params = new URLSearchParams({
        temp,
        condition,
        windSpeed,
        humidity
      });
      
      if (aqi) {
        params.append('aqi', aqi);
        params.append('aqiLabel', aqiLabel);
      }

      const response = await fetch(`${this.apiBase}/activities?${params}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${errorData.error}`);
      }
      
      const data = await response.json();
      console.log('Activities received:', data.activities);
      return data.activities;
    } catch (error) {
      console.error('Error fetching activity recommendations:', error);
      return null;
    }
  }

  // Get health advisory
  async getHealthAdvisory(temp, condition, humidity, windSpeed, aqi, aqiLabel, pm25, pm10) {
    try {
      const params = new URLSearchParams({
        temp,
        condition,
        humidity,
        windSpeed
      });
      
      if (aqi) {
        params.append('aqi', aqi);
        params.append('aqiLabel', aqiLabel);
        params.append('pm25', pm25);
        params.append('pm10', pm10);
      }

      console.log('Fetching health advisory with params:', Object.fromEntries(params));
      const response = await fetch(`${this.apiBase}/health-advisory?${params}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${errorData.error}`);
      }
      
      const data = await response.json();
      console.log('Advisory received:', data.advisory);
      return data.advisory;
    } catch (error) {
      console.error('Error fetching health advisory:', error);
      return null;
    }
  }

  // Get travel tips
  async getTravelTips(destination, forecastData) {
    try {
      const response = await fetch(`${this.apiBase}/travel-tips`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          destination,
          forecastData
        })
      });

      if (!response.ok) throw new Error('Failed to fetch travel tips');
      
      const data = await response.json();
      return data.tips;
    } catch (error) {
      console.error('Error fetching travel tips:', error);
      return null;
    }
  }

  // Display summary in UI
  async displayWeatherSummary(city, temp, condition, humidity, windSpeed, feelsLike, aqi, aqiLabel, pm25, pm10) {
    const summary = await this.getWeatherSummary(city, temp, condition, humidity, windSpeed, feelsLike, aqi, aqiLabel, pm25, pm10);
    if (summary) {
      const summaryElement = document.getElementById('ai-summary');
      if (summaryElement) {
        summaryElement.innerHTML = '';
        
        // Create header
        const headerEl = document.createElement('h3');
        headerEl.textContent = '🌤️ Weather Summary';
        headerEl.style.marginBottom = '15px';
        headerEl.style.color = '#3498db';
        headerEl.style.borderBottom = '2px solid #3498db';
        headerEl.style.paddingBottom = '10px';
        summaryElement.appendChild(headerEl);
        
        // Parse the summary text and create sections
        const sections = summary.split(/\*\*([^*]+)\*\*/);
        
        for (let i = 1; i < sections.length; i += 2) {
          const title = sections[i];
          const content = sections[i + 1] ? sections[i + 1].trim() : '';
          
          if (content) {
            const sectionDiv = document.createElement('div');
            sectionDiv.style.marginBottom = '15px';
            
            const titleEl = document.createElement('strong');
            titleEl.textContent = title + ':';
            titleEl.style.color = '#2980b9';
            titleEl.style.fontSize = '14px';
            titleEl.style.display = 'block';
            titleEl.style.marginBottom = '5px';
            sectionDiv.appendChild(titleEl);
            
            const contentEl = document.createElement('p');
            contentEl.textContent = content;
            contentEl.style.margin = '0';
            contentEl.style.color = '#ffffffff';
            contentEl.style.lineHeight = '1.6';
            contentEl.style.fontSize = '14px';
            sectionDiv.appendChild(contentEl);
            
            summaryElement.appendChild(sectionDiv);
          }
        }
        
        summaryElement.style.display = 'block';
        console.log('Weather summary displayed');
      }
    } else {
      console.log('No summary returned');
    }
  }

  // Display activities in UI
  async displayActivities(temp, condition, windSpeed, humidity, aqi, aqiLabel) {
    const activities = await this.getActivityRecommendations(temp, condition, windSpeed, humidity, aqi, aqiLabel);
    if (activities && Array.isArray(activities)) {
      const activitiesElement = document.getElementById('ai-activities');
      if (activitiesElement) {
        activitiesElement.innerHTML = '<h3>Recommended Activities</h3>';
        const list = document.createElement('ul');
        activities.forEach(item => {
          const li = document.createElement('li');
          li.innerHTML = `<strong>${item.activity}:</strong> ${item.reason}${item.duration ? ` (${item.duration})` : ''}${item.precautions ? ` - Precautions: ${item.precautions}` : ''}`;
          list.appendChild(li);
        });
        activitiesElement.appendChild(list);
        activitiesElement.style.display = 'block';
        console.log('Activities displayed successfully');
      }
    } else {
      console.log('No activities returned or invalid format');
    }
  }

  // Display health advisory in UI with formatted sections
  async displayHealthAdvisory(temp, condition, humidity, windSpeed, aqi, aqiLabel, pm25, pm10) {
    const advisory = await this.getHealthAdvisory(temp, condition, humidity, windSpeed, aqi, aqiLabel, pm25, pm10);
    if (advisory) {
      const advisoryElement = document.getElementById('ai-health-advisory');
      if (advisoryElement) {
        advisoryElement.innerHTML = '';
        
        // If advisory is an object (structured JSON), format it nicely
        if (typeof advisory === 'object' && advisory !== null) {
          advisoryElement.innerHTML = '<h3>⚠️ Health & Safety Recommendations</h3>';
          
          // Loop through each section
          Object.values(advisory).forEach(section => {
            if (section.title && section.points) {
              const sectionDiv = document.createElement('div');
              sectionDiv.className = 'advisory-section';
              
              const titleEl = document.createElement('h4');
              titleEl.textContent = section.title;
              sectionDiv.appendChild(titleEl);
              
              const list = document.createElement('ul');
              list.className = 'advisory-points';
              section.points.forEach(point => {
                const li = document.createElement('li');
                li.textContent = point;
                list.appendChild(li);
              });
              sectionDiv.appendChild(list);
              advisoryElement.appendChild(sectionDiv);
            }
          });
        } else {
          // Fallback for plain text
          advisoryElement.textContent = advisory;
        }
        
        advisoryElement.style.display = 'block';
        console.log('Health advisory displayed');
      }
    } else {
      console.log('No advisory returned');
    }
  }
}

// Initialize AI Manager
const aiWeatherManager = new AIWeatherManager();
