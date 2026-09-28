import { cleanAssistantResponse } from './services/assistantService.js';

const sample = `Namaste Farmer Friend! 🌾 Welcome to FarmSetu AI. Here is the complete, expert fertilizer and crop management guide for getting high yields from your **Cotton** crop per acre.

---

### 1. 🧪 Fertilizer Dosage (Per Acre)

* **At Land Preparation (Basal):**
* 🐂 **Organic:** Apply **2-3 tonnes of well-rotted FYM (Farmyard Manure)** or **1 tonne Vermicompost** during final ploughing.
* **At Sowing (0-7 days):**
* 🌾 **DAP:** 50 kg (provides Nitrogen & Phosphorus)
* 🧱 **MOP (Potash):** 20 kg
* ⚡ **Zinc Sulphate (21%):** 10 kg
* 🌿 **Foliar Spray:** Spray **13-0-45 (Potassium Nitrate)** @ 10 grams per litre.`;

console.log('--- ORIGINAL ---');
console.log(sample);
console.log('--- CLEANED ---');
console.log(cleanAssistantResponse(sample));
