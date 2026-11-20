const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const statusDiv = document.getElementById("status");
const weatherResult = document.getElementById("weatherResult");
const toggleUnitBtn = document.getElementById("toggleUnitBtn");

const cityCodes = ["PPL", "PPLA", "PPLA2", "PPLC"];
let isCelsius = true;
let currentTempC = 0;

searchBtn.addEventListener("click", async function() {
    const city = cityInput.value.trim();
    
    // 1. NEW: Block numbers and special characters
    const lettersOnly = /^[A-Za-z\s]+$/;
    if (!lettersOnly.test(city)) {
        statusDiv.textContent = "Please enter a valid city name (letters only, no numbers).";
        weatherResult.innerHTML = "";
        toggleUnitBtn.style.display = "none";
        return;
    }

    statusDiv.textContent = "Loading...";
    weatherResult.innerHTML = "";
    toggleUnitBtn.style.display = "none";

    try {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=5`;
        const geoResponse = await fetch(geoUrl);
        
        if (!geoResponse.ok) throw new Error("Server error");

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            statusDiv.textContent = "Please enter a city name, not a country or region.";
            return;
        }

        const cityResult = geoData.results.find(function(result) {
            const isCityCode = cityCodes.includes(result.feature_code);
            const hasPopulation = result.population && result.population > 0;
            return isCityCode && hasPopulation;
        });

        if (!cityResult) {
            statusDiv.textContent = "Please enter a city name, not a country or region.";
            return; 
        }

        const lat = cityResult.latitude;
        const lon = cityResult.longitude;
        
        statusDiv.textContent = "Found city! Loading weather...";

        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
        const weatherResponse = await fetch(weatherUrl);
        
        if (!weatherResponse.ok) throw new Error("Server error");

        const weatherData = await weatherResponse.json();

        const temp = weatherData.current_weather.temperature;
        const wind = weatherData.current_weather.windspeed;

        currentTempC = temp;
        isCelsius = true;
        toggleUnitBtn.textContent = "Switch to °F";
        toggleUnitBtn.style.display = "inline-block"; // Shows the button

        statusDiv.textContent = "";
        weatherResult.innerHTML = `
            <p><strong>Temperature:</strong> <span id="tempDisplay">${temp}</span>°C</p>
            <p><strong>Wind Speed:</strong> ${wind} km/h</p>
        `;
    } catch (error) {
        statusDiv.textContent = "Error connecting to server."; 
    }
});

cityInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        searchBtn.click();
    }
});

toggleUnitBtn.addEventListener("click", function() {
    const tempDisplay = document.getElementById("tempDisplay");
    
    if (isCelsius) {
        const tempF = (currentTempC * 9/5) + 32;
        tempDisplay.textContent = tempF.toFixed(1);
        tempDisplay.nextSibling.textContent = "°F"; 
        toggleUnitBtn.textContent = "Switch to °C";
        isCelsius = false;
    } else {
        tempDisplay.textContent = currentTempC;
        tempDisplay.nextSibling.textContent = "°C";
        toggleUnitBtn.textContent = "Switch to °F";
        isCelsius = true;
    }
});