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
        aadhaarDoc: { fileName: 'aadhaar_ramesh_verified.pdf', status: 'Verified', uploadedAt: new Date() },
        passbookDoc: { fileName: 'bank_passbook_sbi_kankipadu.pdf', status: 'Verified', uploadedAt: new Date() },
        landRecordDoc: { fileName: '1B_namoona_survey125_2.pdf', status: 'Verified', uploadedAt: new Date() }
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
      assignedArea: 'Vijayawada Mandal, Krishna District',
      district: 'Vijayawada',
      state: 'Andhra Pradesh',
      licenseNumber: 'AP-AGRI-OFF-2024-8841',
      designation: 'Assistant Agricultural Officer (AAO)'
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
    const shop1 = await Shop.create({
      shopId: 'SHP1001',
      ownerId: shopkeeperUser._id,
      shopName: 'Sri Lakshmi Agro Agencies',
      location: 'Vijayawada',
      address: 'Shop No. 14, Main Rythu Bazaar Road, Benz Circle, Vijayawada',
      imageUrl: 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=600&q=80',
      phone: '+91 98480 44556',
      ratingAverage: 4.8,
      ratingCount: 24
    });

    const shop2 = await Shop.create({
      shopId: 'SHP1002',
      ownerId: shopkeeperUser._id,
      shopName: 'Farm Needs & Seeds Center',
      location: 'Vijayawada',
      address: 'Near Old Bus Stand, Governorpet, Vijayawada',
      imageUrl: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=600&q=80',
      phone: '+91 98481 99887',
      ratingAverage: 4.5,
      ratingCount: 18
    });

    const shop3 = await Shop.create({
      shopId: 'SHP1003',
      ownerId: shopkeeperUser._id,
      shopName: 'Kisan Seva Kendra',
      location: 'Mangalagiri',
      address: 'Opp. APCO Showroom, GT Road, Mangalagiri',
      imageUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=600&q=80',
      phone: '+91 98482 33445',
      ratingAverage: 4.7,
      ratingCount: 31
    });

    const shop4 = await Shop.create({
      shopId: 'SHP1004',
      ownerId: shopkeeperUser._id,
      shopName: 'Balaji Fertilizers & Agro Chemicals',
      location: 'Guntur',
      address: 'Near Mirchi Yard, Ring Road, Guntur',
      imageUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80',
      phone: '+91 98483 55667',
      ratingAverage: 4.6,
      ratingCount: 42
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

      // Shop 4: Balaji Fertilizers
      {
        shopId: shop4._id,
        productId: prodUrea._id,
        customName: 'KRIBHCO Urea',
        price: 270,
        quantity: 95,
        unit: 'Bag (45kg)',
        rating: 4.7,
        status: 'In Stock',
        imageUrl: prodUrea.imageUrl
      },
      {
        shopId: shop4._id,
        productId: prodPotash._id,
        customName: 'Muriate of Potash',
        price: 1580,
        quantity: 30,
        unit: 'Bag (50kg)',
        rating: 4.5,
        status: 'In Stock',
        imageUrl: prodPotash.imageUrl
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
