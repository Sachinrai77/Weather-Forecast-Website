/* All network calls live here */
const WeatherAPI = (() => {
  const GEO_URL      = 'https://geocoding-api.open-meteo.com/v1/search';
  const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
  const REVERSE_URL  = 'https://api.bigdatacloud.net/data/reverse-geocode-client';
  const IP_URL       = 'https://ipwho.is/';

  /* City name → { latitude, longitude, name, admin1, country, timezone } */
  async function geocodeCity(name) {
    const url = `${GEO_URL}?name=${encodeURIComponent(name)}&count=1&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Geocoding request failed');
    const data = await res.json();
    if (!data.results || !data.results.length) {
      throw new Error('City not found. Please try another name.');
    }
    return data.results[0];
  }

  /* lat/lon → { name, admin1, country } (free, keyless) */
  async function reverseGeocode(lat, lon) {
    try {
      const url = `${REVERSE_URL}?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const d = await res.json();
      return {
        name: d.city || d.locality || d.principalSubdivision || 'Your location',
        admin1: d.principalSubdivision || '',
        country: d.countryName || '',
        latitude: lat,
        longitude: lon,
        timezone: 'auto',
      };
    } catch {
      return {
        name: 'Your location', admin1: '', country: '',
        latitude: lat, longitude: lon, timezone: 'auto',
      };
    }
  }

  /* Browser geolocation → Promise<{latitude, longitude}> */
  function getBrowserLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
        (err) => reject(err),
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
      );
    });
  }

  /* IP-based fallback location */
  async function getIpLocation() {
    const res = await fetch(IP_URL);
    if (!res.ok) throw new Error('IP location failed');
    const d = await res.json();
    if (!d || d.success === false || !d.latitude) throw new Error('IP location unavailable');
    return {
      latitude: d.latitude,
      longitude: d.longitude,
      name: d.city || 'Your location',
      admin1: d.region || '',
      country: d.country || '',
      timezone: d.timezone?.id || 'auto',
    };
  }

  /* Fetch full forecast */
  async function fetchForecast(lat, lon, timezone = 'auto') {
    const params = new URLSearchParams({
      latitude: lat,
      longitude: lon,
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,uv_index,precipitation',
      daily:   'weather_code,temperature_2m_max,temperature_2m_min',
      hourly:  'temperature_2m,precipitation_probability,weather_code',
      timezone,
      forecast_days: 7,
    });
    const res = await fetch(`${FORECAST_URL}?${params}`);
    if (!res.ok) throw new Error('Weather API error');
    return res.json();
  }

  return { geocodeCity, reverseGeocode, getBrowserLocation, getIpLocation, fetchForecast };
})();
