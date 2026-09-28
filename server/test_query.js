import dotenv from 'dotenv';
dotenv.config();
import { processAgriculturalQuery } from './services/assistantService.js';

async function test() {
  console.log('=== TEST 1: Cotton Query ===');
  const r1 = await processAgriculturalQuery('Cotton fertilizer and management per acre');
  console.log('Answer:\n', r1.answer);
  console.log('Has asterisk?', r1.answer.includes('*'));

  console.log('\n=== TEST 2: Off-topic (Politics) ===');
  const r2 = await processAgriculturalQuery('Who is the Prime Minister of India?');
  console.log('Answer:\n', r2.answer);

  console.log('\n=== TEST 3: Off-topic (Coding) ===');
  const r3 = await processAgriculturalQuery('Write a Python function to sort numbers');
  console.log('Answer:\n', r3.answer);

  console.log('\n=== TEST 4: Guava Care ===');
  const r4 = await processAgriculturalQuery('Guava pest management');
  console.log('Answer:\n', r4.answer);
  console.log('Has asterisk?', r4.answer.includes('*'));
}

test();
