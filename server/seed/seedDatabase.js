import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { FarmerProfile } from '../models/FarmerProfile.js';
import { OfficerProfile } from '../models/OfficerProfile.js';
import { ShopkeeperProfile } from '../models/ShopkeeperProfile.js';
import { Land } from '../models/Land.js';
import { CropRegistration } from '../models/CropRegistration.js';
import { CropRegistrationHistory } from '../models/CropRegistrationHistory.js';
import { Shop } from '../models/Shop.js';
import { Product } from '../models/Product.js';
import { ShopInventory } from '../models/ShopInventory.js';
import { Review } from '../models/Review.js';
import { GovernmentUpdate } from '../models/GovernmentUpdate.js';
import { RegistrationDeadline } from '../models/RegistrationDeadline.js';

// SVG Sample Base64 Document Templates for instant visual verification inspection
const sampleAadhaarData = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380" style="background:#ffffff;border-radius:12px;font-family:Arial,sans-serif;"><rect width="600" height="380" rx="12" fill="#fff" stroke="#ff9933" stroke-width="6"/><rect width="600" height="50" fill="#ff9933"/><text x="300" y="32" fill="#ffffff" font-size="18" font-weight="bold" text-anchor="middle">GOVERNMENT OF INDIA • UNIQUE IDENTIFICATION AUTHORITY</text><circle cx="300" cy="40" r="8" fill="#000088"/><rect x="35" y="80" width="120" height="150" fill="#e2e8f0" rx="8" stroke="#94a3b8" stroke-width="2"/><text x="95" y="165" font-size="36" text-anchor="middle">👨‍🌾</text><text x="180" y="105" font-size="13" font-weight="bold" fill="#64748b">Name / పేరు:</text><text x="180" y="128" font-size="18" font-weight="bold" fill="#0f172a">RAMESH PATEL</text><text x="180" y="155" font-size="13" font-weight="bold" fill="#64748b">Date of Birth / పుట్టిన తేదీ:</text><text x="180" y="175" font-size="15" font-weight="bold" fill="#1e293b">14/06/1982</text><text x="180" y="202" font-size="13" font-weight="bold" fill="#64748b">Gender / లింగం:</text><text x="180" y="222" font-size="15" font-weight="bold" fill="#1e293b">MALE / పురుషుడు</text><text x="35" y="270" font-size="13" font-weight="bold" fill="#64748b">Address / చిరునామా:</text><text x="35" y="290" font-size="13" fill="#334155">Plot 42, Main Road, Kankipadu Village, Penamaluru Mandal, Krishna Dist, AP - 521151</text><rect x="25" y="315" width="550" height="50" fill="#138808" rx="8"/><text x="300" y="348" fill="#ffffff" font-size="22" font-weight="bold" letter-spacing="4" text-anchor="middle">XXXX XXXX 4921</text></svg>`;

const samplePassbookData = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380" style="background:#ffffff;border-radius:12px;font-family:Arial,sans-serif;"><rect width="600" height="380" rx="12" fill="#f8fafc" stroke="#0284c7" stroke-width="5"/><rect width="600" height="60" fill="#0284c7"/><text x="300" y="38" fill="#ffffff" font-size="20" font-weight="bold" text-anchor="middle">STATE BANK OF INDIA • SAVINGS PASSBOOK</text><text x="40" y="95" font-size="12" font-weight="bold" fill="#64748b">Branch / బ్రాంచ్:</text><text x="40" y="115" font-size="14" font-weight="bold" fill="#0369a1">Kankipadu Main Branch (Code: 04521)</text><text x="340" y="95" font-size="12" font-weight="bold" fill="#64748b">IFSC Code:</text><text x="340" y="115" font-size="14" font-weight="bold" fill="#0369a1">SBIN0004521 (DBT Enabled)</text><line x1="40" y1="135" x2="560" y2="135" stroke="#cbd5e1" stroke-width="1.5"/><text x="40" y="165" font-size="12" font-weight="bold" fill="#64748b">Account Holder Name:</text><text x="40" y="188" font-size="18" font-weight="bold" fill="#0f172a">RAMESH PATEL</text><text x="340" y="165" font-size="12" font-weight="bold" fill="#64748b">Account Number:</text><text x="340" y="188" font-size="18" font-weight="bold" fill="#047857">3098 4421 8892</text><text x="40" y="225" font-size="12" font-weight="bold" fill="#64748b">Customer ID (CIF):</text><text x="40" y="245" font-size="14" fill="#334155">8891004218</text><text x="340" y="225" font-size="12" font-weight="bold" fill="#64748b">Direct Benefit Transfer (DBT):</text><text x="340" y="245" font-size="14" font-weight="bold" fill="#15803d">✅ Active / PM-KISAN Linked</text><rect x="40" y="280" width="520" height="75" fill="#f1f5f9" rx="8" stroke="#cbd5e1"/><text x="55" y="305" font-size="11" font-weight="bold" fill="#475569">Bank Seal &amp; Authorized Signature:</text><text x="55" y="335" font-size="13" font-weight="bold" fill="#0284c7">Verified &amp; Certified by Branch Manager, Kankipadu SBI</text></svg>`;

const sampleLandRecordData = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" viewBox="0 0 600 420" style="background:#fff;border-radius:12px;font-family:Arial,sans-serif;"><rect width="600" height="420" rx="12" fill="#fffefb" stroke="#854d0e" stroke-width="5"/><rect width="600" height="65" fill="#854d0e"/><text x="300" y="32" fill="#fef08a" font-size="16" font-weight="bold" text-anchor="middle">GOVERNMENT OF ANDHRA PRADESH • REVENUE DEPARTMENT</text><text x="300" y="52" fill="#ffffff" font-size="13" font-weight="bold" text-anchor="middle">Form 1-B (Record of Rights / Pattadar Passbook Extract)</text><rect x="30" y="80" width="540" height="60" fill="#fefce8" rx="6" stroke="#ca8a04"/><text x="45" y="102" font-size="11" font-weight="bold" fill="#713f12">District: KRISHNA (VIJAYAWADA)</text><text x="240" y="102" font-size="11" font-weight="bold" fill="#713f12">Mandal: PENAMALURU</text><text x="410" y="102" font-size="11" font-weight="bold" fill="#713f12">Village: KANKIPADU</text><text x="45" y="125" font-size="11" font-weight="bold" fill="#713f12">Khata No: 412</text><text x="240" y="125" font-size="11" font-weight="bold" fill="#713f12">Pattadar: RAMESH PATEL</text><text x="410" y="125" font-size="11" font-weight="bold" fill="#713f12">Father: VENKATA PATEL</text><rect x="30" y="155" width="540" height="170" fill="#f8fafc" rx="6" stroke="#cbd5e1"/><text x="45" y="180" font-size="12" font-weight="bold" fill="#334155">Survey / Sub-Division No:</text><text x="230" y="180" font-size="14" font-weight="bold" fill="#0f172a">125/2</text><text x="45" y="210" font-size="12" font-weight="bold" fill="#334155">Total Extent (Area):</text><text x="230" y="210" font-size="14" font-weight="bold" fill="#0f172a">2.50 Acres (1.012 Hectares)</text><text x="45" y="240" font-size="12" font-weight="bold" fill="#334155">Nature of Land / Classification:</text><text x="230" y="240" font-size="14" fill="#334155">Dry / Cultivable Wet (Nanjai)</text><text x="45" y="270" font-size="12" font-weight="bold" fill="#334155">Ownership Rights:</text><text x="230" y="270" font-size="14" font-weight="bold" fill="#15803d">Pattadar / Self-Owned (RoR Certified)</text><text x="45" y="300" font-size="12" font-weight="bold" fill="#334155">Survey Boundary Verified:</text><text x="230" y="300" font-size="14" fill="#334155">North: Channel, South: Survey 126, East: Road, West: Survey 125/1</text><rect x="30" y="340" width="540" height="60" fill="#ecfdf5" rx="6" stroke="#10b981"/><text x="45" y="365" font-size="11" font-weight="bold" fill="#065f46">Digital Certification Status:</text><text x="45" y="385" font-size="12" font-weight="bold" fill="#047857">✅ Validated against AP Meebhoomi Land Records Database (Digital Sign: TAHSILDAR_PENAMALURU)</text></svg>`;

export const seedDatabase = async () => {
  try {
    // Non-destructive backward compatibility migration for existing database records
    await User.updateMany(
      { $or: [{ roles: { $exists: false } }, { roles: { $size: 0 } }] },
      [{ $set: { roles: { $cond: [{ $ifNull: ['$role', false] }, ['$role'], ['FARMER']] } } }]
    );

    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('🌾 Database already contains data. Ensured multi-role schema compatibility.');
      return;
    }

    console.log('🌱 Seeding fresh FarmSetu database with comprehensive initial demo data...');

    // Clear any remnants
    await Promise.all([
      User.deleteMany({}),
      FarmerProfile.deleteMany({}),
      OfficerProfile.deleteMany({}),
      ShopkeeperProfile.deleteMany({}),
      Land.deleteMany({}),
      CropRegistration.deleteMany({}),
      CropRegistrationHistory.deleteMany({}),
      Shop.deleteMany({}),
      Product.deleteMany({}),
      ShopInventory.deleteMany({}),
      Review.deleteMany({}),
      GovernmentUpdate.deleteMany({}),
      RegistrationDeadline.deleteMany({}),
    ]);

    const salt = await bcrypt.genSalt(10);
    const farmerPasswordHash = await bcrypt.hash('farmer123', salt);
    const shopkeeperPasswordHash = await bcrypt.hash('shop123', salt);
    const officerPasswordHash = await bcrypt.hash('officer123', salt);

    // 1. Create Users
    const farmerUser = await User.create({
      name: 'Ramesh Patel',
      username: 'ramesh_farmer',
      email: 'farmer@farmsetu.com',
      phone: '+919848011223',
      passwordHash: farmerPasswordHash,
      roles: ['FARMER'],
      role: 'FARMER',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    });

    const shopkeeperUser = await User.create({
      name: 'Suresh Kumar',
      username: 'suresh_agro',
      email: 'shopkeeper@farmsetu.com',
      phone: '+919848044556',
      passwordHash: shopkeeperPasswordHash,
      roles: ['SHOPKEEPER'],
      role: 'SHOPKEEPER',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    });

    const officerUser = await User.create({
      name: 'Dr. V. Sharma',
      username: 'officer_vsharma',
      email: 'officer@farmsetu.com',
      phone: '+919848077889',
      passwordHash: officerPasswordHash,
      roles: ['OFFICER'],
      role: 'OFFICER',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
    });

    // 2. Create Role Profiles
    const farmerProfile = await FarmerProfile.create({
      userId: farmerUser._id,
      farmerId: 'FMR000123',
      village: 'Kankipadu',
      mandal: 'Penamaluru',
      district: 'Vijayawada',
      state: 'Andhra Pradesh',
      address: 'Plot 42, Main Road, Kankipadu Village, Krishna Dist',
      totalLandArea: 4.5,
      preferredCrop: 'Paddy',
      registrationStatus: 'VERIFIED',
      documents: {
        aadhaarDoc: {
          fileName: 'aadhaar_ramesh_verified.pdf',
          fileSize: '1.4 MB',
          fileType: 'image/svg+xml',
          fileData: sampleAadhaarData,
          status: 'Verified',
          uploadedAt: new Date()
        },
        passbookDoc: {
          fileName: 'bank_passbook_sbi_kankipadu.pdf',
          fileSize: '920 KB',
          fileType: 'image/svg+xml',
          fileData: samplePassbookData,
          status: 'Verified',
          uploadedAt: new Date()
        },
        landRecordDoc: {
          fileName: '1B_namoona_survey125_2.pdf',
          fileSize: '2.1 MB',
          fileType: 'image/svg+xml',
          fileData: sampleLandRecordData,
          status: 'Verified',
          uploadedAt: new Date()
        }
      }
    });

    const shopkeeperProfile = await ShopkeeperProfile.create({
      userId: shopkeeperUser._id,
      businessName: 'Sri Lakshmi Agro Agencies',
      primaryLocation: 'Vijayawada',
      tradeLicenseNo: 'AP-VJA-TL-2023-9092'
    });

    const officerProfile = await OfficerProfile.create({
      userId: officerUser._id,
      officerId: 'AGR-OFC-401',
      department: 'Department of Agriculture & Farmer Welfare',
      assignedArea: 'Penamaluru Mandal, Krishna District',
      mandal: 'Penamaluru',
      district: 'Vijayawada',
      state: 'Andhra Pradesh',
      licenseNumber: 'AP-AGRI-OFF-2024-8841',
      designation: 'Assistant Agricultural Officer (AAO)'
    });

    // 2.1 Seed Registration Deadline for Penamaluru Mandal (30 Days in future)
    const deadlineDate = new Date();
    deadlineDate.setDate(deadlineDate.getDate() + 30);
    deadlineDate.setHours(23, 59, 59, 999);

    await RegistrationDeadline.create({
      mandal: 'Penamaluru',
      district: 'Vijayawada',
      season: 'Kharif',
      year: 2026,
      deadlineDate: deadlineDate,
      description: 'Kharif 2026 Season Official Crop Registration & DBT Verification Window for Penamaluru Mandal.',
      setByOfficer: officerProfile._id,
      officerName: 'Dr. V. Sharma',
      isActive: true
    });

    // Also seed deadline for Vijayawada mandal
    await RegistrationDeadline.create({
      mandal: 'Vijayawada',
      district: 'Vijayawada',
      season: 'Kharif',
      year: 2026,
      deadlineDate: deadlineDate,
      description: 'Kharif 2026 Crop Pre-Registration Window for Vijayawada Mandal.',
      setByOfficer: officerProfile._id,
      officerName: 'Dr. V. Sharma',
      isActive: true
    });

    // 3. Create Land Parcels
    const land1 = await Land.create({
      farmerId: farmerProfile._id,
      surveyNumber: '125/2',
      village: 'Kankipadu',
      mandal: 'Penamaluru',
      district: 'Vijayawada',
      totalArea: 2.5,
      areaUnit: 'Acres',
      ownershipType: 'Owned'
    });

    const land2 = await Land.create({
      farmerId: farmerProfile._id,
      surveyNumber: '88/1',
      village: 'Kankipadu',
      mandal: 'Penamaluru',
      district: 'Vijayawada',
      totalArea: 2.0,
      areaUnit: 'Acres',
      ownershipType: 'Owned'
    });

    // 4. Create Crop Registrations & History
    const crop1 = await CropRegistration.create({
      registrationId: 'CRP20260101',
      farmerId: farmerProfile._id,
      landId: land1._id,
      cropName: 'Paddy (BPT 5204)',
      cropCategory: 'Cereals',
      surveyNumber: '125/2',
      cultivatedArea: 2.5,
      totalLandArea: 2.5,
      areaUnit: 'Acres',
      ownershipType: 'Owned',
      season: 'Kharif',
      year: 2026,
      sowingDate: new Date('2026-06-15'),
      harvestDate: new Date('2026-11-20'),
      irrigationType: 'Borewell',
      fertilizersUsed: 'Urea (2 Bags), DAP (1 Bag), Potash (1 Bag)',
      pesticidesUsed: 'Cartap Hydrochloride, Neem Oil 1500ppm',
      expectedHarvest: '45 Quintals',
      actualHarvest: 'Nil (In Progress)',
      priceSold: 'Pending Harvest',
      status: 'VERIFIED',
      officerComment: 'Survey matched and land boundaries verified on-site.',
      reviewedBy: officerProfile._id,
      submittedAt: new Date('2026-06-20'),
      reviewedAt: new Date('2026-06-24')
    });

    await CropRegistrationHistory.create([
      {
        registrationId: crop1._id,
        officerName: 'Farmer Ramesh Patel',
        action: 'SUBMITTED',
        comment: 'Submitted crop pre-registration digitally.',
        timestamp: new Date('2026-06-20')
      },
      {
        registrationId: crop1._id,
        officerId: officerProfile._id,
        officerName: 'Dr. V. Sharma (AAO)',
        action: 'VERIFIED',
        comment: 'Survey matched and land boundaries verified on-site.',
        timestamp: new Date('2026-06-24')
      }
    ]);

    const crop2 = await CropRegistration.create({
      registrationId: 'CRP20260102',
      farmerId: farmerProfile._id,
      landId: land2._id,
      cropName: 'Cotton (Bt-II)',
      cropCategory: 'Commercial / Cash',
      surveyNumber: '88/1',
      cultivatedArea: 1.8,
      totalLandArea: 2.0,
      areaUnit: 'Acres',
      ownershipType: 'Owned',
      season: 'Kharif',
      year: 2026,
      sowingDate: new Date('2026-07-02'),
      harvestDate: null,
      irrigationType: 'Canal',
      fertilizersUsed: 'DAP, Single Super Phosphate, Urea',
      pesticidesUsed: 'Chlorantraniliprole 18.5 SC',
      expectedHarvest: '22 Quintals',
      actualHarvest: 'Nil (Growing Stage)',
      priceSold: 'Pending Harvest',
      status: 'SUBMITTED',
      officerComment: '',
      submittedAt: new Date('2026-07-05')
    });

    await CropRegistrationHistory.create({
      registrationId: crop2._id,
      officerName: 'Farmer Ramesh Patel',
      action: 'SUBMITTED',
      comment: 'Submitted new Kharif Cotton application awaiting AAO review.',
      timestamp: new Date('2026-07-05')
    });

    const crop3 = await CropRegistration.create({
      registrationId: 'CRP20250101',
      farmerId: farmerProfile._id,
      landId: land1._id,
      cropName: 'Maize (Kaveri 50)',
      cropCategory: 'Cereals',
      surveyNumber: '125/2',
      cultivatedArea: 2.0,
      totalLandArea: 2.5,
      areaUnit: 'Acres',
      ownershipType: 'Owned',
      season: 'Rabi',
      year: 2025,
      sowingDate: new Date('2025-11-10'),
      harvestDate: new Date('2026-03-15'),
      irrigationType: 'Borewell',
      fertilizersUsed: 'Urea, Complex 20:20:0:13, Zinc',
      pesticidesUsed: 'Coragen, Emamectin Benzoate',
      expectedHarvest: '50 Quintals',
      actualHarvest: '48 Quintals',
      priceSold: '₹2,150 / Quintal',
      status: 'VERIFIED',
      officerComment: 'Harvest verified with local procurement center.',
      reviewedBy: officerProfile._id,
      submittedAt: new Date('2025-11-12'),
      reviewedAt: new Date('2025-11-18')
    });

    const crop4 = await CropRegistration.create({
      registrationId: 'CRP20250102',
      farmerId: farmerProfile._id,
      landId: land2._id,
      cropName: 'Red Chilli (Teja)',
      cropCategory: 'Horticulture',
      surveyNumber: '88/1',
      cultivatedArea: 1.5,
      totalLandArea: 2.0,
      areaUnit: 'Acres',
      ownershipType: 'Owned',
      season: 'Kharif',
      year: 2025,
      sowingDate: new Date('2025-08-01'),
      harvestDate: new Date('2026-01-20'),
      irrigationType: 'Drip Irrigation',
      fertilizersUsed: 'Water Soluble 19:19:19, Calcium Nitrate',
      pesticidesUsed: 'Fipronil, Neem Oil',
      expectedHarvest: '25 Quintals Dry Chilli',
      actualHarvest: '24 Quintals',
      priceSold: '₹18,500 / Quintal',
      status: 'RETURNED_FOR_CORRECTION',
      officerComment: 'Please upload the updated water source certification for drip subsidy mapping.',
      reviewedBy: officerProfile._id,
      submittedAt: new Date('2025-08-05'),
      reviewedAt: new Date('2025-08-10')
    });

    // 5. Create Shops
    // 5. Create Shops with Clear Geographic Proximity (Village -> Mandal -> District -> Other)
    const shop1 = await Shop.create({
      shopId: 'SHP1001',
      ownerId: shopkeeperUser._id,
      shopName: 'Kokilampadu Kisan Agro Center',
      location: 'Kokilampadu Village',
      address: 'Main Bazar Road, Kokilampadu Village, Tiruvuru Mandal, NTR District',
      imageUrl: 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=600&q=80',
      phone: '+91 98480 11223',
      ratingAverage: 4.9,
      ratingCount: 38
    });

    const shop2 = await Shop.create({
      shopId: 'SHP1002',
      ownerId: shopkeeperUser._id,
      shopName: 'Tiruvuru Rythu Seva Samithi',
      location: 'Tiruvuru Mandal',
      address: 'Near Old Bus Stand, Tiruvuru Mandal, NTR District',
      imageUrl: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=600&q=80',
      phone: '+91 98481 99887',
      ratingAverage: 4.7,
      ratingCount: 29
    });

    const shop3 = await Shop.create({
      shopId: 'SHP1003',
      ownerId: shopkeeperUser._id,
      shopName: 'Sri Lakshmi Agro Agencies',
      location: 'Vijayawada',
      address: 'Shop No. 14, Main Rythu Bazaar Road, Benz Circle, Vijayawada, NTR District',
      imageUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=600&q=80',
      phone: '+91 98482 33445',
      ratingAverage: 4.8,
      ratingCount: 52
    });

    const shop4 = await Shop.create({
      shopId: 'SHP1004',
      ownerId: shopkeeperUser._id,
      shopName: 'Penamaluru Grama Rythu Center',
      location: 'Penamaluru Mandal',
      address: 'Main Bandar Road, Penamaluru Mandal, Krishna District',
      imageUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80',
      phone: '+91 98483 55667',
      ratingAverage: 4.6,
      ratingCount: 22
    });

    const shop5 = await Shop.create({
      shopId: 'SHP1005',
      ownerId: shopkeeperUser._id,
      shopName: 'Balaji Fertilizers & Agro Chemicals',
      location: 'Guntur',
      address: 'Near Mirchi Yard, Ring Road, Guntur',
      imageUrl: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=600&q=80',
      phone: '+91 98484 77889',
      ratingAverage: 4.5,
      ratingCount: 15
    });

    const shop6 = await Shop.create({
      shopId: 'SHP1006',
      ownerId: shopkeeperUser._id,
      shopName: 'Deccan Agro Traders',
      location: 'Hyderabad',
      address: 'Kothapet Fruit Market Road, Hyderabad, Telangana',
      imageUrl: 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=600&q=80',
      phone: '+91 98485 99001',
      ratingAverage: 4.3,
      ratingCount: 10
    });

    // 6. Create Base Products
    const prodUrea = await Product.create({
      productId: 'PRD1001',
      name: 'Neem Coated Urea (45kg)',
      category: 'Fertilizer',
      description: 'IFFCO Neem Coated Urea providing 46% Nitrogen for healthy vegetative crop growth.',
      imageUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80',
      defaultUnit: 'Bag (45kg)',
      brand: 'IFFCO'
    });

    const prodDAP = await Product.create({
      productId: 'PRD1002',
      name: 'DAP 18:46:0 Di-Ammonium Phosphate',
      category: 'Fertilizer',
      description: 'Phosphatic fertilizer essential for strong root development and early plant vigor.',
      imageUrl: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=600&q=80',
      defaultUnit: 'Bag (50kg)',
      brand: 'Coromandel Gromor'
    });

    const prodPotash = await Product.create({
      productId: 'PRD1003',
      name: 'MOP Muriate of Potash 60% K2O',
      category: 'Fertilizer',
      description: 'Increases disease resistance, grain filling, and harvest quality.',
      imageUrl: 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=600&q=80',
      defaultUnit: 'Bag (50kg)',
      brand: 'IPL'
    });

    const prodPaddySeeds = await Product.create({
      productId: 'PRD1004',
      name: 'Certified Paddy Seeds (BPT 5204 / Samba Mahsuri)',
      category: 'Seeds',
      description: 'High yielding fine-grain variety with excellent cooking quality.',
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
      defaultUnit: 'Bag (25kg)',
      brand: 'AP State Seeds Corp'
    });

    const prodCottonSeeds = await Product.create({
      productId: 'PRD1005',
      name: 'Bollgard II Hybrid Cotton Seeds',
      category: 'Seeds',
      description: 'High-boll count hybrid seed with resistance to American bollworm.',
      imageUrl: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=600&q=80',
      defaultUnit: 'Packet (475g)',
      brand: 'Rasi Seeds'
    });

    const prodNeemPesticide = await Product.create({
      productId: 'PRD1006',
      name: 'Organic Neem Oil 1500 PPM EC',
      category: 'Pesticide',
      description: 'Natural broad-spectrum bio-pesticide repellent for aphids, thrips, and mites.',
      imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
      defaultUnit: 'Litre',
      brand: 'Multiplex Bio'
    });

    const prodCartap = await Product.create({
      productId: 'PRD1007',
      name: 'Cartap Hydrochloride 50% SP',
      category: 'Pesticide',
      description: 'Systemic insecticide highly effective for paddy stem borer and leaf folder.',
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
      defaultUnit: '500g Pack',
      brand: 'Dhanuka Agritech'
    });

    const prodSprayer = await Product.create({
      productId: 'PRD1008',
      name: '16L Battery Operated Knapsack Sprayer',
      category: 'Tools',
      description: '12V 8Ah battery, dual nozzle set with adjustable brass lance.',
      imageUrl: 'https://images.unsplash.com/photo-1590682680695-43b964a3ae17?auto=format&fit=crop&w=600&q=80',
      defaultUnit: 'Unit',
      brand: 'AgriStar Pro'
    });

    const prodTiller = await Product.create({
      productId: 'PRD1009',
      name: '7HP Petrol Power Weeder & Tiller',
      category: 'Machines',
      description: 'Heavy duty mini rotary tiller for inter-cultivation and de-weeding in orchards.',
      imageUrl: 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=600&q=80',
      defaultUnit: 'Machine',
      brand: 'VST Shakti'
    });

    const prodSoilTester = await Product.create({
      productId: 'PRD1010',
      name: '3-in-1 Soil pH, Moisture & Light Meter',
      category: 'Tools',
      description: 'Instant analog soil testing tool for direct field testing.',
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
      defaultUnit: 'Unit',
      brand: 'AgriTech Instrument'
    });

    // 7. Populate Shop Inventories (with realistic pricing & stock availability)
    await ShopInventory.create([
      // Shop 1: Sri Lakshmi Agro Agencies
      {
        shopId: shop1._id,
        productId: prodUrea._id,
        customName: 'IFFCO Neem Coated Urea',
        price: 267,
        quantity: 120,
        unit: 'Bag (45kg)',
        rating: 4.9,
        status: 'Full',
        imageUrl: prodUrea.imageUrl
      },
      {
        shopId: shop1._id,
        productId: prodDAP._id,
        customName: 'Gromor DAP 18:46:0',
        price: 1350,
        quantity: 60,
        unit: 'Bag (50kg)',
        rating: 4.8,
        status: 'In Stock',
        imageUrl: prodDAP.imageUrl
      },
      {
        shopId: shop1._id,
        productId: prodPaddySeeds._id,
        customName: 'Certified BPT 5204 Paddy Seeds',
        price: 850,
        quantity: 35,
        unit: 'Bag (25kg)',
        rating: 4.7,
        status: 'In Stock',
        imageUrl: prodPaddySeeds.imageUrl
      },
      {
        shopId: shop1._id,
        productId: prodNeemPesticide._id,
        customName: 'Organic Neem Oil 1500ppm',
        price: 380,
        quantity: 18,
        unit: 'Litre',
        rating: 4.6,
        status: 'In Stock',
        imageUrl: prodNeemPesticide.imageUrl
      },
      {
        shopId: shop1._id,
        productId: prodSprayer._id,
        customName: '16L Battery Knapsack Sprayer',
        price: 2400,
        quantity: 8,
        unit: 'Unit',
        rating: 4.8,
        status: 'In Stock',
        imageUrl: prodSprayer.imageUrl
      },
      {
        shopId: shop1._id,
        productId: prodTiller._id,
        customName: '7HP Petrol Power Tiller Machine',
        price: 48000,
        quantity: 2,
        unit: 'Machine',
        rating: 5.0,
        status: 'Low Stock',
        imageUrl: prodTiller.imageUrl
      },

      // Shop 2: Farm Needs (e.g. Urea Out of Stock here for comparison as specified in prompt Section 34!)
      {
        shopId: shop2._id,
        productId: prodUrea._id,
        customName: 'Neem Coated Urea',
        price: 265,
        quantity: 0,
        unit: 'Bag (45kg)',
        rating: 4.3,
        status: 'Out of Stock',
        imageUrl: prodUrea.imageUrl
      },
      {
        shopId: shop2._id,
        productId: prodPotash._id,
        customName: 'IPL MOP Potash 60%',
        price: 1600,
        quantity: 22,
        unit: 'Bag (50kg)',
        rating: 4.5,
        status: 'In Stock',
        imageUrl: prodPotash.imageUrl
      },
      {
        shopId: shop2._id,
        productId: prodCottonSeeds._id,
        customName: 'Rasi RCH 659 BG-II Cotton Seeds',
        price: 860,
        quantity: 50,
        unit: 'Packet',
        rating: 4.7,
        status: 'In Stock',
        imageUrl: prodCottonSeeds.imageUrl
      },
      {
        shopId: shop2._id,
        productId: prodCartap._id,
        customName: 'Cartap Hydrochloride 50 SP',
        price: 450,
        quantity: 14,
        unit: '500g Pack',
        rating: 4.6,
        status: 'In Stock',
        imageUrl: prodCartap.imageUrl
      },

      // Shop 3: Kisan Seva Kendra
      {
        shopId: shop3._id,
        productId: prodUrea._id,
        customName: 'Neem Coated Urea',
        price: 268,
        quantity: 80,
        unit: 'Bag (45kg)',
        rating: 4.8,
        status: 'In Stock',
        imageUrl: prodUrea.imageUrl
      },
      {
        shopId: shop3._id,
        productId: prodDAP._id,
        customName: 'IFFCO DAP 18:46:0',
        price: 1350,
        quantity: 45,
        unit: 'Bag (50kg)',
        rating: 4.9,
        status: 'In Stock',
        imageUrl: prodDAP.imageUrl
      },
      {
        shopId: shop3._id,
        productId: prodSoilTester._id,
        customName: 'Digital Soil pH & Moisture Tester',
        price: 650,
        quantity: 12,
        unit: 'Unit',
        rating: 4.6,
        status: 'In Stock',
        imageUrl: prodSoilTester.imageUrl
      },

      // Shop 4: Penamaluru Grama Rythu Center
      {
        shopId: shop4._id,
        productId: prodUrea._id,
        customName: 'IFFCO Neem Coated Urea',
        price: 266,
        quantity: 110,
        unit: 'Bag (45kg)',
        rating: 4.8,
        status: 'In Stock',
        imageUrl: prodUrea.imageUrl
      },
      {
        shopId: shop4._id,
        productId: prodDAP._id,
        customName: 'Gromor DAP 18:46:0',
        price: 1350,
        quantity: 40,
        unit: 'Bag (50kg)',
        rating: 4.7,
        status: 'In Stock',
        imageUrl: prodDAP.imageUrl
      },

      // Shop 5: Balaji Fertilizers (Guntur)
      {
        shopId: shop5._id,
        productId: prodUrea._id,
        customName: 'KRIBHCO Urea (Guntur Yard)',
        price: 270,
        quantity: 95,
        unit: 'Bag (45kg)',
        rating: 4.7,
        status: 'In Stock',
        imageUrl: prodUrea.imageUrl
      },
      {
        shopId: shop5._id,
        productId: prodPotash._id,
        customName: 'Muriate of Potash',
        price: 1580,
        quantity: 30,
        unit: 'Bag (50kg)',
        rating: 4.5,
        status: 'In Stock',
        imageUrl: prodPotash.imageUrl
      },

      // Shop 6: Deccan Agro Traders (Hyderabad)
      {
        shopId: shop6._id,
        productId: prodUrea._id,
        customName: 'Nagarjuna Urea (Hyderabad Market)',
        price: 275,
        quantity: 50,
        unit: 'Bag (45kg)',
        rating: 4.3,
        status: 'In Stock',
        imageUrl: prodUrea.imageUrl
      }
    ]);

    // 8. Create Reviews
    await Review.create([
      {
        farmerId: farmerUser._id,
        farmerName: 'Ramesh Patel',
        shopId: shop1._id,
        rating: 5,
        comment: 'Very reliable store. Genuine IFFCO fertilizers and certified BPT paddy seeds available at government controlled prices.'
      },
      {
        farmerId: farmerUser._id,
        farmerName: 'Ramesh Patel',
        shopId: shop3._id,
        rating: 4,
        comment: 'Quick service and helpful advice on organic pesticide application.'
      }
    ]);

    // 9. Create Government Updates / Schemes
    await GovernmentUpdate.create([
      {
        title: 'PM-KISAN: 17th Installment Financial Assistance Disbursed',
        description: 'Direct financial assistance of ₹2,000 released into verified Aadhaar-seeded bank accounts of eligible landholder farmers across India. Complete your e-KYC if payment is pending.',
        category: 'Financial Assistance',
        state: 'All India / National',
        targetCrops: ['All Crops', 'Paddy', 'Wheat', 'Cotton'],
        season: 'Kharif',
        publishedDate: new Date('2026-07-28'),
        source: 'Ministry of Agriculture & Farmers Welfare, Govt. of India',
        officialUrl: 'https://pmkisan.gov.in',
        imageUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=600&q=80',
        keyBenefits: ['₹6,000 per year in 3 tranches', 'Direct DBT transfer', 'Automatic farmer portal verification'],
        deadline: 'Ongoing Enrollment'
      },
      {
        title: 'PMFBY Kharif 2026 Crop Insurance Registration Extended',
        description: 'Last date for enrolment under Pradhan Mantri Fasal Bima Yojana (PMFBY) for Paddy, Cotton, and Maize extended. Premium rate capped at 2% for food & oilseed crops and 5% for commercial/horticulture crops.',
        category: 'Crop Insurance',
        state: 'Andhra Pradesh',
        targetCrops: ['Paddy', 'Cotton', 'Maize', 'Chilli'],
        season: 'Kharif',
        publishedDate: new Date('2026-07-15'),
        source: 'AP Department of Agriculture & Sachivalayam Portal',
        officialUrl: 'https://pmfby.gov.in',
        imageUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80',
        keyBenefits: ['Comprehensive risk coverage against drought, flood, pests', 'Affordable subsidized premium', 'Quick claim settlement via satellite mapping'],
        deadline: 'August 31, 2026'
      },
      {
        title: 'Nano Urea & Nano DAP Special Subsidy Announcement',
        description: 'Government approves additional 25% incentive on Liquid Nano Urea and Nano DAP bottles to reduce traditional fertilizer bulk transport costs and improve nutrient efficiency.',
        category: 'Fertilizer',
        state: 'All India / National',
        targetCrops: ['Paddy', 'Wheat', 'Vegetables', 'Commercial / Cash'],
        season: 'Kharif',
        publishedDate: new Date('2026-06-20'),
        source: 'Department of Fertilizers, Ministry of Chemicals & Fertilizers',
        officialUrl: 'https://fert.nic.in',
        imageUrl: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=600&q=80',
        keyBenefits: ['1 bottle of Nano Urea equals 1 bag of traditional urea', 'Eco-friendly foliar spray', 'Reduced soil toxicity'],
        deadline: 'Valid for Kharif & Rabi 2026'
      },
      {
        title: 'Sub-Mission on Agricultural Mechanization (SMAM) Subsidy Window Open',
        description: 'Farmers and Custom Hiring Centers (CHCs) can apply for 40% to 50% subsidy on purchase of power tillers, rotavators, battery sprayers, and combine harvesters.',
        category: 'Farmer Schemes',
        state: 'Andhra Pradesh',
        targetCrops: ['All Crops', 'Paddy', 'Commercial / Cash'],
        season: 'Annual',
        publishedDate: new Date('2026-06-10'),
        source: 'Agricultural Mechanization Division, Govt. of AP',
        officialUrl: 'https://agrimachinery.nic.in',
        imageUrl: 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=600&q=80',
        keyBenefits: ['Up to ₹50,000 subsidy on power tillers', 'Full online application tracking', 'Direct vendor credit'],
        deadline: 'September 15, 2026'
      },
      {
        title: 'Soil Health Card 2026 Distribution & Free Micro-Nutrient Kits',
        description: 'District Agricultural Offices to begin distribution of updated Soil Health Cards and free zinc sulphate / gypsum kits for fields showing micronutrient deficiencies.',
        category: 'Agriculture',
        state: 'Andhra Pradesh',
        targetCrops: ['Paddy', 'Chilli', 'Cotton', 'Pulses'],
        season: 'Kharif',
        publishedDate: new Date('2026-05-25'),
        source: 'State Agricultural Extension Services',
        officialUrl: 'https://soilhealth.dac.gov.in',
        imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
        keyBenefits: ['Customized dosage guidelines', 'Prevents excess urea expenditure', 'Improves yield by 15-20%'],
        deadline: 'Ongoing at Rythu Bharosa Kendras'
      }
    ]);

    console.log('✅ FarmSetu Database successfully seeded!');
    console.log('🌾 Demo Accounts Ready:');
    console.log('  👨‍🌾 Farmer:     farmer@farmsetu.com / farmer123');
    console.log('  🏪 Shopkeeper: shopkeeper@farmsetu.com / shop123');
    console.log('  🏛️ Officer:    officer@farmsetu.com / officer123');
  } catch (error) {
    console.error('❌ Database Seeding Error:', error);
  }
};
