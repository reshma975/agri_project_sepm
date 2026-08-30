import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const issueSchema = new mongoose.Schema({}, { strict: false });
const VerificationIssue = mongoose.model('VerificationIssue', issueSchema, 'verificationissues');

async function cleanDuplicates() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Find all open issues
  const openIssues = await VerificationIssue.find({ status: 'OPEN' }).sort({ createdAt: 1 });
  console.log(`Found ${openIssues.length} open issues.`);

  const seen = new Set();
  const toDelete = [];

  for (const issue of openIssues) {
    const key = `${issue.landId}_${issue.cropId || 'LAND'}_${issue.issueLevel}_${(issue.description || '').trim().toLowerCase()}`;
    if (seen.has(key)) {
      console.log(`Duplicate detected to delete: ID ${issue._id}, description: "${issue.description}"`);
      toDelete.push(issue._id);
    } else {
      seen.add(key);
    }
  }

  if (toDelete.length > 0) {
    const res = await VerificationIssue.deleteMany({ _id: { $in: toDelete } });
    console.log(`Deleted ${res.deletedCount} duplicate issue(s).`);
  } else {
    console.log('No duplicates found.');
  }

  const remaining = await VerificationIssue.find().sort({ createdAt: -1 });
  console.log(`\nRemaining verification issues: ${remaining.length}`);
  remaining.forEach(i => {
    console.log(`- ID: ${i._id}, Land: ${i.landId}, Status: ${i.status}, Description: "${i.description}"`);
  });

  await mongoose.disconnect();
}

cleanDuplicates().catch(console.error);
