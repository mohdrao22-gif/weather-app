const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const statusDiv = document.getElementById("status");
const weatherResult = document.getElementById("weatherResult");

// These codes tell us it's a populated place (city, capital, etc.)
const cityCodes = ["PPL", "PPLA", "PPLA2", "PPLC"];

searchBtn.addEventListener("click", async function() {
    const city = cityInput.value.trim();
    if (city === "") return;

    statusDiv.textContent = "Loading...";
    weatherResult.innerHTML = "";

    try {
        // Ask for 5 results to give us a better chance of finding an actual city
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=5`;
        const geoResponse = await fetch(geoUrl);
        
        if (!geoResponse.ok) throw new Error("Server error");

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            statusDiv.textContent = "Please enter a city name, not a country or region.";
            return;
        }

        // --- BULLETPROOF FILTER ---
        // Find a result that is a city code AND has a real population
        const cityResult = geoData.results.find(function(result) {
            const isCityCode = cityCodes.includes(result.feature_code);
            const hasPopulation = result.population && result.population > 0;
            
            return isCityCode && hasPopulation;
        });

        // If no result passed the test, it was probably a country or continent
        if (!cityResult) {
            statusDiv.textContent = "Please enter a city name, not a country or region.";
            return; 
        }

        // If we get here, it's a valid city!
        const lat = cityResult.latitude;
        const lon = cityResult.longitude;
        
        statusDiv.textContent = "Found city! Loading weather...";

        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
        const weatherResponse = await fetch(weatherUrl);
        
        if (!weatherResponse.ok) throw new Error("Server error");

        const weatherData = await weatherResponse.json();

        const temp = weatherData.current_weather.temperature;
        const wind = weatherData.current_weather.windspeed;

        statusDiv.textContent = "";
        weatherResult.innerHTML = `
            <p><strong>Temperature:</strong> ${temp}°C</p>
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