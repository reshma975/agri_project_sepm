// Weather Service with realistic agricultural advisories and alerts

export const getWeatherData = async (location = 'Vijayawada, Andhra Pradesh') => {
  // If external WEATHER_API_KEY is available and not mock, can call OpenWeatherMap / WeatherAPI
  // Otherwise return rich structured agricultural weather data:

  const conditions = [
    {
      condition: 'Sunny / Clear Sky',
      emoji: '☀️',
      temperature: 31,
      feelsLike: 33,
      humidity: 58,
      windSpeed: '12 km/h',
      rainProbability: '5%',
      alertType: 'GOOD',
      comment: 'Good conditions for farming activities! Ideal time for weeding, soil aeration, and field inspection.',
      expectedTime: 'Next 24-48 hours clear',
      forecast: [
        { day: 'Today', temp: '31°C / 24°C', condition: 'Sunny', emoji: '☀️', rain: '5%' },
        { day: 'Tomorrow', temp: '32°C / 25°C', condition: 'Partly Cloudy', emoji: '⛅', rain: '10%' },
        { day: 'Friday', temp: '30°C / 23°C', condition: 'Scattered Showers', emoji: '🌦️', rain: '40%' },
        { day: 'Saturday', temp: '29°C / 22°C', condition: 'Moderate Rain', emoji: '🌧️', rain: '65%' },
        { day: 'Sunday', temp: '31°C / 24°C', condition: 'Clear', emoji: '☀️', rain: '15%' },
      ],
      advisory: {
        irrigation: 'Normal schedule recommended for Paddy and Maize.',
        pesticideSpraying: 'Favorable morning conditions with wind under 15 km/h.',
        fertilizerApplication: 'Optimal moisture in soil for basal dose application.'
      }
    },
    {
      condition: 'Thunderstorm & Heavy Showers Warning',
      emoji: '⛈️',
      temperature: 27,
      feelsLike: 29,
      humidity: 85,
      windSpeed: '38 km/h Gusts',
      rainProbability: '85%',
      alertType: 'SEVERE',
      comment: 'Heavy rain & strong wind gusts expected. Ensure drainage channels are clear and delay chemical spraying.',
      expectedTime: 'Active until tomorrow evening',
      forecast: [
        { day: 'Today', temp: '27°C / 22°C', condition: 'Thunderstorm', emoji: '⛈️', rain: '85%' },
        { day: 'Tomorrow', temp: '28°C / 23°C', condition: 'Heavy Rain', emoji: '🌧️', rain: '75%' },
        { day: 'Friday', temp: '30°C / 24°C', condition: 'Cloudy', emoji: '⛅', rain: '30%' },
        { day: 'Saturday', temp: '32°C / 25°C', condition: 'Sunny', emoji: '☀️', rain: '10%' },
        { day: 'Sunday', temp: '33°C / 25°C', condition: 'Sunny', emoji: '☀️', rain: '5%' },
      ],
      advisory: {
        irrigation: 'Halt all artificial irrigation immediately to prevent waterlogging.',
        pesticideSpraying: 'DO NOT spray pesticides or foliar nutrients today (washout risk).',
        fertilizerApplication: 'Avoid surface urea broadcast to prevent runoff wastage.'
      }
    }
  ];

  // Pick suitable condition (default good or toggleable)
  const isMorning = new Date().getHours() < 18;
  const selected = isMorning ? conditions[0] : conditions[0];

  return {
    location,
    updatedAt: new Date().toISOString(),
    ...selected
  };
};
