import { GoogleGenerativeAI } from '@google/generative-ai';

// Comprehensive Agricultural AI Assistant Knowledge & Advisory Engine

// In-depth agricultural knowledge base categorized by crop, topic, pest, and scheme
const AGRICULTURAL_KNOWLEDGE = {
  guava: {
    title: 'Guava Cultivation & Crop Care Guide (Amarud / Jaama)',
    matches: ['guava', 'amrood', 'amarud', 'jaama', 'psidium', 'lucknow 49', 'l-49', 'sardar guava', 'safeda'],
    response: `🍈 **Complete Guava Cultivation & Management Guide**

1. **Popular Commercial Varieties:**
   • **Lucknow 49 (Sardar):** Prolific bearer, semi-dwarf, round fruit with creamy white pulp, rich in Vitamin C.
   • **Allahabad Safeda:** Renowned for sweet, soft white pulp and pleasant aroma.
   • **Lalit:** High yielding with appealing pink flesh and high TSS (ideal for processing & table use).
   • **Taiwan Pink / Jumbo:** Large crisp fruits, highly profitable in modern orchards.

2. **Soil, Climate & Spacing:**
   • **Soil:** Well-drained deep loamy soil with pH 6.5 – 8.0. Highly tolerant to salinity and short dry spells.
   • **Traditional Spacing:** 6m x 6m (112 plants per acre) or 5m x 5m (160 plants per acre).
   • **Meadow Orchard (Ultra High Density):** 2m x 1m (2,000 plants per acre) with strict regular canopy pruning for early commercial yields from 2nd year.

3. **Bahar Treatment (Crop Regulation for Maximum Quality):**
   • **Mrig Bahar (Winter Harvest):** Highly recommended! Induce flowering in June–July by withholding irrigation during April–May. Fruits ripen from November to January with highest sweetness and zero fruit-fly attack.
   • **Ambe Bahar (Rainy Season Harvest):** Flowers in Feb–March, fruits in July–September (prone to fruit fly; lower market price).

4. **Fertilizer Schedule (per full-grown tree 4+ years):**
   • **Organic:** 30–40 kg well-rotted FYM + 2 kg Vermicompost + 500g Neem cake per tree before monsoon.
   • **Chemical (NPK):** 260g Nitrogen (560g Urea), 160g Phosphorus (350g DAP or 1000g SSP), 260g Potash (430g MOP). Apply in 2 split doses: 1st dose in June and 2nd dose in October.
   • **Micronutrient Spray:** Spray 0.5% Zinc Sulphate + 0.3% Boric Acid during pre-flowering and fruit set to prevent fruit drop and cracking.

5. **Pest & Disease Management:**
   • **Fruit Fly:** Install Methyl Eugenol Pheromone Traps (6–8 traps/acre) 45 days before harvest. Spray bait spray (20ml Malathion 50EC + 200g Gur/Jaggery in 20L water).
   • **Guava Wilt (Fusarium):** Drench roots with *Trichoderma viride* (50g mixed with 5kg FYM per tree) or Carbendazim 50 WP (2g/L water). Maintain proper field drainage.
   • **Mealybugs & Scales:** Spray Neem Oil (5ml/L) or Profenofos 50 EC (2ml/L) with sticker.

6. **Expected Yield:** 25–40 kg/tree in 3rd year, reaching 100–150 kg/tree by 6th–8th year (10–15 tonnes/acre).`,
    suggestions: [
      'Fertilizer dosage for 2-year-old guava tree',
      'How to do Bahar treatment in guava?',
      'How to control fruit fly in guava?',
      'Subsidy for drip irrigation in guava orchards'
    ]
  },

  mango: {
    title: 'Mango Orchard Care & Flowering Advisory',
    matches: ['mango', 'aam', 'banganapalli', 'alphonso', 'totapuri', 'dasheri', 'kesar'],
    response: `🥭 **Mango Crop Management & Yield Advisory**

1. **Flowering & Fruit Retention:**
   • To prevent flower drop, spray Planofix (NAA 4.5 SL) @ 4 ml per 15 Liters of water at full bloom.
   • Apply 0.5% Potassium Nitrate (KNO3) @ 5g/L during panicle emergence to enhance flowering intensity.

2. **Major Pest Remedies:**
   • **Mango Hopper:** Spray Thiamethoxam 25 WG (0.3 g/L) or Imidacloprid 17.8 SL (0.3 ml/L) during panicle emergence before flowers open.
   • **Powdery Mildew:** Spray Hexaconazole 5 EC (1 ml/L) or Wettable Sulphur 80 WP (2 g/L) when white powdery patches appear.

3. **Fertilizer Dose (Matured tree 7+ years):**
   • 50 kg FYM + 1000g N (2.2 kg Urea), 500g P2O5 (3.1 kg SSP), 1000g K2O (1.6 kg MOP) applied in ring trench after harvest (July–August).`,
    suggestions: ['How to control mango hopper?', 'Pruning after mango harvest', 'Fruit fly management in mango']
  },

  paddy: {
    title: 'Paddy (Rice) Nutrition & Pest Advisory',
    matches: ['paddy', 'rice', 'dhan', 'bpt', 'mtu', 'swarna', 'samba', 'stem borer', 'blast'],
    response: `🌾 **Paddy (Rice) Best Practices & Advisory**

1. **Balanced NPK Ratio (120:60:40 kg/ha):**
   • **Basal Dose (At Transplanting):** Full DAP (100–120 kg/ha) + Full Potash (60–70 kg MOP/ha) + 25% Urea.
   • **1st Top Dressing (Active Tillering, 20–25 DAT):** 50% Urea + Zinc Sulphate (25 kg/ha if deficiency noticed).
   • **2nd Top Dressing (Panicle Initiation, 45–50 DAT):** Remaining 25% Urea. Apply with thin water film.

2. **Pest & Disease Control:**
   • **Yellow Stem Borer (Dead Heart / White Ear):** Apply Cartap Hydrochloride 4G granules @ 10 kg/acre or spray Chlorantraniliprole 18.5 SC (0.3 ml/L).
   • **Blast / Neck Blast:** Spray Tricyclazole 75 WP (0.6 g/L) or Isoprothiolane 40 EC (1.5 ml/L).
   • **Brown Planthopper (BPH):** Drain field water for 3–4 days; spray Pymetrozine 50 WDG (0.6 g/L) or Trifiumezopprim 10 SC (0.5 ml/L) targeted at plant base.`,
    suggestions: ['How to control BPH in paddy?', 'Zinc deficiency treatment in paddy', 'Paddy MSP rates 2026']
  },

  cotton: {
    title: 'Cotton Crop Protection & Nutrition Advisory',
    matches: ['cotton', 'kapas', 'patti', 'bollworm', 'pink bollworm', 'sucking pest'],
    response: `🌱 **Cotton Cultivation & Protection Advisory**

1. **Spacing & Plant Population:** 90 x 60 cm (7,400 plants/acre) or 120 x 45 cm for heavy black soils.
2. **Pink Bollworm Management:**
   • Install Pheromone Traps (PBLure) @ 8 traps/acre from 45 DAS for monitoring.
   • If moth catch exceeds 8 moths/trap/night for 3 consecutive days, spray Profenofos 50 EC (2 ml/L) or Emamectin Benzoate 5 SG (0.5 g/L).
3. **Square & Boll Drop Prevention:** Spray NAA 4.5 SL (Planofix) @ 4 ml/15L water at 60 and 75 DAS along with 1% 13-0-45 (Potassium Nitrate) foliar spray.`,
    suggestions: ['Pink bollworm organic remedy', 'Fertilizer schedule for Bt cotton', 'Whitefly control in cotton']
  },

  chilli: {
    title: 'Chilli Crop & Yellow Leaf / Thrips Protection',
    matches: ['chilli', 'chilli yellow', 'mirchi', 'thrips', 'mites', 'leaf curl', 'murda'],
    response: `🌶️ **Chilli (Mirchi) Pest & Leaf Curl Management**

1. **Leaf Curl / Murda Complex (Thrips & Mites):**
   • **Upward Leaf Curling (Thrips):** Spray Spinetoram 11.7 SC (0.9 ml/L) or Fipronil 5 SC (2 ml/L). Install blue sticky traps (15–20/acre).
   • **Downward Leaf Curling (Broad Mites):** Spray Diafenthiuron 50 WP (1.2 g/L) or Spiromesifen 22.9 SC (1 ml/L).
2. **Fertilizer Schedule:**
   • NPK 120:60:60 kg/ha with micronutrient spray (Zinc + Boron 0.2%) at 30, 60, and 90 days after transplanting to boost flower retention and pod shine.`,
    suggestions: ['How to control black thrips in chilli?', 'Foliar spray for red chilli yield', 'Chilli drip fertigation schedule']
  },

  tomato: {
    title: 'Tomato Production & Blight Advisory',
    matches: ['tomato', 'tamatar', 'early blight', 'late blight', 'fruit borer', 'tuta'],
    response: `🍅 **Tomato Crop Management & Disease Protection**

1. **Early & Late Blight Control:**
   • Spray Mancozeb 75 WP (2.5 g/L) or Chlorothalonil 75 WP (2 g/L) preventively.
   • For severe late blight, spray Cymoxanil 8% + Mancozeb 64% (2.5 g/L) or Metalaxyl-M + Mancozeb (2.5 g/L).
2. **Fruit Borer (Helicoverpa):**
   • Spray *Bacillus thuringiensis* (Bt) @ 1.5 g/L or Chlorantraniliprole 18.5 SC (0.3 ml/L).
3. **Calcium Deficiency (Blossom End Rot):** Spray Calcium Nitrate (5 g/L) + Boron (1 g/L) at fruit development.`,
    suggestions: ['How to prevent tomato leaf curl virus?', 'Calcium spray for tomato fruit rot', 'Drip fertigation in tomato']
  },

  fertilizers: {
    title: 'Balanced Fertilization & Soil Health Advisory',
    matches: ['fertilizer', 'urea', 'dap', 'potash', 'mop', 'npk', 'zinc', 'micronutrient', 'dosage', 'soil test'],
    response: `🧪 **Scientific Fertilizer Management (4R Stewardship)**

1. **Basal Application:** Apply all Phosphorus (DAP/SSP) and Potash (MOP) at sowing/transplanting near root zone. Phosphorus does not move easily in soil, so surface broadcasting later is wasteful.
2. **Split Nitrogen (Urea):** Never dump all Urea at once. Split into 2–3 doses matching crop growth stages (Tillering/Vegetative, Pre-Flowering, Grain Filling) to prevent leaching and volatilization.
3. **Micronutrient Correction:**
   • **Zinc Deficiency (Yellowing between veins):** Apply 10–25 kg/ha Zinc Sulphate (21% or 33%) as basal soil application, or foliar spray 0.5% Chelated Zinc.
   • **Boron Deficiency:** Foliar spray 0.2% Solubor (Boric Acid) at flowering.
4. **Organic Integration:** Incorporate 5 tonnes/ha FYM or 2 tonnes/ha Vermicompost with 500 kg Neem Cake to enhance beneficial soil microflora and nutrient use efficiency.`,
    suggestions: ['How to calculate NPK for 1 acre?', 'Find fertilizer stock in nearby shops', 'Difference between DAP and SSP']
  },

  schemes: {
    title: 'Government Welfare Schemes & Subsidies 2026',
    matches: ['scheme', 'subsidy', 'pm-kisan', 'pm kisan', 'pmfby', 'fasal bima', 'kcc', 'kisan credit', 'rythu', 'ysr', 'annadata', 'solar pump', 'kusum'],
    response: `🏛️ **Major Government Agricultural Welfare Schemes & Benefits**

1. **PM-KISAN (Direct Income Support):**
   • ₹6,000 per year provided in 3 equal installments of ₹2,000 directly into verified Aadhaar-seeded bank accounts.
   • Requirement: Active e-KYC and land seeding on the PM-Kisan portal.
2. **Pradhan Mantri Fasal Bima Yojana (PMFBY):**
   • Comprehensive insurance covering crop loss due to drought, floods, pests, and unseasonal rains.
   • Farmer Premium: 2% for Kharif crops, 1.5% for Rabi crops, and 5% for commercial/horticultural crops.
3. **Kisan Credit Card (KCC):**
   • Concessional institutional crop credit up to ₹3 Lakh at an effective interest rate of 4% (with 3% prompt repayment incentive).
   • Collateral-free loan limit up to ₹1.6 Lakh.
4. **PM-KUSUM (Solar Pumps):** Up to 60% subsidy on stand-alone solar agricultural pumps (3HP, 5HP, 7.5HP).
5. **Mechanization Subsidies (SMAM):** 40% to 50% financial assistance for purchasing tractors, rotavators, power weeders, and sprayers.`,
    suggestions: ['Check PM-KISAN beneficiary status', 'How to claim crop insurance PMFBY', 'Apply for Kisan Credit Card loan']
  },

  organic: {
    title: 'Organic Farming, Bio-Fertilizers & Natural Pest Control',
    matches: ['organic', 'natural farming', 'jeevamrut', 'panchagavya', 'neem oil', 'trichoderma', 'pseudomonas', 'bio'],
    response: `🌿 **Natural & Organic Farming Solutions**

1. **Jeevamrut Preparation (For 1 Acre):**
   • Mix 10 kg fresh Desi cow dung + 5–10 L cow urine + 2 kg Jaggery (Gur) + 2 kg Pulse flour (Besan) + Handful of fertile farm soil in 200 L water.
   • Stir clockwise twice daily in shade for 48–72 hours. Apply with irrigation water or spray 10% solution on crops.
2. **Neem-Based Bio-Pesticide (NSKE 5% / Neem Oil):**
   • 5 ml Neem Oil (1500–3000 ppm) + 1 ml liquid soap per Liter of water. Repels aphids, whiteflies, thrips, and caterpillars.
3. **Bio-Fungicides:**
   • *Trichoderma viride* & *Pseudomonas fluorescens* (2.5 kg/ha mixed in 500 kg FYM) prevent soil-borne root rot, collar rot, and damping off.`,
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

  // 1. If GEMINI_API_KEY is provided in .env, query Google Gemini LLM
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const geminiModelName = (process.env.GEMINI_MODEL && process.env.GEMINI_MODEL.trim()) ? process.env.GEMINI_MODEL.trim() : 'gemini-2.0-flash';

  if (geminiApiKey && geminiApiKey.trim() !== '' && !geminiApiKey.includes('mock') && !geminiApiKey.includes('your_')) {
    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey.trim());
      const model = genAI.getGenerativeModel({
        model: geminiModelName,
        systemInstruction: `You are FarmSetu AI, an expert agricultural advisor and agronomist empowering Indian farmers.
Provide concise, highly accurate, and practical farming advice in friendly bullet points with emojis.
Cover:
1. Exact dosage of fertilizers (NPK, DAP, Urea, Potash, organic FYM/vermicompost) per acre or plant.
2. Integrated Pest Management (both chemical with technical names and organic bio-pesticides like Neem Oil/Trichoderma).
3. Timely weather/irrigation advice and relevant Indian government welfare schemes (PM-KISAN, PMFBY, Rythu Bharosa, e-NAM) when relevant.
Keep the language simple, respectful, and easy for farmers to understand.`
      });

      const contextInfo = farmerContext?.district
        ? ` (Farmer location: ${farmerContext.district}, Andhra Pradesh, Land: ${farmerContext.totalLandArea || '2'} Acres)`
        : '';

      const prompt = `${query}${contextInfo}`;
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      if (responseText && responseText.trim()) {
        return {
          answer: responseText,
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

  // 2. Direct match with categorized knowledge items (Fallback / Local Engine)
  for (const [key, item] of Object.entries(AGRICULTURAL_KNOWLEDGE)) {
    const hasMatch = item.matches.some((keyword) => {
      // Check if keyword appears as substring or word
      if (clean.includes(keyword)) return true;
      // Handle transliterations like 'amrood', 'jaama', 'mirchi', etc.
      return false;
    });

    if (hasMatch) {
      return {
        answer: item.response,
        suggestions: item.suggestions,
        topic: item.title
      };
    }
  }

  // 2. Intelligent topic decomposition if specific crop not directly matched
  if (clean.includes('pest') || clean.includes('disease') || clean.includes('insect') || clean.includes('fungus') || clean.includes('rot') || clean.includes('cure') || clean.includes('spray')) {
    return {
      answer: `🐛 **Integrated Pest & Disease Management Advisory**

• **Identify the Pest Type:
  1. **Sucking Pests (Aphids, Jassids, Whitefly, Thrips):Cause leaf curling, sticky honeydew, and yellowing.
     *Remedy:* Spray Neem Oil 1500 ppm (5 ml/L) or Acetamiprid 20 SP (0.2 g/L) / Thiamethoxam 25 WG (0.3 g/L). Install yellow/blue sticky traps (15 traps/acre).
  2. Boring & Chewing Pests (Stem borer, Bollworm, Fruit borer): Cause dead hearts, bored holes, and dropping of flowers/fruits.
     Remedy: Spray Chlorantraniliprole 18.5 SC (0.3 ml/L) or Emamectin Benzoate 5 SG (0.5 g/L). Install sex pheromone traps (5–8 traps/acre).
  3. Fungal Diseases (Leaf spots, Blight, Powdery mildew):
     *Remedy:* Spray Mancozeb 75 WP (2.5 g/L) or Azoxystrobin + Difenoconazole (1 ml/L).

• **Spraying Precaution:** Spray during early morning (before 9 AM) or late afternoon (after 4 PM). Avoid spraying during rain forecasts or windy conditions.`,
      suggestions: ['Organic pest control remedies', 'Pesticide stock near me', 'Weather forecast before spraying'],
      topic: 'Pest & Disease Control'
    };
  }

  if (clean.includes('weather') || clean.includes('rain') || clean.includes('irrigate') || clean.includes('water') || clean.includes('borewell')) {
    return {
      answer: `🌦️ **Weather & Irrigation Advisory for Farmers**

• **Precipitation Warning:** If moderate-to-heavy rains are expected in your mandal/district over the next 48 hours, immediately pause canal/borewell irrigation and delay fertilizer top-dressing to prevent nutrient leaching.
• **Drainage:** Keep field trenches and bund outlets open to clear stagnant water from root zones, particularly in vegetables, cotton, pulses, and young orchards.
• **Drip Irrigation Scheduling:** In dry periods, run drip systems in early mornings to minimize evaporation loss. Maintain 80–90% field capacity for optimum root aeration.`,
      suggestions: ['Check 5-day district weather alert', 'Drip irrigation subsidy under PMKSY', 'Sowing advice for current season'],
      topic: 'Weather & Irrigation Advisory'
    };
  }

  if (clean.includes('price') || clean.includes('mandi') || clean.includes('msp') || clean.includes('market') || clean.includes('sell') || clean.includes('rate')) {
    return {
      answer: `📊 **Agricultural Market & Minimum Support Price (MSP) Advisory**

• **Government MSP Highlights (2026/2025):**
  • **Paddy (Common):** ₹2,300 – ₹2,369 / Quintal
  • **Paddy (Grade A):** ₹2,320 – ₹2,389 / Quintal
  • **Cotton (Medium / Long Staple):** ₹7,121 – ₹7,521 / Quintal
  • **Maize:** ₹2,225 / Quintal
  • **Red Gram (Tur / Arhar):** ₹7,550 / Quintal
  • **Groundnut:** ₹6,783 / Quintal

• **Selling Tip:** Pre-book your market slot via e-NAM (National Agriculture Market) or your local Rythu Bharosa Kendra (RBK) / APMC mandi to avoid middleman commissions and ensure direct DBT bank payment within 48 hours.`,
      suggestions: ['Find nearby agriculture procurement centers', 'Government crop insurance details', 'Register crop for official verification'],
      topic: 'Market Prices & Mandi Advisory'
    };
  }

  // 3. Smart contextual fallback that addresses general crop inquiries dynamically
  const words = clean.split(/\s+/).filter((w) => w.length > 2);
  const potentialCrop = words.find((w) => !['what', 'how', 'when', 'why', 'tell', 'about', 'said', 'asked', 'give', 'information', 'details', 'right'].includes(w)) || 'your crop';

  return {
    answer: `🌾 **Advisory for ${potentialCrop.toUpperCase()} & Farm Operations**

To provide you the most accurate solution for **${potentialCrop}**, here are the recommended best practices:

1. **Crop Health & Nutrients:**
   • Conduct a soil health test to ensure pH is between 6.0 and 7.5.
   • Follow balanced NPK application (Basal Phosphorus & Potash + Split Nitrogen dressings).
   • Add organic manure (FYM or Vermicompost) along with micronutrients like Zinc and Boron for robust growth and flower retention.

2. **Crop Protection:**
   • Inspect crops weekly for early symptoms of sucking pests, leaf spotting, or root wilt.
   • For organic defense, spray 5% Neem Seed Kernel Extract (NSKE) or *Trichoderma* at root zones.
   • For specific pest or disease symptoms, please mention whether you notice yellowing leaves, leaf spots, insect holes, or stunted growth.

3. **Government Scheme Benefits:**
   • Eligible farmers can register their crop season on the Farm Records tab to avail PMFBY crop insurance and official officer verification.`,
    suggestions: [
      `Fertilizer dosage for ${potentialCrop}`,
      `Pest and disease remedies for ${potentialCrop}`,
      `Best sowing season and spacing for ${potentialCrop}`,
      'Check available government subsidies'
    ],
    topic: `Advisory for ${potentialCrop}`
  };
};
