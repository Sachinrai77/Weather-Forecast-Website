/* WMO Weather Code → human text + icon key + body theme */
const WeatherCodes = (() => {
  const MAP = {
    0:  { text: 'Clear sky',           icon: 'sun' },
    1:  { text: 'Mainly clear',        icon: 'sun' },
    2:  { text: 'Partly cloudy',       icon: 'cloud' },
    3:  { text: 'Overcast',            icon: 'cloud' },
    45: { text: 'Fog',                 icon: 'cloud' },
    48: { text: 'Rime fog',            icon: 'cloud' },
    51: { text: 'Light drizzle',       icon: 'rain' },
    53: { text: 'Drizzle',             icon: 'rain' },
    55: { text: 'Dense drizzle',       icon: 'rain' },
    61: { text: 'Light rain',          icon: 'rain' },
    63: { text: 'Rain',                icon: 'rain' },
    65: { text: 'Heavy rain',          icon: 'rain' },
    71: { text: 'Light snow',          icon: 'snow' },
    73: { text: 'Snow',                icon: 'snow' },
    75: { text: 'Heavy snow',          icon: 'snow' },
    77: { text: 'Snow grains',         icon: 'snow' },
    80: { text: 'Light showers',       icon: 'rain' },
    81: { text: 'Showers',             icon: 'rain' },
    82: { text: 'Violent showers',     icon: 'rain' },
    85: { text: 'Snow showers',        icon: 'snow' },
    86: { text: 'Heavy snow showers',  icon: 'snow' },
    95: { text: 'Thunderstorm',        icon: 'thunder' },
    96: { text: 'Thunderstorm + hail', icon: 'thunder' },
    99: { text: 'Severe thunderstorm', icon: 'thunder' },
  };

  function info(code) {
    return MAP[code] || { text: 'Unknown', icon: 'cloud' };
  }

  function iconHTML(key) {
    switch (key) {
      case 'sun':
        return '<div class="icon-sun"></div>';
      case 'cloud':
        return '<div class="icon-cloud"></div>';
      case 'rain':
        return '<div class="icon-rain"><div class="cloud"></div><div class="drops"><div class="drop"></div><div class="drop"></div><div class="drop"></div></div></div>';
      case 'snow':
        return '<div class="icon-snow"><span class="flake">❄</span><span class="flake">❄</span><span class="flake">❄</span></div>';
      case 'thunder':
        return '<div class="icon-thunder"><div class="cloud-thunder"></div><div class="bolt">⚡</div></div>';
      default:
        return '<div class="icon-cloud"></div>';
    }
  }

  function emoji(key) {
    return { sun: '☀️', cloud: '☁️', rain: '🌧️', snow: '❄️', thunder: '⛈️' }[key] || '☁️';
  }

  function themeClass(key) {
    return {
      sun: 'sunny', cloud: 'cloudy', rain: 'rainy',
      snow: 'snowy', thunder: 'stormy',
    }[key] || 'night';
  }

  return { info, iconHTML, emoji, themeClass };
})();