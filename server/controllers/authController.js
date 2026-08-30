import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { FarmerProfile } from '../models/FarmerProfile.js';
import { OfficerProfile } from '../models/OfficerProfile.js';
import { ShopkeeperProfile } from '../models/ShopkeeperProfile.js';
import { generateToken } from '../middleware/authMiddleware.js';
import { validatePasswordSecurity } from '../utils/passwordValidator.js';

// Helper to normalize phone numbers (digits only, max 10 digits)
const normalizePhone = (phone) => {
  if (!phone) return '';
  const digits = phone.toString().replace(/\D/g, '');
  if (digits.length > 10 && digits.startsWith('91')) {
    return digits.slice(2, 12);
  }
  return digits.slice(-10);
};

// @desc    Register a new user or add a new role to an existing user account
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, username, email, phone, password, role, village, mandal, district, state, address, businessName } = req.body;

    if (!name || !password || !role) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    if (!['FARMER', 'SHOPKEEPER', 'OFFICER'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified' });
    }

    const cleanEmail = email && email.trim() ? email.toLowerCase().trim() : undefined;
    const cleanPhone = normalizePhone(phone);
    const cleanUsername = username ? username.toLowerCase().trim() : undefined;

    if (!cleanPhone || cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit mobile phone number (e.g. 9876543210). Only 10 digits are allowed.'
      });
    }

    // For non-farmers (e.g. Shopkeeper/Officer), email is mandatory. For farmers, it is optional.
    if (role !== 'FARMER' && !cleanEmail) {
      return res.status(400).json({ success: false, message: 'Email address is required for business/officer accounts' });
    }

    // Enforce Password Security Rules
    const pwdValidation = validatePasswordSecurity(password);
    if (!pwdValidation.valid) {
      return res.status(400).json({
        success: false,
        message: pwdValidation.message,
        errors: pwdValidation.errors
      });
    }

    // Check existing accounts by unique identities (email, phone, and username)
    let existingByEmail = cleanEmail ? await User.findOne({ email: cleanEmail }) : null;
    let existingByPhone = cleanPhone ? await User.findOne({ phone: cleanPhone }) : null;
    let existingByUsername = cleanUsername ? await User.findOne({ username: cleanUsername }) : null;

    // Case 5: Identity Conflict — Email belongs to User A, but Phone belongs to User B
    if (
      existingByEmail &&
      existingByPhone &&
      existingByEmail._id.toString() !== existingByPhone._id.toString()
    ) {
      return res.status(409).json({
        success: false,
        message: 'Identity conflict: The provided email and mobile number belong to two separate registered accounts. Please use matching credentials.'
      });
    }

    // If username is already taken by another distinct user account
    if (
      existingByUsername &&
      ((existingByEmail && existingByUsername._id.toString() !== existingByEmail._id.toString()) ||
       (existingByPhone && existingByUsername._id.toString() !== existingByPhone._id.toString()) ||
       (!existingByEmail && !existingByPhone))
    ) {
      return res.status(400).json({
        success: false,
        message: `Username '${cleanUsername}' is already taken by another account. Please choose a different username.`
      });
    }

    const existingUser = existingByEmail || existingByPhone;

    // =========================================================================
    // CASE A: EXISTING USER FOUND (Add new role to existing account)
    // =========================================================================
    if (existingUser) {
      // Normalize user roles array
      const currentRoles = existingUser.roles && existingUser.roles.length > 0
        ? existingUser.roles
        : [existingUser.role || 'FARMER'];

      // Verify the person's password to authenticate that they own this account
      const isMatch = await existingUser.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          accountExists: true,
          message: `An account already exists with this ${cleanEmail && existingUser.email === cleanEmail ? 'email' : 'mobile number'}. Please enter your correct account password to add the ${role} role to your account.`
        });
      }

      // Case 2: Role already exists for this account
      if (currentRoles.includes(role)) {
        const roleLabel = role === 'FARMER' ? 'Farmer' : role === 'SHOPKEEPER' ? 'Shopkeeper' : 'Govt Officer';
        return res.status(400).json({
          success: false,
          alreadyHasRole: true,
          message: `${roleLabel} role already exists for this account. Please sign in through the ${roleLabel} portal.`
        });
      }

      // Case 1: Append new role to existing roles array
      const updatedRoles = [...new Set([...currentRoles, role])];
      existingUser.roles = updatedRoles;
      existingUser.role = role; // Set active session role

      // Update email/phone if provided
      if (!existingUser.email && cleanEmail) {
        existingUser.email = cleanEmail;
      }
      await existingUser.save();

      // Create role-specific profile if not already present
      let profile = null;
      if (role === 'FARMER') {
        profile = await FarmerProfile.findOne({ userId: existingUser._id });
        if (!profile) {
          profile = await FarmerProfile.create({
            userId: existingUser._id,
            farmerId: `FMR${Math.floor(100000 + Math.random() * 900000)}`,
            village: village || '',
            mandal: mandal || '',
            district: district || 'Vijayawada',
            state: state || 'Andhra Pradesh',
            address: address || '',
            registrationStatus: 'UNVERIFIED'
          });
        }
      } else if (role === 'SHOPKEEPER') {
        profile = await ShopkeeperProfile.findOne({ userId: existingUser._id });
        if (!profile) {
          profile = await ShopkeeperProfile.create({
            userId: existingUser._id,
            businessName: businessName || `${existingUser.name}'s Agro Store`,
            village: village || '',
            mandal: mandal || '',
            district: district || 'Vijayawada',
            primaryLocation: [village, mandal, district].filter(Boolean).join(', ') || village || district || 'Vijayawada'
          });
        }
      } else if (role === 'OFFICER') {
        profile = await OfficerProfile.findOne({ userId: existingUser._id });
        if (!profile) {
          const officerMandal = mandal || (address && address.includes('Mandal') ? address.split('Mandal')[0].trim() : 'Penamaluru');
          profile = await OfficerProfile.create({
            userId: existingUser._id,
            officerId: `AGR-OFC-${Math.floor(1000 + Math.random() * 9000)}`,
            assignedArea: address || `${officerMandal} Mandal, Krishna District`,
            mandal: officerMandal,
            district: district || 'Vijayawada',
            state: state || 'Andhra Pradesh'
          });
        }
      }

      const token = generateToken(existingUser._id, role);

      return res.status(200).json({
        success: true,
        message: `Successfully added ${role === 'FARMER' ? 'Farmer' : role === 'SHOPKEEPER' ? 'Shopkeeper' : 'Officer'} role to your account!`,
        token,
        user: {
          _id: existingUser._id,
          name: existingUser.name,
          username: existingUser.username,
          email: existingUser.email || '',
          phone: existingUser.phone,
          role,
          roles: existingUser.roles,
          avatar: existingUser.avatar,
          profile
        }
      });
    }

    // =========================================================================
    // CASE B: NEW USER (Brand new account registration)
    // =========================================================================
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const generatedUsername = cleanUsername || `${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString().slice(-4)}`;

    const user = await User.create({
      name: name.trim(),
      username: generatedUsername,
      email: cleanEmail,
      phone: cleanPhone,
      passwordHash,
      roles: [role],
      role: role,
      avatar: '',
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
        village: village || '',
        mandal: mandal || '',
        district: district || 'Vijayawada',
        primaryLocation: [village, mandal, district].filter(Boolean).join(', ') || village || district || 'Vijayawada'
      });
    } else if (role === 'OFFICER') {
      const officerMandal = mandal || (address && address.includes('Mandal') ? address.split('Mandal')[0].trim() : 'Penamaluru');
      profile = await OfficerProfile.create({
        userId: user._id,
        officerId: `AGR-OFC-${Math.floor(1000 + Math.random() * 9000)}`,
        assignedArea: address || `${officerMandal} Mandal, Krishna District`,
        mandal: officerMandal,
        district: district || 'Vijayawada',
        state: state || 'Andhra Pradesh'
      });
    }

    const token = generateToken(user._id, role);

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
        roles: user.roles,
        avatar: user.avatar,
        profile
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Authenticate user & get token for selected role
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { identifier, password, role } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Please provide username, phone, or email and password' });
    }

    const cleanIdentifier = identifier.trim();
    const cleanPhone = normalizePhone(cleanIdentifier);

    const userSearchConditions = [
      { email: cleanIdentifier.toLowerCase() },
      { username: cleanIdentifier.toLowerCase() },
      { phone: cleanIdentifier },
    ];
    if (cleanPhone) {
      userSearchConditions.push({ phone: cleanPhone });
    }

    // 1. FIRST identify the user
    const existingUser = await User.findOne({ $or: userSearchConditions });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'No account registered with this username, mobile number, or email. Please register first.'
      });
    }

    // Normalize user roles array
    const userRoles = existingUser.roles && existingUser.roles.length > 0
      ? existingUser.roles
      : [existingUser.role || 'FARMER'];

    // 2. Authenticate the password
    const isMatch = await existingUser.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please check your password and try again.',
        availableRoles: userRoles
      });
    }

    // 3. Check if the user is attempting to sign in under an unassigned role
    if (role && !userRoles.includes(role)) {
      const requestedLabel = role === 'FARMER' ? 'Farmer' : role === 'SHOPKEEPER' ? 'Shopkeeper' : 'Govt Officer';
      const availableLabels = userRoles.map(r => r === 'FARMER' ? 'Farmer' : r === 'SHOPKEEPER' ? 'Shopkeeper' : 'Govt Officer').join(' and ');
      const token = generateToken(existingUser._id, userRoles[0]);
      return res.status(403).json({
        success: false,
        code: 'ROLE_MISMATCH',
        message: `Your account is registered as ${availableLabels}, but not for the ${requestedLabel} role. Switch to ${availableLabels} portal to sign in, or register as ${requestedLabel}.`,
        availableRoles: userRoles,
        user: {
          _id: existingUser._id,
          name: existingUser.name,
          username: existingUser.username,
          email: existingUser.email || '',
          phone: existingUser.phone || '',
          roles: userRoles
        },
        token
      });
    }

    const activeRole = role || userRoles[0];

    // Load role-specific profile for active role
    let profile = null;
    if (activeRole === 'FARMER') {
      profile = await FarmerProfile.findOne({ userId: existingUser._id });
    } else if (activeRole === 'SHOPKEEPER') {
      profile = await ShopkeeperProfile.findOne({ userId: existingUser._id });
    } else if (activeRole === 'OFFICER') {
      profile = await OfficerProfile.findOne({ userId: existingUser._id });
    }

    const token = generateToken(existingUser._id, activeRole);

    return res.status(200).json({
      success: true,
      token,
      user: {
        _id: existingUser._id,
        name: existingUser.name,
        username: existingUser.username,
        email: existingUser.email || '',
        phone: existingUser.phone,
        role: activeRole,
        roles: userRoles,
        avatar: existingUser.avatar,
        profile
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Switch active session role for a multi-role user
// @route   POST /api/auth/switch-role
// @access  Private
export const switchRole = async (req, res) => {
  try {
    const { targetRole } = req.body;

    if (!targetRole || !['FARMER', 'SHOPKEEPER', 'OFFICER'].includes(targetRole)) {
      return res.status(400).json({ success: false, message: 'Invalid target role' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userRoles = user.roles && user.roles.length > 0 ? user.roles : [user.role || 'FARMER'];

    if (!userRoles.includes(targetRole)) {
      return res.status(403).json({
        success: false,
        message: `You do not have access to the ${targetRole} role on this account.`
      });
    }

    // Load target role profile
    let profile = null;
    if (targetRole === 'FARMER') {
      profile = await FarmerProfile.findOne({ userId: user._id });
    } else if (targetRole === 'SHOPKEEPER') {
      profile = await ShopkeeperProfile.findOne({ userId: user._id });
    } else if (targetRole === 'OFFICER') {
      profile = await OfficerProfile.findOne({ userId: user._id });
    }

    const token = generateToken(user._id, targetRole);

    return res.status(200).json({
      success: true,
      message: `Switched to ${targetRole === 'FARMER' ? 'Farmer' : targetRole === 'SHOPKEEPER' ? 'Shopkeeper' : 'Officer'} role`,
      token,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email || '',
        phone: user.phone,
        role: targetRole,
        roles: userRoles,
        avatar: user.avatar,
        profile
      }
    });
  } catch (error) {
    console.error('Switch role error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user profile and session role
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userRoles = user.roles && user.roles.length > 0 ? user.roles : [user.role || 'FARMER'];
    const activeRole = req.currentRole || userRoles[0];

    let profile = null;
    if (activeRole === 'FARMER') {
      profile = await FarmerProfile.findOne({ userId: user._id });
    } else if (activeRole === 'SHOPKEEPER') {
      profile = await ShopkeeperProfile.findOne({ userId: user._id });
    } else if (activeRole === 'OFFICER') {
      profile = await OfficerProfile.findOne({ userId: user._id });
    }

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email || '',
        phone: user.phone,
        role: activeRole,
        roles: userRoles,
        avatar: user.avatar,
        profile
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user and active role profile
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
    if (phone) user.phone = normalizePhone(phone);
    if (email !== undefined) {
      user.email = email && email.trim() ? email.toLowerCase().trim() : undefined;
    }
    await user.save();

    const userRoles = user.roles && user.roles.length > 0 ? user.roles : [user.role || 'FARMER'];
    const activeRole = req.currentRole || userRoles[0];

    let profile = null;
    if (activeRole === 'FARMER') {
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
    } else if (activeRole === 'SHOPKEEPER') {
      profile = await ShopkeeperProfile.findOne({ userId: user._id });
      if (profile) {
        if (businessName !== undefined) profile.businessName = businessName;
        if (tradeLicenseNo !== undefined) profile.tradeLicenseNo = tradeLicenseNo;
        if (village !== undefined) profile.village = village;
        if (mandal !== undefined) profile.mandal = mandal;
        if (district !== undefined) profile.district = district;
        if (req.body.primaryLocation !== undefined) profile.primaryLocation = req.body.primaryLocation;
        if (req.body.timings !== undefined) {
          profile.timings = {
            ...profile.timings,
            ...req.body.timings,
          };
        }
        await profile.save();
      }
      // Also update shop records if present
      await import('../models/Shop.js').then(async ({ Shop }) => {
        const shopUpdates = {};
        if (businessName !== undefined) shopUpdates.shopName = businessName;
        if (village !== undefined) shopUpdates.village = village;
        if (mandal !== undefined) shopUpdates.mandal = mandal;
        if (district !== undefined) shopUpdates.district = district;
        if (req.body.primaryLocation !== undefined) shopUpdates.location = req.body.primaryLocation;
        if (address !== undefined) shopUpdates.address = address;
        if (req.body.timings !== undefined) shopUpdates.timings = req.body.timings;
        if (phone !== undefined) shopUpdates.phone = normalizePhone(phone);
        if (Object.keys(shopUpdates).length > 0) {
          await Shop.updateMany({ ownerId: user._id }, { $set: shopUpdates });
        }
      });
    } else if (activeRole === 'OFFICER') {
      profile = await OfficerProfile.findOne({ userId: user._id });
      if (profile) {
        if (assignedArea !== undefined) profile.assignedArea = assignedArea;
        if (mandal !== undefined) profile.mandal = mandal;
        if (licenseNumber !== undefined) profile.licenseNumber = licenseNumber;
        if (district !== undefined) profile.district = district;
        if (state !== undefined) profile.state = state;
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
        email: user.email || '',
        phone: user.phone,
        role: activeRole,
        roles: userRoles,
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

    if (oldPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password cannot be the same as your current password. Please choose a different password.'
      });
    }

    // Enforce Password Security Rules
    const pwdValidation = validatePasswordSecurity(newPassword);
    if (!pwdValidation.valid) {
      return res.status(400).json({
        success: false,
        message: pwdValidation.message,
        errors: pwdValidation.errors
      });
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

// @desc    Reset password using username, phone, or email
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { identifier, newPassword, role } = req.body;

    if (!identifier || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide your registered identifier and new password' });
    }

    // Enforce Password Security Rules
    const pwdValidation = validatePasswordSecurity(newPassword);
    if (!pwdValidation.valid) {
      return res.status(400).json({
        success: false,
        message: pwdValidation.message,
        errors: pwdValidation.errors
      });
    }

    const cleanId = identifier.trim();
    const cleanPhone = normalizePhone(cleanId);
    const queryConditions = [
      { email: cleanId.toLowerCase() },
      { username: cleanId.toLowerCase() },
      { phone: cleanId }
    ];
    if (cleanPhone) {
      queryConditions.push({ phone: cleanPhone });
    }

    const user = await User.findOne({ $or: queryConditions });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No registered user found with these details.' });
    }

    // If role specified, ensure user has that role
    const userRoles = user.roles && user.roles.length > 0 ? user.roles : [user.role || 'FARMER'];
    if (role && !userRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: `Account found, but it is not registered for the ${role} role.`
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Password reset successfully for ${user.name}. You can now sign in with your new password.`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check if an account exists with identifier (username, phone, or email)
// @route   POST /api/auth/check-identity
// @access  Public
export const checkIdentity = async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier || !identifier.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide an identifier' });
    }

    const cleanId = identifier.trim().toLowerCase();
    const cleanPhone = normalizePhone(cleanId);

    const conditions = [
      { username: cleanId },
      { email: cleanId }
    ];
    if (cleanPhone) {
      conditions.push({ phone: cleanPhone });
    }

    const user = await User.findOne({ $or: conditions });
    if (!user) {
      return res.status(200).json({ success: true, exists: false });
    }

    const userRoles = user.roles && user.roles.length > 0 ? user.roles : [user.role || 'FARMER'];

    return res.status(200).json({
      success: true,
      exists: true,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        phone: user.phone,
        email: user.email || '',
        roles: userRoles
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a secondary role to an existing account (logged in or with password verification)
// @route   POST /api/auth/add-role
// @access  Public / Private (with optional JWT)
export const addRoleToAccount = async (req, res) => {
  try {
    const {
      role,
      identifier,
      password,
      businessName,
      primaryLocation,
      village,
      mandal,
      district,
      state,
      address,
      totalLandArea,
      designation,
      licenseNumber
    } = req.body;

    if (!role || !['FARMER', 'SHOPKEEPER', 'OFFICER'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Please specify a valid role (FARMER, SHOPKEEPER, OFFICER)' });
    }

    let user = null;

    // 1. If user is authenticated via JWT token
    if (req.user) {
      user = await User.findById(req.user._id);
    } else {
      // 2. Otherwise authenticate using identifier + password
      if (!identifier || !password) {
        return res.status(400).json({
          success: false,
          message: 'Please provide your account username/mobile/email and password to add a role.'
        });
      }

      const cleanId = identifier.trim().toLowerCase();
      const cleanPhone = normalizePhone(cleanId);
      const conditions = [
        { username: cleanId },
        { email: cleanId }
      ];
      if (cleanPhone) conditions.push({ phone: cleanPhone });

      user = await User.findOne({ $or: conditions });
      if (!user) {
        return res.status(404).json({ success: false, message: 'No registered account found with these details.' });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Incorrect account password. Please try again.' });
      }
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    const currentRoles = user.roles && user.roles.length > 0 ? user.roles : [user.role || 'FARMER'];

    if (currentRoles.includes(role)) {
      const roleLabel = role === 'FARMER' ? 'Farmer' : role === 'SHOPKEEPER' ? 'Shopkeeper' : 'Govt Officer';
      return res.status(400).json({
        success: false,
        alreadyHasRole: true,
        message: `Your account already has the ${roleLabel} role enabled.`
      });
    }

    // Append role
    user.roles = [...new Set([...currentRoles, role])];
    user.role = role; // Set active session role
    await user.save();

    // Create role-specific profile
    let profile = null;
    if (role === 'FARMER') {
      profile = await FarmerProfile.findOne({ userId: user._id });
      if (!profile) {
        profile = await FarmerProfile.create({
          userId: user._id,
          farmerId: `FMR${Math.floor(100000 + Math.random() * 900000)}`,
          village: village || '',
          mandal: mandal || '',
          district: district || 'Vijayawada',
          state: state || 'Andhra Pradesh',
          address: address || '',
          totalLandArea: Number(totalLandArea) || 0,
          registrationStatus: 'UNVERIFIED'
        });
      }
    } else if (role === 'SHOPKEEPER') {
      profile = await ShopkeeperProfile.findOne({ userId: user._id });
      if (!profile) {
        profile = await ShopkeeperProfile.create({
          userId: user._id,
          businessName: businessName || `${user.name}'s Agro Store`,
          village: village || '',
          mandal: mandal || '',
          district: district || 'Vijayawada',
          primaryLocation: [village, mandal, district].filter(Boolean).join(', ') || village || district || 'Vijayawada'
        });
      }
      // Auto-create initial Shop record
      const { Shop } = await import('../models/Shop.js');
      const existingShop = await Shop.findOne({ ownerId: user._id });
      if (!existingShop) {
        await Shop.create({
          shopId: `SHP${Math.floor(1000 + Math.random() * 9000)}`,
          ownerId: user._id,
          shopName: businessName || `${user.name}'s Agro Center`,
          location: village || primaryLocation || district || 'Vijayawada',
          village: village || '',
          mandal: mandal || '',
          district: district || 'Vijayawada',
          address: address || `${village || 'Main Road'}, ${mandal || district || 'Vijayawada'}`,
          phone: user.phone || '+91 98480 12345',
          ratingAverage: 4.5,
          ratingCount: 1
        });
      }
    } else if (role === 'OFFICER') {
      profile = await OfficerProfile.findOne({ userId: user._id });
      if (!profile) {
        const officerMandal = mandal || (address && address.includes('Mandal') ? address.split('Mandal')[0].trim() : 'Penamaluru');
        profile = await OfficerProfile.create({
          userId: user._id,
          officerId: `AGR-OFC-${Math.floor(1000 + Math.random() * 9000)}`,
          assignedArea: address || `${officerMandal} Mandal, Krishna District`,
          mandal: officerMandal,
          licenseNumber: licenseNumber || 'AP-AGRI-OFF-2024-8841',
          district: district || 'Vijayawada',
          state: state || 'Andhra Pradesh'
        });
      }
    }

    const token = generateToken(user._id, role);

    return res.status(200).json({
      success: true,
      message: `Successfully activated ${role === 'FARMER' ? 'Farmer' : role === 'SHOPKEEPER' ? 'Shopkeeper' : 'Officer'} role on your account!`,
      token,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email || '',
        phone: user.phone,
        role,
        roles: user.roles,
        avatar: user.avatar,
        profile
      }
    });
  } catch (error) {
    console.error('Error adding role:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
