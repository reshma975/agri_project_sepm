import { processAgriculturalQuery } from '../services/assistantService.js';

// @desc    Process text or voice query for agricultural assistant
// @route   POST /api/assistant/ask
// @access  Public
export const askAssistant = async (req, res) => {
  try {
    const { query, farmerContext } = req.body;

    if (!query || query.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please provide a question or query' });
    }

    const response = await processAgriculturalQuery(query, farmerContext || {});

    return res.status(200).json({
      success: true,
      query,
      answer: response.answer,
      topic: response.topic,
      suggestions: response.suggestions
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
