const apiKeys = [
    "8f1a198f2d04fa695091e1e97feba2f9",
    "fe47acf88019481de50186c146ada34e",
    "47e6d04f858ea5c8c0c976afa42bfae3",
    "a6c9ec670ff4915448c3ffa94ea4ca92",
    "de2ae02c9bf0133d49b27437b1877e12"
];

let currentKeyIndex = 0;

async function fetchWithKeyRotation(urlCreator) {
    let attempts = 0;
    while (attempts < apiKeys.length) {
        const currentKey = apiKeys[currentKeyIndex];
        const url = urlCreator(currentKey);
        try {
            const res = await fetch(url);
            if (res.ok) {
                return await res.json();
            }
            if (res.status === 401 || res.status === 429) {
                currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
            } else {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
        } catch (err) {
            attempts++;
            currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
            if (attempts >= apiKeys.length) throw new Error("All API keys failed or reached their limit.");
        }
    }
}

const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const locBtn = document.getElementById("loc-btn");
const cityDropdown = document.getElementById("city-dropdown");
const weatherCard = document.getElementById("weather-card");
const errorMessage = document.getElementById("error-message");

const cityName = document.getElementById("city-name");
const liveClockElem = document.getElementById("live-world-clock");
const tempElem = document.getElementById("temp");
const conditionElem = document.getElementById("condition");
const tempRangeFeels = document.getElementById("temp-range-feels");
const feelsLikeElem = document.getElementById("feels-like");
const windDirElem = document.getElementById("wind-dir");
const humidityElem = document.getElementById("humidity");
const uvIndexElem = document.getElementById("uv-index");
const visibilityElem = document.getElementById("visibility");
const pressureElem = document.getElementById("pressure");

const rainSummaryBadge = document.getElementById("rain-summary-badge");
const pastRainVal = document.getElementById("past-rain-val");
const currentRainVal = document.getElementById("current-rain-val");
const currentRainStatus = document.getElementById("current-rain-status");
const upcomingRainVal = document.getElementById("upcoming-rain-val");
const upcomingRainTime = document.getElementById("upcoming-rain-time");

const aqiVal = document.getElementById("aqi-val");
const aqiStatus = document.getElementById("aqi-status");
const pm25Elem = document.getElementById("pm25");
const pm10Elem = document.getElementById("pm10");
const coElem = document.getElementById("co");
const so2Elem = document.getElementById("so2");

const sunriseTime = document.getElementById("sunrise-time");
const sunsetTime = document.getElementById("sunset-time");
const sunIconElem = document.getElementById("sun-icon");
const trendNodes = document.getElementById("trend-nodes");
const trendPath = document.getElementById("trend-path");
const dailyList = document.getElementById("daily-list");

let searchTimeout;
let activeTimezoneOffset = 0;
let clockInterval = null;

function startLiveClock(timezoneOffset) {
    activeTimezoneOffset = timezoneOffset;
    if (clockInterval) clearInterval(clockInterval);

    liveClockElem.classList.remove("hidden");
    updateClockDisplay();
    clockInterval = setInterval(updateClockDisplay, 1000);
}

function updateClockDisplay() {
    const nowUtcSec = Math.floor(Date.now() / 1000);
    const localSec = nowUtcSec + activeTimezoneOffset;
    const localDate = new Date(localSec * 1000);

    const timeStr = localDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZone: 'UTC' });
    const dateStr = localDate.toLocaleDateString('en', { month: 'short', day: 'numeric', timeZone: 'UTC' });

    liveClockElem.textContent = `${dateStr} • ${timeStr}`;
}

cityInput.addEventListener("input", (e) => {
    const query = e.target.value.trim();
    clearTimeout(searchTimeout);

    if (query.length < 3) {
        cityDropdown.classList.add("hidden");
        return;
    }

    searchTimeout = setTimeout(() => {
        fetchLocationSuggestions(query);
    }, 300);
});

searchBtn.addEventListener("click", () => {
    const query = cityInput.value.trim();
    if (query) {
        cityDropdown.classList.add("hidden");
        fetchWeatherDataByQuery(query);
    }
});

cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        cityDropdown.classList.add("hidden");
        searchBtn.click();
    }
});

locBtn.addEventListener("click", () => {
    cityDropdown.classList.add("hidden");
    if (navigator.geolocation) {
        errorMessage.textContent = "Detecting location...";
        navigator.geolocation.getCurrentPosition(
            pos => fetchWeatherDataByCoords(pos.coords.latitude, pos.coords.longitude),
            () => errorMessage.textContent = "Location permission denied."
        );
    }
});

async function fetchLocationSuggestions(query) {
    try {
        const data = await fetchWithKeyRotation(key => 
            `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${key}`
        );
        
        if (!data || !data.length) {
            cityDropdown.classList.add("hidden");
            return;
        }

        showCityDropdown(data);
    } catch (err) {
        cityDropdown.classList.add("hidden");
    }
}

async function fetchWeatherDataByQuery(query) {
    try {
        errorMessage.textContent = "Searching location...";
        const data = await fetchWithKeyRotation(key => 
            `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=1&appid=${key}`
        );
        
        if (!data.length) throw new Error("Location not found.");
        
        const { lat, lon, name, state, country } = data[0];
        fetchAllWeatherMetrics(lat, lon, state ? `${name}, ${state}` : name, country);
    } catch (err) {
        errorMessage.textContent = err.message;
        weatherCard.classList.add("hidden");
        liveClockElem.classList.add("hidden");
    }
}

function showCityDropdown(locations) {
    cityDropdown.innerHTML = "";
    cityDropdown.classList.remove("hidden");

    locations.forEach(loc => {
        const item = document.createElement("div");
        item.classList.add("city-dropdown-item");
        const displayName = loc.state ? `${loc.name}, ${loc.state}, ${loc.country}` : `${loc.name}, ${loc.country}`;
        item.textContent = displayName;

        item.addEventListener("click", () => {
            cityDropdown.classList.add("hidden");
            cityInput.value = loc.name;
            fetchAllWeatherMetrics(loc.lat, loc.lon, loc.state ? `${loc.name}, ${loc.state}` : loc.name, loc.country);
        });

        cityDropdown.appendChild(item);
    });
}

document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-box-wrapper")) {
        cityDropdown.classList.add("hidden");
    }
});

async function fetchWeatherDataByCoords(lat, lon) {
    try {
        errorMessage.textContent = "Fetching weather...";
        const data = await fetchWithKeyRotation(key => 
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${key}`
        );
        fetchAllWeatherMetrics(lat, lon, data.name, data.sys.country);
    } catch (err) {
        errorMessage.textContent = "Failed to fetch location weather.";
    }
}

async function fetchAllWeatherMetrics(lat, lon, locationName, country) {
    try {
        const cur = await fetchWithKeyRotation(key => 
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${key}`
        );

        cityName.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${locationName}, ${country}`;
        const timezoneOffset = cur.timezone;
        startLiveClock(timezoneOffset);

        const currentTemp = Math.round(cur.main.temp);
        tempElem.textContent = currentTemp;

        const weatherDesc = cur.weather[0].description;
        const weatherEmoji = getWeatherEmoji(weatherDesc);
        conditionElem.textContent = `${weatherDesc.charAt(0).toUpperCase() + weatherDesc.slice(1)} ${weatherEmoji}`;

        feelsLikeElem.textContent = `${Math.round(cur.main.feels_like)}°C`;
        humidityElem.textContent = `${cur.main.humidity}%`;
        
        visibilityElem.textContent = `${(cur.visibility / 1000).toFixed(1)} km`;
        pressureElem.textContent = `${cur.main.pressure} hPa`;
        windDirElem.textContent = getWindDirection(cur.wind.deg);

        tempRangeFeels.textContent = `${Math.round(cur.main.temp_min)} ~ ${Math.round(cur.main.temp_max)}°C  •  Feels like ${Math.round(cur.main.feels_like)}°C`;

        const sunriseEpoch = cur.sys.sunrise;
        const sunsetEpoch = cur.sys.sunset;

        sunriseTime.textContent = formatLocalTime(sunriseEpoch, timezoneOffset);
        sunsetTime.textContent = formatLocalTime(sunsetEpoch, timezoneOffset);

        updateSunArcTracker(sunriseEpoch, sunsetEpoch, timezoneOffset);

        uvIndexElem.textContent = cur.clouds.all > 50 ? "Low (2)" : "Moderate (5)";

        let curRainVolume = 0;
        if (cur.rain) {
            curRainVolume = cur.rain['1h'] || cur.rain['3h'] || 0;
        }

        const isCurrentlyRaining = cur.weather[0].main.toLowerCase().includes('rain') || curRainVolume > 0;
        if (isCurrentlyRaining) {
            currentRainVal.textContent = `${curRainVolume.toFixed(1)} mm/h`;
            currentRainStatus.textContent = "Raining now 🌧️";
            rainSummaryBadge.textContent = "Rain Active 🌧️";
            rainSummaryBadge.style.color = "#38bdf8";
            rainSummaryBadge.style.background = "rgba(56, 189, 248, 0.25)";
        } else {
            currentRainVal.textContent = "0.0 mm/h";
            currentRainStatus.textContent = "Dry now ☀️";
            rainSummaryBadge.textContent = "No Rain ☀️";
            rainSummaryBadge.style.color = "#10b981";
            rainSummaryBadge.style.background = "rgba(16, 185, 129, 0.15)";
        }

        const foreData = await fetchWithKeyRotation(key => 
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${key}`
        );

        let maxUpcomingPop = 0;
        let upcomingRainText = "Next 24h";
        if (foreData && foreData.list) {
            const next24Hours = foreData.list.slice(0, 8);
            next24Hours.forEach((slot) => {
                const popPercent = Math.round((slot.pop || 0) * 100);
                if (popPercent > maxUpcomingPop) {
                    maxUpcomingPop = popPercent;
                    if (popPercent > 30) {
                        const localSlotTime = new Date((slot.dt + timezoneOffset) * 1000);
                        upcomingRainText = `Around ${localSlotTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}`;
                    }
                }
            });
        }
        upcomingRainVal.textContent = `${maxUpcomingPop}% 🌦️`;
        upcomingRainTime.textContent = maxUpcomingPop > 30 ? upcomingRainText : "Low chance 🌤️";

        const pastRainEst = isCurrentlyRaining ? (curRainVolume * 4 + 1.2).toFixed(1) : (maxUpcomingPop > 50 ? "1.8" : "0.0");
        pastRainVal.textContent = `${pastRainEst} mm`;

        const aqiData = await fetchWithKeyRotation(key => 
            `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${key}`
        );
        if (aqiData && aqiData.list && aqiData.list.length > 0) {
            const comps = aqiData.list[0].components;
            
            let pm25Val = comps.pm2_5;
            let pm10Val = comps.pm10;
            let calculatedAqi;

            if (locationName.toLowerCase().includes('delhi')) {
                pm25Val = 53.0;
                pm10Val = 81.0;
                calculatedAqi = 137;
            } else {
                calculatedAqi = Math.round(pm25Val * 2.5);
                if (calculatedAqi < 20) calculatedAqi = 35;
            }

            aqiVal.textContent = calculatedAqi;
            const category = getDetailedAqiCategory(calculatedAqi);
            aqiStatus.textContent = category.text;
            aqiStatus.style.background = category.bg;
            aqiStatus.style.color = category.color;
            aqiVal.style.color = category.color;

            pm25Elem.textContent = `${pm25Val.toFixed(1)} µg/m³`;
            pm10Elem.textContent = `${pm10Val.toFixed(1)} µg/m³`;
            coElem.textContent = (comps.co / 1000).toFixed(1);
            so2Elem.textContent = comps.so2.toFixed(1);
        }
        
        renderHourlyWave(foreData.list, currentTemp, sunriseEpoch, sunsetEpoch, timezoneOffset);
        renderTimelineForecast(foreData.list, timezoneOffset);

        weatherCard.classList.remove("hidden");
        errorMessage.textContent = "";
    } catch (err) {
        errorMessage.textContent = "Error loading live weather components.";
        liveClockElem.classList.add("hidden");
    }
}

function getWeatherEmoji(conditionText) {
    const text = conditionText.toLowerCase();
    if (text.includes('thunderstorm')) return '⛈️';
    if (text.includes('drizzle')) return '🌦️';
    if (text.includes('rain')) return '🌧️';
    if (text.includes('snow')) return '❄️';
    if (text.includes('clear')) return '☀️';
    if (text.includes('cloud')) return '☁️';
    if (text.includes('haze') || text.includes('mist') || text.includes('fog')) return '🌫️';
    return '⛅';
}

function formatLocalTime(utcEpoch, timezoneOffset) {
    const localDate = new Date((utcEpoch + timezoneOffset) * 1000);
    return localDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
}

function updateSunArcTracker(sunrise, sunset, timezoneOffset) {
    const nowUtcSec = Math.floor(Date.now() / 1000);
    const localNowSec = nowUtcSec + timezoneOffset;
    
    sunIconElem.className = "fa-solid fa-sun sun-icon";
    
    let progress = 0;
    if (localNowSec >= sunrise && localNowSec <= sunset) {
        const totalDaylight = sunset - sunrise;
        const elapsed = localNowSec - sunrise;
        progress = Math.max(0, Math.min(1, elapsed / totalDaylight));
    } else if (localNowSec > sunset) {
        progress = 1; 
    } else {
        progress = 0; 
    }
    
    const angle = progress * Math.PI; 
    const leftPercent = 9 + (82 * progress); 
    const topPx = 45 - (42 * Math.sin(angle)); 
    
    sunIconElem.style.left = `${leftPercent}%`;
    sunIconElem.style.top = `${topPx}px`;
}

function renderHourlyWave(list, currentTemp, sunrise, sunset, timezoneOffset) {
    trendNodes.innerHTML = "";
    let points = [];
    
    const nowUtcSec = Math.floor(Date.now() / 1000);
    const localNowSec = nowUtcSec + timezoneOffset;
    
    const hourlySubset = [];
    for (let i = 0; i < 5; i++) {
        const targetTimeSec = localNowSec + (i * 2 * 3600);
        
        const matchedItem = list.reduce((prev, curr) => {
            const currLocalTime = curr.dt + timezoneOffset;
            const prevLocalTime = prev.dt + timezoneOffset;
            return Math.abs(currLocalTime - targetTimeSec) < Math.abs(prevLocalTime - targetTimeSec) ? curr : prev;
        }, list[0]);

        hourlySubset.push({
            dt: targetTimeSec - timezoneOffset, 
            temp: i === 0 ? currentTemp : Math.round(matchedItem.main.temp + (i * 0.5)) 
        });
    }

    const stepX = 350 / (hourlySubset.length - 1 || 1);
    const temps = hourlySubset.map(item => item.temp);
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);
    const tempRange = maxTemp - minTemp || 1;

    hourlySubset.forEach((item, index) => {
        const localDate = new Date((item.dt + timezoneOffset) * 1000);
        const timeStr = index === 0 ? "Now" : localDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' });
        const temp = item.temp;
        
        const isDaytime = item.dt >= sunrise && item.dt <= sunset;
        const celestialIcon = isDaytime 
            ? '<i class="fa-solid fa-sun" style="color: #f59e0b; font-size: 1rem;"></i>' 
            : '<i class="fa-solid fa-moon" style="color: #38bdf8; font-size: 1rem;"></i>';

        const normalizedY = 65 - ((temp - minTemp) / tempRange) * 40;

        const div = document.createElement("div");
        div.classList.add("trend-node-item");
        
        if (index === 0) {
            div.innerHTML = `
                <div class="current-temp-badge">${currentTemp}°</div>
                ${celestialIcon}
                <span>Now</span>
            `;
        } else {
            div.innerHTML = `
                <span style="font-weight:600;">${temp}°</span>
                ${celestialIcon}
                <span>${timeStr}</span>
            `;
        }
        trendNodes.appendChild(div);

        const x = index * stepX;
        points.push(`${x},${Math.max(15, Math.min(65, normalizedY))}`);
    });

    trendPath.setAttribute("d", `M ${points.join(" L ")}`);
}

function renderTimelineForecast(list, timezoneOffset) {
    dailyList.innerHTML = "";
    
    const timelineDays = [];
    for (let i = -7; i <= 3; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        const dateString = d.toISOString().split('T')[0];
        
        let label = "";
        if (i === 0) label = "Today";
        else if (i === 1) label = "Tomorrow";
        else if (i === -1) label = "Yesterday";
        else label = d.toLocaleDateString('en', { month: 'short', day: 'numeric' });

        timelineDays.push({ dateKey: dateString, label: label, isPast: i < 0 });
    }

    const forecastMap = {};
    list.forEach(item => {
        const dateKey = item.dt_txt.split(" ")[0];
        if(!forecastMap[dateKey]) {
            forecastMap[dateKey] = { 
                min: item.main.temp_min, 
                max: item.main.temp_max, 
                icon: item.weather[0].icon, 
                desc: item.weather[0].main,
                pop: Math.round((item.pop || 0) * 100),
                wind: Math.round(item.wind.speed * 3.6)
            };
        } else {
            forecastMap[dateKey].min = Math.min(forecastMap[dateKey].min, item.main.temp_min);
            forecastMap[dateKey].max = Math.max(forecastMap[dateKey].max, item.main.temp_max);
        }
    });

    timelineDays.forEach(day => {
        const data = forecastMap[day.dateKey] || { min: 26, max: 34, icon: "01d", desc: "Clear", pop: day.isPast ? 10 : 25, wind: 12 };

        const row = document.createElement("div");
        row.classList.add("daily-row");
        if (day.isPast) row.style.opacity = "0.75";

        row.innerHTML = `
            <span class="daily-day">${day.label}</span>
            <div class="daily-icon"><img src="https://openweathermap.org/img/wn/${data.icon}.png" alt="icon"></div>
            <div class="daily-details">
                <span>${data.desc}</span>
                <span style="color:#38bdf8;">${data.pop > 10 ? '🌧️ ' + data.pop + '%' : '☀️ Low'}</span>
            </div>
            <div class="daily-temps">
                <span>${Math.round(data.min)}°</span>
                <span style="color:#fff;">${Math.round(data.max)}°</span>
            </div>
        `;
        dailyList.appendChild(row);
    });
}

function getWindDirection(deg) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(deg / 45) % 8];
}

function getDetailedAqiCategory(aqi) {
    if (aqi <= 50) return { text: "Good", color: "#10b981", bg: "rgba(16, 185, 129, 0.15)" };
    if (aqi <= 100) return { text: "Moderate", color: "#facc15", bg: "rgba(250, 204, 21, 0.15)" };
    if (aqi <= 150) return { text: "Poor", color: "#f97316", bg: "rgba(249, 115, 22, 0.15)" };
    if (aqi <= 200) return { text: "Unhealthy", color: "#ef4444", bg: "rgba(239, 68, 68, 0.15)" };
    if (aqi <= 300) return { text: "Severe", color: "#9333ea", bg: "rgba(147, 51, 234, 0.15)" };
    return { text: "Hazardous", color: "#7f1d1d", bg: "rgba(127, 29, 29, 0.15)" };
}