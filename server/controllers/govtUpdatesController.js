import { GovernmentUpdate } from '../models/GovernmentUpdate.js';

// @desc    Get government updates with category & personalization filters
// @route   GET /api/government-updates
// @access  Public
export const getGovernmentUpdates = async (req, res) => {
  try {
    const { category, state, crop, search } = req.query;
    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (state && state !== 'All') {
      query.$or = [{ state: { $regex: state, $options: 'i' } }, { state: 'All India / National' }];
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { source: { $regex: search, $options: 'i' } }
      ];
    }

    const updates = await GovernmentUpdate.find(query).sort({ publishedDate: -1, createdAt: -1 });

    // Compute personalized recommendations if crop or state provided
    let recommended = [];
    if (crop || state) {
      const recQuery = {};
      if (crop) {
        recQuery.targetCrops = { $in: [new RegExp(crop, 'i'), 'All Crops'] };
      }
      if (state) {
        recQuery.state = { $in: [new RegExp(state, 'i'), 'All India / National'] };
      }
      recommended = await GovernmentUpdate.find(recQuery).sort({ publishedDate: -1 }).limit(3);
    }

    return res.status(200).json({
      success: true,
      count: updates.length,
      updates,
      recommended: recommended.length > 0 ? recommended : updates.slice(0, 2)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single government update by ID
// @route   GET /api/government-updates/:id
// @access  Public
export const getGovernmentUpdateById = async (req, res) => {
  try {
    const update = await GovernmentUpdate.findById(req.params.id);
    if (!update) {
      return res.status(404).json({ success: false, message: 'Government update not found' });
    }
    return res.status(200).json({ success: true, update });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
