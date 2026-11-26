/* Main orchestration + auto-init with geolocation */
(() => {
  const cityInput = document.getElementById('cityInput');
  const searchBtn = document.getElementById('searchBtn');
  const locateBtn = document.getElementById('locateBtn');

  /* ---------- Core loader by coordinates ---------- */
  async function loadByCoords(lat, lon, locationMeta, isAuto) {
    UI.showLoader(isAuto ? 'Detecting your location…' : 'Fetching weather…');

    try {
      const location = locationMeta || await WeatherAPI.reverseGeocode(lat, lon);
      const data = await WeatherAPI.fetchForecast(lat, lon, location.timezone || 'auto');

      UI.renderCurrent(data, location, isAuto);
      UI.renderDaily(data);
      UI.renderHourly(data);
      UI.showContent();

      // Prefill search box for convenience
      cityInput.value = location.name || '';
    } catch (err) {
      console.error(err);
      UI.showError(err.message || 'Could not load weather.');
    }
  }

  /* ---------- Search by name ---------- */
  async function search(city) {
    const q = (city || '').trim();
    if (!q) return;

    UI.showLoader('Searching…');
    try {
      const location = await WeatherAPI.geocodeCity(q);
      await loadByCoords(location.latitude, location.longitude, location, false);
    } catch (err) {
      console.error(err);
      UI.showError(err.message || 'Search failed. Try another city.');
    }
  }

  /* ---------- Detect via browser geolocation ---------- */
  async function detectLocation() {
    UI.showLoader('Detecting your location…');
    try {
      const pos = await WeatherAPI.getBrowserLocation();
      await loadByCoords(pos.latitude, pos.longitude, null, true);
      return true;
    } catch (err) {
      console.warn('Geolocation unavailable:', err.message);
      return false;
    }
  }

  /* ---------- Detect via IP ---------- */
  async function detectByIp() {
    try {
      const loc = await WeatherAPI.getIpLocation();
      await loadByCoords(loc.latitude, loc.longitude, loc, true);
      return true;
    } catch (err) {
      console.warn('IP location failed:', err.message);
      return false;
    }
  }

  /* ---------- INIT: auto-detect → show weather on front page ---------- */
  async function init() {
    UI.showLoader('Detecting your location…');

    // 1) Browser geolocation
    if (await detectLocation()) return;

    // 2) IP-based fallback
    if (await detectByIp()) return;

    // 3) Last resort: default city
    console.info('Falling back to default city (London).');
    await search('London');
  }

  /* ---------- Events ---------- */
  searchBtn.addEventListener('click', () => search(cityInput.value));
  cityInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') search(cityInput.value);
  });

  locateBtn.addEventListener('click', async () => {
    const ok = await detectLocation();
    if (!ok) {
      const okIp = await detectByIp();
      if (!okIp) UI.showError('Could not access your location. Please search manually.');
    }
  });

  /* ---------- GO ---------- */
  init();
})();
