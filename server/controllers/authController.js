import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { FarmerProfile } from '../models/FarmerProfile.js';
import { OfficerProfile } from '../models/OfficerProfile.js';
import { ShopkeeperProfile } from '../models/ShopkeeperProfile.js';
import { generateToken } from '../middleware/authMiddleware.js';

// @desc    Register a new user (Farmer / Shopkeeper)
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, username, email, phone, password, role, village, mandal, district, state, address, businessName } = req.body;

    if (!name || !username || !password || !role) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // For non-farmers (e.g. Shopkeeper/Officer), email is mandatory. For farmers, it is optional.
    if (role !== 'FARMER' && (!email || !email.trim())) {
      return res.status(400).json({ success: false, message: 'Email address is required for business accounts' });
    }

    if (!['FARMER', 'SHOPKEEPER', 'OFFICER'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified' });
    }

    // Check if user already exists (by username, or by email if provided)
    const checkConditions = [{ username: username.toLowerCase().trim() }];
    if (email && email.trim()) {
      checkConditions.push({ email: email.toLowerCase().trim() });
    }
    if (phone && phone.trim()) {
      checkConditions.push({ phone: phone.trim() });
    }

    const userExists = await User.findOne({ $or: checkConditions });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this username, email, or mobile number already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name: name.trim(),
      username: username.toLowerCase().trim(),
      email: email && email.trim() ? email.toLowerCase().trim() : undefined,
      phone: phone ? phone.trim() : '',
      passwordHash,
      role,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`
    });

    // Create associated profile
    let profile = null;
    if (role === 'FARMER') {
      profile = await FarmerProfile.create({
        userId: user._id,
        farmerId: `FMR${Math.floor(100000 + Math.random() * 900000)}`,
        village: village || '',
        mandal: mandal || '',
        district: district || 'Vijayawada',
        state: state || 'Andhra Pradesh',
        address: address || '',
        registrationStatus: 'UNVERIFIED'
      });
    } else if (role === 'SHOPKEEPER') {
      profile = await ShopkeeperProfile.create({
        userId: user._id,
        businessName: businessName || `${name}'s Agro Store`,
        primaryLocation: village || district || 'Vijayawada'
      });
    } else if (role === 'OFFICER') {
      profile = await OfficerProfile.create({
        userId: user._id,
        officerId: `AGR-OFC-${Math.floor(1000 + Math.random() * 9000)}`,
        assignedArea: address || 'Vijayawada Mandal, Krishna District',
        district: district || 'Vijayawada',
        state: state || 'Andhra Pradesh'
      });
    }

    const token = generateToken(user._id, user.role);

    return res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email || '',
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        profile
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Authenticate user & get token (supports username, email, or mobile phone)
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { identifier, password, role } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Please provide username, phone, or email and password' });
    }

    const cleanIdentifier = identifier.trim();
    const query = {
      $or: [
        { email: cleanIdentifier.toLowerCase() },
        { username: cleanIdentifier.toLowerCase() },
        { phone: cleanIdentifier }
      ]
    };

    if (role) {
      query.role = role;
    }

    const user = await User.findOne(query);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or incorrect role selected' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Load role profile
    let profile = null;
    if (user.role === 'FARMER') {
      profile = await FarmerProfile.findOne({ userId: user._id });
    } else if (user.role === 'SHOPKEEPER') {
      profile = await ShopkeeperProfile.findOne({ userId: user._id });
    } else if (user.role === 'OFFICER') {
      profile = await OfficerProfile.findOne({ userId: user._id });
    }

    const token = generateToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email || '',
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        profile
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let profile = null;
    if (user.role === 'FARMER') {
      profile = await FarmerProfile.findOne({ userId: user._id });
    } else if (user.role === 'SHOPKEEPER') {
      profile = await ShopkeeperProfile.findOne({ userId: user._id });
    } else if (user.role === 'OFFICER') {
      profile = await OfficerProfile.findOne({ userId: user._id });
    }

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        profile
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user and role profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, email, village, mandal, district, state, address, totalLandArea, assignedArea, businessName, tradeLicenseNo, licenseNumber } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (email !== undefined) {
      user.email = email && email.trim() ? email.toLowerCase().trim() : undefined;
    }
    await user.save();

    let profile = null;
    if (user.role === 'FARMER') {
      profile = await FarmerProfile.findOne({ userId: user._id });
      if (profile) {
        if (village !== undefined) profile.village = village;
        if (mandal !== undefined) profile.mandal = mandal;
        if (district !== undefined) profile.district = district;
        if (state !== undefined) profile.state = state;
        if (address !== undefined) profile.address = address;
        if (totalLandArea !== undefined) profile.totalLandArea = totalLandArea;
        await profile.save();
      }
    } else if (user.role === 'SHOPKEEPER') {
      profile = await ShopkeeperProfile.findOne({ userId: user._id });
      if (profile) {
        if (businessName !== undefined) profile.businessName = businessName;
        if (tradeLicenseNo !== undefined) profile.tradeLicenseNo = tradeLicenseNo;
        await profile.save();
      }
    } else if (user.role === 'OFFICER') {
      profile = await OfficerProfile.findOne({ userId: user._id });
      if (profile) {
        if (assignedArea !== undefined) profile.assignedArea = assignedArea;
        if (licenseNumber !== undefined) profile.licenseNumber = licenseNumber;
        if (district !== undefined) profile.district = district;
        await profile.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        profile
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide both current and new passwords' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
