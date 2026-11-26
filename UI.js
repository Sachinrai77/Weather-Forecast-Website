/* All DOM rendering + animation */
const UI = (() => {
  const els = {
    loader:        document.getElementById('loader'),
    errorMsg:      document.getElementById('errorMsg'),
    content:       document.getElementById('weatherContent'),

    locationName:  document.getElementById('locationName'),
    sourceBadge:   document.getElementById('sourceBadge'),
    conditionText: document.getElementById('conditionText'),
    currentTemp:   document.getElementById('currentTemp'),
    feelsLike:     document.getElementById('feelsLike'),
    weatherIcon:   document.getElementById('weatherIcon'),

    humidity:      document.getElementById('humidity'),
    wind:          document.getElementById('wind'),
    uvIndex:       document.getElementById('uvIndex'),
    precip:        document.getElementById('precip'),

    forecastRow:   document.getElementById('forecastRow'),
    hourlyStrip:   document.getElementById('hourlyStrip'),
  };

  const round = (n, d = 0) => (n == null ? '—' : Number(n).toFixed(d));

  function showLoader(text = 'Loading…') {
    els.loader.textContent = text;
    els.loader.classList.remove('hidden');
    els.errorMsg.classList.add('hidden');
    els.content.classList.add('hidden');
  }

  function showError(msg) {
    els.errorMsg.textContent = msg;
    els.errorMsg.classList.remove('hidden');
    els.loader.classList.add('hidden');
    els.content.classList.add('hidden');
  }

  function showContent() {
    els.loader.classList.add('hidden');
    els.errorMsg.classList.add('hidden');
    els.content.classList.remove('hidden');
  }

  function setTheme(iconKey) {
    document.body.className = '';
    document.body.classList.add(WeatherCodes.themeClass(iconKey));
  }

  function renderCurrent(data, location, isAuto = false) {
    const c = data.current;
    const info = WeatherCodes.info(c.weather_code);

    // Location
    const parts = [location.name, location.admin1, location.country].filter(Boolean);
    els.locationName.textContent = parts.join(', ');

    // Auto-detected badge
    els.sourceBadge.classList.toggle('hidden', !isAuto);

    // Main values
    els.conditionText.textContent = info.text;
    els.currentTemp.textContent = `${round(c.temperature_2m)}°C`;
    els.feelsLike.textContent = `Feels like ${round(c.apparent_temperature)}°C`;

    // Animated icon
    els.weatherIcon.innerHTML = WeatherCodes.iconHTML(info.icon);
    setTheme(info.icon);

    // Metrics
    els.humidity.textContent = `${round(c.relative_humidity_2m)}%`;
    els.wind.textContent = `${round(c.wind_speed_10m)} km/h`;
    els.uvIndex.textContent = c.uv_index != null ? round(c.uv_index, 1) : '—';
    els.precip.textContent = `${round(c.precipitation, 1)} mm`;
  }

  function renderDaily(data) {
    const d = data.daily;
    const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    els.forecastRow.innerHTML = '';

    for (let i = 0; i < d.time.length; i++) {
      const date = new Date(d.time[i] + 'T12:00:00');
      const dayName = i === 0 ? 'Today' : DAY_NAMES[date.getDay()];
      const info = WeatherCodes.info(d.weather_code[i]);

      const card = document.createElement('div');
      card.className = 'glass forecast-card';
      card.innerHTML = `
        <div class="day">${dayName}</div>
        <div class="fc-icon">${WeatherCodes.emoji(info.icon)}</div>
        <div class="fc-temps">${round(d.temperature_2m_max[i])}° <span>${round(d.temperature_2m_min[i])}°</span></div>
      `;
      els.forecastRow.appendChild(card);
    }
  }

  function renderHourly(data) {
    const h = data.hourly;
    els.hourlyStrip.innerHTML = '';

    // Find first hour >= current time (ISO string compare works)
    const nowStr = data.current.time;
    let startIdx = 0;
    while (startIdx < h.time.length && h.time[startIdx] < nowStr) startIdx++;

    for (let i = startIdx; i < Math.min(startIdx + 12, h.time.length); i++) {
      const t = new Date(h.time[i]);
      const hourLabel = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const info = WeatherCodes.info(h.weather_code[i]);
      const pop = h.precipitation_probability[i];

      const item = document.createElement('div');
      item.className = 'hourly-item';
      item.innerHTML = `
        <span>${hourLabel}</span>
        <span style="font-size:1.2rem">${WeatherCodes.emoji(info.icon)}</span>
        <span class="h-temp">${round(h.temperature_2m[i])}°</span>
        <span>${pop != null ? pop + '%' : ''}</span>
      `;
      els.hourlyStrip.appendChild(item);
    }
  }

  return { showLoader, showError, showContent, renderCurrent, renderDaily, renderHourly };
})();