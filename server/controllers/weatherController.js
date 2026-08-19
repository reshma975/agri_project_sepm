import { getWeatherData } from '../services/weatherService.js';

// @desc    Get agricultural weather report and alerts
// @route   GET /api/weather
// @access  Public
export const getWeather = async (req, res) => {
  try {
    const { location } = req.query;
    const weather = await getWeatherData(location || 'Vijayawada, Andhra Pradesh');
    return res.status(200).json({ success: true, weather });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
