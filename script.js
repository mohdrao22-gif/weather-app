const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const statusDiv = document.getElementById("status");
const weatherResult = document.getElementById("weatherResult");

searchBtn.addEventListener("click", async function() {
    const city = cityInput.value.trim();
    if (city === "") return;

    // 1. Show loading state and clear old weather
    statusDiv.textContent = "Loading...";
    weatherResult.innerHTML = ""; // This clears the old weather data

    try {
        // 2. Fetch coordinates
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`;
        const geoResponse = await fetch(geoUrl);
        
        // New: Check if the server responded with an error (like a 500)
        if (!geoResponse.ok) throw new Error("Server error");

        const geoData = await geoResponse.json();

        // 3. Check if city was found
        if (!geoData.results || geoData.results.length === 0) {
            statusDiv.textContent = "City not found. Try again.";
            return; // Stop here
        }

        const lat = geoData.results[0].latitude;
        const lon = geoData.results[0].longitude;
        
        statusDiv.textContent = "Found city! Loading weather...";

        // 4. Fetch Weather
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
        const weatherResponse = await fetch(weatherUrl);
        
        // New: Check the weather server too
        if (!weatherResponse.ok) throw new Error("Server error");

        const weatherData = await weatherResponse.json();

        // 5. Display weather
        const temp = weatherData.current_weather.temperature;
        const wind = weatherData.current_weather.windspeed;

        statusDiv.textContent = ""; // clear loading message
        weatherResult.innerHTML = `
            <p><strong>Temperature:</strong> ${temp}°C</p>
            <p><strong>Wind Speed:</strong> ${wind} km/h</p>
        `;
    } catch (error) {
        // This catches internet failures AND the new thrown server errors
        statusDiv.textContent = "Error connecting to server."; 
    }
});

// New: Allow the user to press "Enter" instead of clicking the button
cityInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        searchBtn.click();
    }
});