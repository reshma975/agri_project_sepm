import { GoogleGenerativeAI } from '@google/generative-ai';

// Clean text helper: removes markdown asterisks, raw header syntax, and divider lines
export const cleanAssistantResponse = (text = '') => {
  if (!text) return '';
  return text
    // Strip bold/italic markdown asterisks: ***text*** -> text, **text** -> text, *text* -> text
    .replace(/\*\*\*(.*?)\*\*\*/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    // Remove any remaining lone asterisks
    .replace(/\*/g, '')
    // Remove markdown headers: ### Header -> Header
    .replace(/^#{1,6}\s+/gm, '')
    // Remove horizontal rules like ---, ___, ===
    .replace(/^[-=_]{2,}\s*$/gm, '')
    // Convert - or + list bullets to clean •
    .replace(/^[\-\+]\s+/gm, '• ')
    // Normalize multiple newlines
    .replace(/\n{3,}/g, '\n\n')
    // Clean each line
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    .trim();
};

// Check if a query is non-agricultural to enforce strict domain guardrails
export const isNonAgriculturalQuery = (query = '') => {
  const q = query.toLowerCase().trim();
  if (!q) return false;

  // Agricultural keywords that validate the query as agriculture-related
  const agriKeywords = [
    'crop', 'farm', 'farmer', 'farming', 'agriculture', 'agro', 'soil', 'seed', 'seedling',
    'pest', 'disease', 'insect', 'fungus', 'rot', 'wilt', 'blight', 'fertilizer', 'urea',
    'dap', 'potash', 'mop', 'ssp', 'npk', 'zinc', 'boron', 'micronutrient', 'organic',
    'fym', 'manure', 'vermicompost', 'neem', 'paddy', 'rice', 'wheat', 'cotton', 'kapas',
    'chilli', 'mirchi', 'guava', 'amrood', 'jaama', 'mango', 'aam', 'tomato', 'tamatar',
    'maize', 'corn', 'sugarcane', 'groundnut', 'peanut', 'pulse', 'gram', 'turmeric',
    'onion', 'potato', 'banana', 'papaya', 'brinjal', 'okra', 'bhendi', 'lemon', 'citrus',
    'mustard', 'soybean', 'vegetable', 'fruit', 'plant', 'tree', 'orchard', 'irrigation',
    'water', 'borewell', 'rain', 'weather', 'monsoon', 'harvest', 'yield', 'sowing',
    'transplant', 'pruning', 'spray', 'spraying', 'pesticide', 'fungicide', 'herbicide',
    'weed', 'weedicide', 'subsidy', 'scheme', 'pm-kisan', 'pm kisan', 'pmfby', 'kcc',
    'kisan credit', 'mandi', 'msp', 'market price', 'apmc', 'enam', 'e-nam', 'rythu',
    'tractor', 'drip', 'sprinkler', 'bollworm', 'stem borer', 'hopper', 'thrips', 'aphid',
    'whitefly', 'leaf curl', 'trichoderma', 'pseudomonas', 'jeevamrut', 'panchagavya',
    'acre', 'hectare', 'tonnes', 'quintal', 'cultivation', 'plantation', 'nurseries', 'land'
  ];

  const containsAgri = agriKeywords.some(keyword => q.includes(keyword));
  if (containsAgri) return false;

  // Explicit non-agricultural triggers
  const nonAgriTriggers = [
    'movie', 'actor', 'actress', 'cinema', 'film', 'song', 'music', 'dance', 'cricket',
    'football', 'sports', 'game', 'gaming', 'playstation', 'code', 'coding', 'python',
    'javascript', 'java', 'html', 'css', 'react', 'program', 'programming', 'algorithm',
    'politics', 'politician', 'election', 'minister', 'president', 'prime minister',
    'bitcoin', 'crypto', 'stock market', 'trading', 'crypto', 'love', 'girlfriend',
    'boyfriend', 'dating', 'marriage', 'joke', 'story', 'poem', 'history of war',
    'who is', 'recipe for', 'cook food', 'car', 'bike', 'mobile phone', 'laptop',
    'travel', 'hotel', 'flight', 'instagram', 'facebook', 'youtube', 'tiktok'
  ];

  return nonAgriTriggers.some(trigger => q.includes(trigger));
};

const OFF_TOPIC_REFUSAL = {
  answer: '🌾 Namaste! I am FarmSetu AI, dedicated exclusively to agriculture and farming. Please ask questions related to crops, fertilizers, pest control, soil management, irrigation, or government farming schemes.',
  suggestions: [
    'What fertilizer is suitable for paddy?',
    'How to control pink bollworm in cotton?',
    'Remedies for leaf curl in chilli',
    'PM-KISAN scheme eligibility details'
  ],
  topic: 'FarmSetu Agricultural Assistant'
};

// Curated concise agricultural knowledge base (100% Asterisk-Free, <90 words)
const AGRICULTURAL_KNOWLEDGE = {
  guava: {
    title: 'Guava Cultivation & Crop Care Guide (Amarud / Jaama)',
    matches: ['guava', 'amrood', 'amarud', 'jaama', 'psidium', 'lucknow 49', 'l-49', 'sardar guava', 'safeda'],
    response: `🍈 Guava Crop Care Advisory:
• Varieties: Lucknow 49 (Sardar), Allahabad Safeda, Lalit, and Taiwan Pink.
• Bahar Management: Mrig Bahar (withhold water in April–May for Nov–Jan harvest) gives highest sweetness and prevents fruit fly.
• Fertilizer (4+ yrs tree): 30 kg FYM + 500g Urea + 350g DAP + 400g MOP in June & October. Spray 0.5% Zinc Sulphate at flowering.
• Fruit Fly Control: Install Methyl Eugenol Pheromone Traps (6 per acre). Drench roots with Trichoderma viride for wilt prevention.`,
    suggestions: [
      'Fertilizer dosage for guava tree',
      'How to do Bahar treatment in guava?',
      'How to control fruit fly in guava?',
      'Subsidy for drip irrigation in guava'
    ]
  },

  mango: {
    title: 'Mango Orchard Care & Flowering Advisory',
    matches: ['mango', 'aam', 'banganapalli', 'alphonso', 'totapuri', 'dasheri', 'kesar'],
    response: `🥭 Mango Orchard Advisory:
• Flowering & Fruit Retention: Spray Planofix (4 ml per 15L water) at full bloom. Apply 0.5% Potassium Nitrate (13-0-45) during panicle emergence.
• Hopper & Thrips Control: Spray Thiamethoxam 25 WG (0.3 g/L) or Imidacloprid 17.8 SL (0.3 ml/L) before flower opening.
• Powdery Mildew: Spray Hexaconazole 5 EC (1 ml/L) or Wettable Sulphur (2 g/L) at first symptom.
• Fertilizer Dose: 50 kg FYM + 2 kg Urea + 3 kg SSP + 1.5 kg MOP in a ring trench after harvest.`,
    suggestions: ['How to control mango hopper?', 'Pruning after mango harvest', 'Fruit fly management in mango']
  },

  paddy: {
    title: 'Paddy (Rice) Nutrition & Pest Advisory',
    matches: ['paddy', 'rice', 'dhan', 'bpt', 'mtu', 'swarna', 'samba', 'stem borer', 'blast'],
    response: `🌾 Paddy (Rice) Advisory:
• Fertilizer Dose (Per Acre): Basal: 50 kg DAP + 25 kg MOP + 20 kg Urea. Tillering Stage: 30 kg Urea + 10 kg Zinc Sulphate. Panicle Stage: 20 kg Urea.
• Stem Borer: Apply Cartap Hydrochloride 4G granules (10 kg/acre) or spray Chlorantraniliprole 18.5 SC (0.3 ml/L).
• Blast Disease: Spray Tricyclazole 75 WP (0.6 g/L) or Isoprothiolane 40 EC (1.5 ml/L).
• BPH (Brown Planthopper): Drain water for 3 days; spray Pymetrozine 50 WDG (0.6 g/L) at plant base.`,
    suggestions: ['How to control BPH in paddy?', 'Zinc deficiency treatment in paddy', 'Paddy MSP rates 2026']
  },

  cotton: {
    title: 'Cotton Crop Protection & Nutrition Advisory',
    matches: ['cotton', 'kapas', 'patti', 'bollworm', 'pink bollworm', 'sucking pest'],
    response: `🌱 Cotton Crop Advisory:
• Spacing: 90 x 60 cm (7,400 plants/acre) or 120 x 45 cm in heavy black soils.
• Pink Bollworm: Install PBLure Pheromone Traps @ 8 traps/acre from 45 DAS. Spray Profenofos 50 EC (2 ml/L) or Emamectin Benzoate 5 SG (0.5 g/L).
• Sucking Pests (Whitefly/Thrips): Spray Flonicamid 50 WG (0.4 g/L) or Diafenthiuron 50 WP (1.2 g/L).
• Boll Drop Prevention: Foliar spray of Planofix (4 ml/15L) + 1% Potassium Nitrate (13-0-45) at 60 & 75 DAS.`,
    suggestions: ['Pink bollworm organic remedy', 'Fertilizer schedule for Bt cotton', 'Whitefly control in cotton']
  },

  chilli: {
    title: 'Chilli Crop & Yellow Leaf / Thrips Protection',
    matches: ['chilli', 'chilli yellow', 'mirchi', 'thrips', 'mites', 'leaf curl', 'murda'],
    response: `🌶️ Chilli (Mirchi) Advisory:
• Leaf Curl (Thrips): Upward curling – Spray Spinetoram 11.7 SC (0.9 ml/L) or Fipronil 5 SC (2 ml/L). Install blue sticky traps (15/acre).
• Mites: Downward curling – Spray Diafenthiuron 50 WP (1.2 g/L) or Spiromesifen 22.9 SC (1 ml/L).
• Fertilizer Dose: NPK 120:60:60 kg/ha with micronutrient spray (Zinc + Boron 0.2%) at 30, 60, and 90 days after transplanting.
• Fruit Rot / Dieback: Spray Azoxystrobin + Difenoconazole (1 ml/L).`,
    suggestions: ['How to control black thrips in chilli?', 'Foliar spray for red chilli yield', 'Chilli drip fertigation schedule']
  },

  tomato: {
    title: 'Tomato Production & Blight Advisory',
    matches: ['tomato', 'tamatar', 'early blight', 'late blight', 'fruit borer', 'tuta'],
    response: `🍅 Tomato Crop Advisory:
• Blight Control: Spray Mancozeb 75 WP (2.5 g/L) preventively; for severe late blight use Cymoxanil 8% + Mancozeb 64% (2.5 g/L).
• Fruit Borer: Spray Chlorantraniliprole 18.5 SC (0.3 ml/L) or Bacillus thuringiensis (1.5 g/L).
• Blossom End Rot: Spray Calcium Nitrate (5 g/L) + Boron (1 g/L) during fruit set.
• Spacing: 60 x 45 cm on raised beds with staking for optimal yield.`,
    suggestions: ['How to prevent tomato leaf curl virus?', 'Calcium spray for tomato fruit rot', 'Drip fertigation in tomato']
  },

  fertilizers: {
    title: 'Balanced Fertilization & Soil Health Advisory',
    matches: ['fertilizer', 'urea', 'dap', 'potash', 'mop', 'npk', 'zinc', 'micronutrient', 'dosage', 'soil test'],
    response: `🧪 Scientific Fertilizer Advisory (4R Rules):
• Basal Dose: Apply all Phosphorus (DAP/SSP) and Potash (MOP) at sowing near root zone.
• Split Nitrogen: Apply Urea in 2–3 splits (Tillering, Pre-flowering, Grain filling) to avoid leaching.
• Zinc Correction: Apply Zinc Sulphate 21% @ 10–15 kg/acre in soil or spray 0.5% Chelated Zinc.
• Organic Health: Incorporate 3–5 tonnes FYM or 1.5 tonnes Vermicompost + 200 kg Neem Cake per acre.`,
    suggestions: ['How to calculate NPK for 1 acre?', 'Find fertilizer stock in nearby shops', 'Difference between DAP and SSP']
  },

  schemes: {
    title: 'Government Welfare Schemes & Subsidies 2026',
    matches: ['scheme', 'subsidy', 'pm-kisan', 'pm kisan', 'pmfby', 'fasal bima', 'kcc', 'kisan credit', 'rythu', 'ysr', 'annadata', 'solar pump', 'kusum'],
    response: `🏛️ Government Agricultural Schemes:
• PM-KISAN: ₹6,000 per year in 3 equal installments of ₹2,000 directly to bank accounts (requires active e-KYC).
• PMFBY Crop Insurance: 2% premium for Kharif, 1.5% for Rabi, and 5% for horticultural crops for flood/drought protection.
• Kisan Credit Card (KCC): Concessional crop loans up to ₹3 Lakh at 4% effective interest rate.
• PM-KUSUM: Up to 60% subsidy for solar agricultural pumps (3HP to 7.5HP).
• Farm Mechanization (SMAM): 40%–50% subsidy on tractors and sprayers.`,
    suggestions: ['Check PM-KISAN beneficiary status', 'How to claim crop insurance PMFBY', 'Apply for Kisan Credit Card loan']
  },

  organic: {
    title: 'Organic Farming, Bio-Fertilizers & Natural Pest Control',
    matches: ['organic', 'natural farming', 'jeevamrut', 'panchagavya', 'neem oil', 'trichoderma', 'pseudomonas', 'bio'],
    response: `🌿 Natural & Organic Farming Solutions:
• Jeevamrut (1 Acre): Mix 10 kg Desi cow dung + 5–10L cow urine + 2 kg Jaggery + 2 kg Besan in 200L water; ferment 48 hours and apply with irrigation.
• Neem Bio-Pesticide: 5 ml Neem Oil (1500 ppm) + 1 ml liquid soap per Liter of water for sucking pests and caterpillars.
• Bio-Fungicide: Trichoderma viride (2.5 kg/acre in 500 kg FYM) controls root rot and damping-off.`,
    suggestions: ['How to prepare Panchagavya?', 'Organic control for stem borer', 'Neem cake application dosage']
  }
};

// Generic smart agricultural query processor (Hybrid: Gemini API + Local Knowledge Base Fallback)
export const processAgriculturalQuery = async (query = '', farmerContext = {}) => {
  const clean = query.trim().toLowerCase();

  if (!clean) {
    return {
      answer: '🌾 Namaste! Please ask any agricultural query about crop diseases, fertilizers, seasonal sowing, pesticide dosage, or government schemes.',
      suggestions: ['What fertilizer is suitable for paddy?', 'How to grow guava and control pests?', 'Tell me about PM-KISAN scheme', 'Remedies for yellow leaves in chilli'],
      topic: 'FarmSetu Agricultural Assistant'
    };
  }

  // 1. Domain Guardrail Check: Filter out obvious non-agricultural queries
  if (isNonAgriculturalQuery(query)) {
    return OFF_TOPIC_REFUSAL;
  }

  // 2. If GEMINI_API_KEY is provided in .env, query Google Gemini LLM with strict formatting & scope
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const geminiModelName = (process.env.GEMINI_MODEL && process.env.GEMINI_MODEL.trim()) ? process.env.GEMINI_MODEL.trim() : 'gemini-3.6-flash';

  if (geminiApiKey && geminiApiKey.trim() !== '' && !geminiApiKey.includes('mock') && !geminiApiKey.includes('your_')) {
    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey.trim());
      const model = genAI.getGenerativeModel({
        model: geminiModelName,
        systemInstruction: `You are FarmSetu AI, an expert agricultural advisor and agronomist empowering Indian farmers.

STRICT DOMAIN GUARD:
You MUST ONLY answer questions strictly related to agriculture, farming, crops, soil health, fertilizers, seeds, pest & disease remedies, irrigation, farm machinery, mandi prices, and Indian government agricultural schemes (e.g. PM-KISAN, PMFBY, Rythu Bharosa, KCC).
If the user asks ANY question unrelated to agriculture (such as coding, general knowledge, sports, entertainment, movies, politics, relationships, non-agri science, math, or other general topics), you MUST POLITELY REFUSE with:
"Namaste! I am FarmSetu AI, dedicated exclusively to agriculture and farming. Please ask questions related to crops, fertilizers, pest remedies, soil management, or government farming schemes."

STRICT FORMATTING & SIZE RULES:
1. ABSOLUTELY NO ASTERISKS: Never output asterisks (* or ** or ***). Do not use markdown bolding with asterisks.
2. NO MARKDOWN HEADERS OR HORIZONTAL RULES: Do not output ###, ##, #, or ---.
3. VERY CONCISE & BRIEF: Keep your entire response under 90-110 words total. Provide 3 to 5 short bullet points maximum.
4. Use the bullet symbol (•) and emojis directly with plain text. Give exact doses and practical steps.`
      });

      const contextInfo = farmerContext?.district
        ? ` (Farmer location: ${farmerContext.district}, Andhra Pradesh, Land: ${farmerContext.totalLandArea || '2'} Acres)`
        : '';

      const prompt = `${query}${contextInfo}`;
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      if (responseText && responseText.trim()) {
        const cleanedAnswer = cleanAssistantResponse(responseText);

        return {
          answer: cleanedAnswer,
          suggestions: [
            'How to prevent pest attack in this crop?',
            'What is the recommended fertilizer schedule?',
            'Available government subsidies for this crop'
          ],
          topic: `FarmSetu AI (${geminiModelName})`
        };
      }
    } catch (geminiError) {
      console.warn('Gemini API query failed, falling back to local agricultural knowledge engine:', geminiError?.message || geminiError);
    }
  }

  // 3. Direct match with categorized knowledge items (Fallback / Local Engine)
  for (const [key, item] of Object.entries(AGRICULTURAL_KNOWLEDGE)) {
    const hasMatch = item.matches.some((keyword) => clean.includes(keyword));

    if (hasMatch) {
      return {
        answer: cleanAssistantResponse(item.response),
        suggestions: item.suggestions,
        topic: item.title
      };
    }
  }

  // 4. Intelligent topic decomposition if specific crop not directly matched
  if (clean.includes('pest') || clean.includes('disease') || clean.includes('insect') || clean.includes('fungus') || clean.includes('rot') || clean.includes('cure') || clean.includes('spray')) {
    return {
      answer: cleanAssistantResponse(`🐛 Integrated Pest & Disease Advisory:
• Sucking Pests (Aphids/Whitefly/Thrips): Spray Neem Oil 1500 ppm (5 ml/L) or Acetamiprid 20 SP (0.2 g/L). Install yellow/blue sticky traps (15/acre).
• Boring Pests (Stem borer/Bollworm): Spray Chlorantraniliprole 18.5 SC (0.3 ml/L) or Emamectin Benzoate 5 SG (0.5 g/L).
• Fungal Blights & Spots: Spray Mancozeb 75 WP (2.5 g/L) or Azoxystrobin + Difenoconazole (1 ml/L).
• Spray Timing: Early morning (before 9 AM) or late afternoon (after 4 PM) in calm weather.`),
      suggestions: ['Organic pest control remedies', 'Pesticide stock near me', 'Weather forecast before spraying'],
      topic: 'Pest & Disease Control'
    };
  }

  if (clean.includes('weather') || clean.includes('rain') || clean.includes('irrigate') || clean.includes('water') || clean.includes('borewell')) {
    return {
      answer: cleanAssistantResponse(`🌦️ Weather & Irrigation Advisory:
• Heavy Rain Forecast: Pause canal and borewell irrigation immediately to avoid water stagnation and nutrient leaching.
• Drainage Management: Keep field trenches clear to prevent root rot in vegetables and cotton.
• Drip Irrigation: Run drip in early morning hours to minimize evaporation losses.`),
      suggestions: ['Check 5-day district weather alert', 'Drip irrigation subsidy under PMKSY', 'Sowing advice for current season'],
      topic: 'Weather & Irrigation Advisory'
    };
  }

  if (clean.includes('price') || clean.includes('mandi') || clean.includes('msp') || clean.includes('market') || clean.includes('sell') || clean.includes('rate')) {
    return {
      answer: cleanAssistantResponse(`📊 Agricultural Market & MSP Advisory:
• Paddy (Common): ₹2,300 – ₹2,369 / Quintal
• Cotton (Medium / Long Staple): ₹7,121 – ₹7,521 / Quintal
• Maize: ₹2,225 / Quintal | Groundnut: ₹6,783 / Quintal
• Selling Tip: Pre-book procurement slots via e-NAM or local Rythu Bharosa Kendra (RBK) for direct DBT payment.`),
      suggestions: ['Find nearby agriculture procurement centers', 'Government crop insurance details', 'Register crop for official verification'],
      topic: 'Market Prices & Mandi Advisory'
    };
  }

  // 5. If query does not mention a recognized agricultural subject or crop, return safe agricultural prompt
  const agriculturalCropsList = [
    'cotton', 'paddy', 'rice', 'wheat', 'chilli', 'mirchi', 'guava', 'mango', 'tomato',
    'maize', 'sugarcane', 'groundnut', 'turmeric', 'onion', 'potato', 'banana', 'papaya',
    'brinjal', 'bhendi', 'okra', 'lemon', 'mustard', 'soybean', 'gram', 'pulse', 'crop'
  ];

  const matchedCrop = agriculturalCropsList.find(c => clean.includes(c));

  if (!matchedCrop && !clean.includes('soil') && !clean.includes('seed') && !clean.includes('land') && !clean.includes('yield')) {
    return OFF_TOPIC_REFUSAL;
  }

  const cropName = matchedCrop ? matchedCrop.toUpperCase() : 'YOUR CROP';

  return {
    answer: cleanAssistantResponse(`🌾 Advisory for ${cropName} & Farm Operations:
• Soil & Nutrients: Ensure soil pH is 6.0–7.5. Apply basal DAP/SSP and Potash at sowing, and split Urea in 2–3 top dressings.
• Organic Matter: Add 3–4 tonnes FYM or 1.5 tonnes Vermicompost + 200 kg Neem Cake per acre.
• Pest Protection: Inspect weekly; spray 5% Neem Seed Kernel Extract (NSKE) preventively for sucking pests.
• Crop Verification: Register your crop season on the Farm Records tab for PMFBY insurance benefits.`),
    suggestions: [
      `Fertilizer dosage for ${cropName}`,
      `Pest and disease remedies for ${cropName}`,
      `Best sowing season and spacing for ${cropName}`,
      'Check available government subsidies'
    ],
    topic: `Advisory for ${cropName}`
  };
};
