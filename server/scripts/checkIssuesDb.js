import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const issueSchema = new mongoose.Schema({}, { strict: false });
const VerificationIssue = mongoose.model('VerificationIssue', issueSchema, 'verificationissues');

const landSchema = new mongoose.Schema({}, { strict: false });
const Land = mongoose.model('Land', landSchema, 'lands');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const issues = await VerificationIssue.find().sort({ createdAt: -1 });
  console.log(`Total verification issues in DB: ${issues.length}`);
  issues.forEach(i => {
    console.log(`- ID: ${i._id}, Land: ${i.landId}, Level: ${i.issueLevel}, Status: ${i.status}, Description: "${i.description}", Created: ${i.createdAt}`);
  });

  const lands = await Land.find();
  console.log(`\nLands in DB: ${lands.length}`);
  lands.forEach(l => {
    console.log(`- Land ID: ${l._id}, Survey: ${l.surveyNumber}, LandCode: ${l.landId}, Status: ${l.overallVerificationStatus}`);
  });

  await mongoose.disconnect();
}

main().catch(console.error);
