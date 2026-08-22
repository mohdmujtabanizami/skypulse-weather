# 🌤️ SkyPulse Weather Dashboard

<p align="center">
  <strong>
    A high-performance, glassmorphism-inspired weather PWA delivering hyper-localized,
    real-time meteorological data — built entirely with vanilla web technologies.
  </strong>
</p>

<p align="center">
  <a href="https://skypulse-weather-pi.vercel.app">
    <img src="https://img.shields.io/badge/🚀%20Live%20Demo-SkyPulse-success?style=for-the-badge" alt="Live Demo">
  </a>
  <a href="https://github.com/mohdmujtabanizami/skypulse-weather">
    <img src="https://img.shields.io/badge/💻%20GitHub-Repository-black?style=for-the-badge&logo=github" alt="GitHub Repository">
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-Structure-E34F26?style=flat-square&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-Styling-1572B6?style=flat-square&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/PWA-Installable-5A0FC8?style=flat-square&logo=pwa&logoColor=white" alt="PWA">
  <img src="https://img.shields.io/badge/Vercel-Deployment-black?style=flat-square&logo=vercel" alt="Vercel">
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" alt="MIT License">
</p>

<div align="center">
  <a href="https://skypulse-weather-pi.vercel.app"><strong>View Live Demo</strong></a> ·
  <a href="#-installation--local-setup"><strong>Installation</strong></a> ·
  <a href="#-features"><strong>Explore Features</strong></a> ·
  <a href="#-architecture-highlights"><strong>Architecture</strong></a>
</div>

---

## 📌 About the Project

**SkyPulse** is a feature-rich Progressive Web Application that delivers hyper-localized, real-time meteorological data without leaning on any frontend framework. Built entirely with **Vanilla JavaScript, HTML5, and CSS3**, it bypasses bulky dependencies to deliver a lightning-fast, glassmorphism-inspired UI.

Designed for resilience and precision, SkyPulse features a custom **multi-API key rotation system**, accurate **timezone synchronization**, and **dynamic SVG celestial tracking** — all calculated and rendered with hand-written JavaScript math rather than a charting library.

---

## 🚀 Live Deployment

**Access the live application here:** [skypulse-weather-pi.vercel.app](https://skypulse-weather-pi.vercel.app)

> 💡 SkyPulse is a fully installable PWA. Open the link in Google Chrome or Edge and click the **Install** icon in the address bar to run it as a native desktop or mobile application.

---

## ✨ Features

### 🔄 Resilient Multi-API Rotation
A custom fallback engine that automatically cycles through up to 5 OpenWeatherMap API keys to bypass rate limits (`429`) and unauthorized errors (`401`), ensuring near-zero downtime even under heavy request volume.

### 🌍 Dynamic Timezone Synchronization
A live, ticking world clock that automatically adjusts to the exact local AM/PM time and date of any searched global coordinate — no manual timezone lookups required.

### ☀️ Mathematical SVG Sun Tracking
An interactive, mathematically precise semi-circular arc that calculates elapsed daylight and live-tracks the sun's exact position between sunrise and sunset, updated in real time.

### 🌧️ Advanced Precipitation Engine
Analyzes current rain volume (`mm/h`), estimates past 24-hour accumulation, and calculates upcoming rain probabilities with dynamic emoji UI mapping for quick visual scanning.

### 📈 Comprehensive Forecasting
- **Hourly Trend Wave** — an interactive temperature wave chart detailing the next 5 intervals
- **7-Day Outlook** — a combined past (historical) and future timeline highlighting daily highs/lows, rain chances, and wind speeds

### 🫁 Air Quality Index (AQI)
Detailed breakdowns of primary pollutants (PM2.5, PM10, CO, SO₂) mapped to health-standard color scales, so air quality is understandable at a glance rather than a raw number.

### 📱 Installable & Offline-Friendly
Ships with a configured `manifest.json` and app icons so it installs like a native app and keeps working from cache when connectivity drops.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Structure** | HTML5 |
| **Styling** | CSS3 (CSS Variables, Flexbox/Grid, Glassmorphism backdrop filters) |
| **Logic & DOM** | Vanilla JavaScript (ES6+, Async/Await, Fetch API) |
| **Data Sources** | OpenWeatherMap — Current Weather, 5-Day Forecast, Air Pollution, Geocoding |
| **Icons** | FontAwesome 6 |
| **Deployment** | Vercel (CI/CD integrated) |

### JavaScript Concepts Used

- DOM Manipulation & dynamic SVG rendering
- Event Handling
- Async/Await & the Fetch API
- REST API integration with automatic key rotation
- Custom trigonometric calculations (sun-arc positioning, timezone math)
- Error handling & graceful degradation
- LocalStorage-based caching for offline resilience

---

## 📐 Architecture Highlights

- **Zero dependencies** — built entirely without React, Vue, or heavy charting libraries like Chart.js. All visual data representations (the hourly wave, the sun arc) are calculated via custom JavaScript math and rendered directly into inline SVGs for maximum performance.
- **PWA-ready** — includes a fully configured `manifest.json` and optimized icon set, allowing the dashboard to be installed locally, cached, and run outside the browser environment.
- **Resilient by design** — the API key rotation engine detects `401`/`429` responses and silently retries against the next key in the pool, so a single expired or rate-limited key never takes the app down.

```text
                     SkyPulse Data Flow
                            │
                 ┌──────────┼──────────┐
                 │          │          │
                 ▼          ▼          ▼
          Geocoding    Current /   Air Pollution
            API        Forecast        API
                 │          │          │
                 └──────────┼──────────┘
                            │
                     API Key Rotation
                     (auto-retry on
                      401 / 429)
                            │
                            ▼
                   Custom SVG Renderer
              (sun arc · hourly wave · AQI)
                            │
                            ▼
                    Dashboard UI (PWA)
```

---

## 💻 Installation & Local Setup

To run SkyPulse locally, follow these steps.

### 1. Clone the Repository

```bash
git clone https://github.com/mohdmujtabanizami/skypulse-weather.git
cd skypulse-weather
```

### 2. Configure API Keys

SkyPulse requires OpenWeatherMap API keys to fetch live data.

1. Open `script.js`
2. Locate the `apiKeys` array near the top of the file
3. Replace the placeholder strings with your own API keys

```javascript
const apiKeys = [
    "YOUR_API_KEY_1",
    "YOUR_API_KEY_2",
    "YOUR_API_KEY_3"
];
```

> 🔑 Get a free API key at [openweathermap.org/api](https://openweathermap.org/api). Adding 2–5 keys enables the automatic rotation/fallback system — a single key still works fine for local testing.

### 3. Launch the Application

Since this project is built with standard web technologies, no build step is required. Simply open `index.html` in your preferred browser, or use a local development server such as VS Code's **Live Server** extension for hot-reloading.

---

## 📂 Project Structure

```text
skypulse-weather/
│
├── index.html
├── style.css
├── script.js
├── manifest.json
├── /icons
│   └── (PWA app icons in multiple sizes)
│
└── README.md
```


## 🗺️ Roadmap

- [ ] Severe weather alerts / push notifications
- [ ] Multi-location saved dashboard
- [ ] Light theme toggle alongside the glassmorphism dark UI
- [ ] Historical trend charts beyond 24 hours
- [ ] Unit preference toggle (°C/°F, km/h/mph) persisted via LocalStorage

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 👨‍💻 Author

**Mohd Mujtaba Nizami**
Full Stack Web Developer | Computer Science Engineering Student

<p align="left">
  <a href="https://github.com/mohdmujtabanizami">
    <img src="https://img.shields.io/badge/GitHub-mohdmujtabanizami-black?style=for-the-badge&logo=github" alt="GitHub">
  </a>
  <a href="https://www.linkedin.com/in/mohd-mujtaba-nizami-btech1707">
    <img src="https://img.shields.io/badge/LinkedIn-Mohd%20Mujtaba%20Nizami-blue?style=for-the-badge&logo=linkedin" alt="LinkedIn">
  </a>
</p>

📧 Email: nizamimujtaba391@gmail.com
📍 New Delhi, India

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

<p align="center">
  ⭐ If you find this project useful, consider giving the repository a star!
</p>

<p align="center">
  Made with ❤️ by <strong>Mohd Mujtaba Nizami</strong>
</p>
