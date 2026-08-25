import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from './models/User.js';
import { FarmerProfile } from './models/FarmerProfile.js';
import { ShopkeeperProfile } from './models/ShopkeeperProfile.js';
import { OfficerProfile } from './models/OfficerProfile.js';
import { registerUser, loginUser, switchRole } from './controllers/authController.js';
import jwt from 'jsonwebtoken';

async function runTests() {
  console.log('🧪 Starting FarmSetu Multi-Role Authentication Verification Suite...\n');
  process.env.JWT_SECRET = 'test_secret_key_farmsetu_2026';

  const mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  console.log('✅ Connected to in-memory test database');

  const mockRes = () => {
    const res = {
      statusCode: 200,
      jsonData: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.jsonData = data;
        return this;
      }
    };
    return res;
  };

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
    }
  }

  // =========================================================================
  // TEST 1: New person registers as FARMER
  // =========================================================================
  console.log('\n--- TEST 1: New person registers as FARMER ---');
  {
    const req = {
      body: {
        name: 'Reshma',
        username: 'reshma_agri',
        email: 'reshma@gmail.com',
        phone: '9876543210',
        password: 'Password@123',
        role: 'FARMER',
        village: 'Kankipadu',
        district: 'Vijayawada'
      }
    };
    const res = mockRes();
    await registerUser(req, res);

    assert(res.statusCode === 201, `Status code is 201 (got ${res.statusCode})`);
    assert(res.jsonData.success === true, 'Response is successful');
    assert(res.jsonData.user.roles.includes('FARMER'), 'User has FARMER role in roles array');
    assert(res.jsonData.user.role === 'FARMER', 'Active role is FARMER');

    const usersCount = await User.countDocuments();
    assert(usersCount === 1, `Single user in database (got ${usersCount})`);

    const farmerProfile = await FarmerProfile.findOne({ userId: res.jsonData.user._id });
    assert(farmerProfile !== null, 'FarmerProfile document created and linked to userId');
  }

  // =========================================================================
  // TEST 2: Same email/phone registers as SHOPKEEPER (Adds role, 1 User document)
  // =========================================================================
  console.log('\n--- TEST 2: Same person registers as SHOPKEEPER ---');
  {
    const req = {
      body: {
        name: 'Reshma',
        username: 'reshma_agri',
        email: 'reshma@gmail.com',
        phone: '9876543210',
        password: 'Password@123',
        role: 'SHOPKEEPER',
        businessName: 'Reshma Seeds & Agro Center'
      }
    };
    const res = mockRes();
    await registerUser(req, res);

    assert(res.statusCode === 200, `Status code is 200 (got ${res.statusCode})`);
    assert(res.jsonData.success === true, 'Role successfully added');

    const usersCount = await User.countDocuments();
    assert(usersCount === 1, `STILL ONLY ONE user document in database (got ${usersCount})`);

    const userInDb = await User.findOne({ email: 'reshma@gmail.com' });
    assert(userInDb.roles.length === 2, `User now has 2 roles: ${JSON.stringify(userInDb.roles)}`);
    assert(userInDb.roles.includes('FARMER') && userInDb.roles.includes('SHOPKEEPER'), 'Roles array has [FARMER, SHOPKEEPER]');

    const shopProfile = await ShopkeeperProfile.findOne({ userId: userInDb._id });
    assert(shopProfile !== null, 'ShopkeeperProfile created with same userId');
    assert(shopProfile.businessName === 'Reshma Seeds & Agro Center', 'ShopkeeperProfile businessName matches');

    const farmerProfile = await FarmerProfile.findOne({ userId: userInDb._id });
    assert(farmerProfile !== null, 'FarmerProfile still exists for same userId');
  }

  // =========================================================================
  // TEST 3: Same person logs in as FARMER
  // =========================================================================
  console.log('\n--- TEST 3: Multi-role person logs in as FARMER ---');
  {
    const req = {
      body: {
        identifier: 'reshma@gmail.com',
        password: 'Password@123',
        role: 'FARMER'
      }
    };
    const res = mockRes();
    await loginUser(req, res);

    assert(res.statusCode === 200, 'Farmer login succeeded');
    assert(res.jsonData.user.role === 'FARMER', 'Session role is FARMER');
    assert(res.jsonData.user.roles.length === 2, 'User roles contain both roles');

    const decoded = jwt.verify(res.jsonData.token, process.env.JWT_SECRET);
    assert(decoded.role === 'FARMER', 'JWT token payload contains role: FARMER');
  }

  // =========================================================================
  // TEST 4: Same person logs in as SHOPKEEPER
  // =========================================================================
  console.log('\n--- TEST 4: Multi-role person logs in as SHOPKEEPER ---');
  {
    const req = {
      body: {
        identifier: '9876543210', // Log in via phone
        password: 'Password@123',
        role: 'SHOPKEEPER'
      }
    };
    const res = mockRes();
    await loginUser(req, res);

    assert(res.statusCode === 200, 'Shopkeeper login succeeded via mobile number');
    assert(res.jsonData.user.role === 'SHOPKEEPER', 'Session role is SHOPKEEPER');

    const decoded = jwt.verify(res.jsonData.token, process.env.JWT_SECRET);
    assert(decoded.role === 'SHOPKEEPER', 'JWT token payload contains role: SHOPKEEPER');
  }

  // =========================================================================
  // TEST 5: Same person tries to register as SHOPKEEPER again (Duplicate role)
  // =========================================================================
  console.log('\n--- TEST 5: Same person tries to register as SHOPKEEPER again ---');
  {
    const req = {
      body: {
        name: 'Reshma',
        username: 'reshma_agri',
        email: 'reshma@gmail.com',
        phone: '9876543210',
        password: 'Password@123',
        role: 'SHOPKEEPER',
        businessName: 'Another Store'
      }
    };
    const res = mockRes();
    await registerUser(req, res);

    assert(res.statusCode === 400, `Rejected with 400 (got ${res.statusCode})`);
    assert(res.jsonData.success === false, 'Registration failed as expected');
    assert(res.jsonData.message.includes('already exists for this account'), `Clear error message: "${res.jsonData.message}"`);

    const usersCount = await User.countDocuments();
    assert(usersCount === 1, `Total user documents remained 1 (got ${usersCount})`);
  }

  // =========================================================================
  // TEST 6: User with only FARMER role tries to log in as SHOPKEEPER
  // =========================================================================
  console.log('\n--- TEST 6: User with only FARMER role tries to log in as SHOPKEEPER ---');
  {
    // Create another user with only FARMER role
    const regReq = {
      body: {
        name: 'Kiran',
        username: 'kiran_farmer',
        email: 'kiran@gmail.com',
        phone: '9123456780',
        password: 'Password@123',
        role: 'FARMER'
      }
    };
    const regRes = mockRes();
    await registerUser(regReq, regRes);

    const loginReq = {
      body: {
        identifier: 'kiran@gmail.com',
        password: 'Password@123',
        role: 'SHOPKEEPER'
      }
    };
    const loginRes = mockRes();
    await loginUser(loginReq, loginRes);

    assert(loginRes.statusCode === 403, `Login rejected with 403 (got ${loginRes.statusCode})`);
    assert(loginRes.jsonData.success === false, 'Access denied as expected');
    assert(loginRes.jsonData.message.includes('not for the Shopkeeper role'), `Clear feedback: "${loginRes.jsonData.message}"`);
  }

  // =========================================================================
  // TEST 7: Two different people have the same name (Name is NOT unique)
  // =========================================================================
  console.log('\n--- TEST 7: Two different people have the same name ---');
  {
    const reqA = {
      body: {
        name: 'Ravi Kumar',
        username: 'ravi_k1',
        email: 'ravi1@gmail.com',
        phone: '9900112233',
        password: 'Password@123',
        role: 'FARMER'
      }
    };
    const resA = mockRes();
    await registerUser(reqA, resA);

    const reqB = {
      body: {
        name: 'Ravi Kumar', // Same name!
        username: 'ravi_k2',
        email: 'ravi2@gmail.com',
        phone: '9900112244',
        password: 'Password@123',
        role: 'FARMER'
      }
    };
    const resB = mockRes();
    await registerUser(reqB, resB);

    assert(resA.statusCode === 201, 'User A created successfully');
    assert(resB.statusCode === 201, 'User B created successfully with same name');
    assert(resA.jsonData.user._id.toString() !== resB.jsonData.user._id.toString(), 'Both have distinct user IDs');
  }

  // =========================================================================
  // TEST 8: Email belongs to User A, but Phone belongs to User B (Identity Conflict)
  // =========================================================================
  console.log('\n--- TEST 8: Email belongs to User A, but Phone belongs to User B ---');
  {
    const req = {
      body: {
        name: 'Conflicted User',
        username: 'conflict_test',
        email: 'ravi1@gmail.com', // Belongs to ravi1
        phone: '9900112244',     // Belongs to ravi2
        password: 'Password@123',
        role: 'SHOPKEEPER'
      }
    };
    const res = mockRes();
    await registerUser(req, res);

    assert(res.statusCode === 409, `Rejected with 409 Conflict (got ${res.statusCode})`);
    assert(res.jsonData.success === false, 'Conflict handled safely');
    assert(res.jsonData.message.includes('Identity conflict'), `Conflict message: "${res.jsonData.message}"`);
  }

  // =========================================================================
  // TEST 9: Role Switch Endpoint
  // =========================================================================
  console.log('\n--- TEST 9: Seamless Role Switch ---');
  {
    const user = await User.findOne({ email: 'reshma@gmail.com' });
    const req = {
      user: user,
      body: { targetRole: 'FARMER' }
    };
    const res = mockRes();
    await switchRole(req, res);

    assert(res.statusCode === 200, 'Switched to FARMER role');
    assert(res.jsonData.user.role === 'FARMER', 'User active role is now FARMER');

    const decoded = jwt.verify(res.jsonData.token, process.env.JWT_SECRET);
    assert(decoded.role === 'FARMER', 'New token generated for FARMER');
  }

  console.log(`\n=========================================`);
  console.log(`🎯 Test Summary: ${passed}/${total} assertions PASSED`);
  console.log(`=========================================\n`);

  await mongoose.disconnect();
  await mongod.stop();
  process.exit(passed === total ? 0 : 1);
}

runTests().catch((err) => {
  console.error('Test runner failed:', err);
  process.exit(1);
});
