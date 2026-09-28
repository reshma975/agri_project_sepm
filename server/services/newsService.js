// News API Service for fetching Indian Agriculture and Farmer-related Government Schemes
// Documentation: https://newsapi.org/docs/endpoints/everything

// Tier-1: Strict Boolean Query targeting Indian Farmer Government Schemes & Policies
const STRICT_AGRI_SCHEME_QUERY =
  '("PM-KISAN" OR "PMFBY" OR "crop insurance" OR "minimum support price" OR "MSP" OR "farmer scheme" OR "agriculture scheme" OR "farmer welfare" OR "fertilizer subsidy" OR "farm subsidy" OR "Kisan Credit Card") AND (farmer OR agriculture OR crop OR kisan)';

// Blacklist negative regexes to reject irrelevant articles (sports, cinema, stock trading, scams, non-agri savings)
const BLACKLIST_PATTERNS = [
  /\b(cricket|ipl|bcci|wicket|batsman|bowler|century|scorecard|t20|football|soccer|hockey|olympics|badminton|tennis|fifa|wimbledon|premier league)\b/i,
  /\b(bollywood|hollywood|box office|movie review|actor|actress|film trailer|celebrity|cinema|ott release)\b/i,
  /\b(firebase|google play|cyber crime|phishing|malware|dark web|crypto|bitcoin|ethereum|nft|smartphone|iphone)\b/i,
  /\b(sensex|nifty|nasdaq|dow jones|wall street|soar up to|52-wk high|share price|q1 results|q2 results|q3 results|q4 results|quarterly profit|mutual fund|fixed deposit|post office monthly|ppf scheme|sukanya samriddhi|lic policy|gold rate|silver rate|niva bupa|icici lombard|star health|bajaj general|gross written premium|gwp|tradingview|brokerage)\b/i,
  /\b(feral hogs|thessaloniki|us senate|white house|donald trump|kamala harris|gaza|ukraine war|taiwan|brazil)\b/i,
];

// Group A: Agriculture terms (must be present in title or description)
const AGRI_TERMS = [
  'farmer', 'farmers', 'agriculture', 'agricultural', 'farming', 'kisan', 'krishi',
  'cultivation', 'crop', 'crops', 'paddy', 'wheat', 'cotton', 'sugarcane', 'pulses',
  'horticulture', 'rythu', 'kharif', 'rabi', 'mandi', 'soil health'
];

// Group B: Government scheme/subsidy/policy/support terms (must be present in title or description)
const GOVT_SCHEME_TERMS = [
  'pm-kisan', 'pm kisan', 'pmfby', 'fasal bima', 'crop insurance', 'minimum support price',
  'msp', 'scheme', 'subsidy', 'subsidies', 'welfare', 'financial assistance', 'direct benefit transfer',
  'dbt', 'yojana', 'kisan credit card', 'kcc', 'fertilizer subsidy', 'seed subsidy',
  'procurement', 'rythu bharosa', 'rythu bandhu', 'soil health card', 'krishi sinchayee',
  'government assistance', 'govt assistance', 'compensation', 'package', 'ministry of agriculture',
  'union cabinet', 'krishi vikas', 'annadatha', 'state government', 'union government',
  'kusum', 'loan waiver', 'crop damage', 'relief fund', 'subsidised', 'subsidized', 'farm scheme', 'agriculture scheme', 'farmer welfare'
];

// Context indicators for India / Government Authority
const INDIA_GOVT_INDICATORS = [
  'india', 'indian', 'centre', 'center', 'govt', 'government', 'state', 'union', 'minister',
  'chouhan', 'modi', 'yogi', 'andhra', 'telangana', 'punjab', 'haryana', 'maharashtra',
  'karnataka', 'up', 'uttar pradesh', 'bihar', 'odisha', 'tamil nadu', 'bengal', 'crore',
  'rupee', 'rs', 'inr', '₹', 'lakh', 'kharif', 'rabi', 'pm-kisan', 'pmfby', 'msp', 'kisan', 'krishi', 'rythu', 'delhi', 'pradesh', 'cabinet', 'ministry', 'department', 'collector', 'collectorate', 'srikakulam', 'guntur', 'vijayawada'
];

/**
 * Classify a validated scheme article into one of FarmSetu's standard topics
 */
export const classifySchemeTopic = (title, desc = '') => {
  const text = `${title} ${desc}`.toLowerCase();
  if (text.includes('pm-kisan') || text.includes('pm kisan') || text.includes('samman nidhi') || text.includes('installment') || text.includes('instalment')) {
    return 'PM-KISAN';
  }
  if (text.includes('pmfby') || text.includes('crop insurance') || text.includes('fasal bima') || text.includes('crop damage') || text.includes('crop loss') || (text.includes('crop') && text.includes('insurance'))) {
    return 'Crop Insurance (PMFBY)';
  }
  if (text.includes('subsidy') || text.includes('subsidies') || text.includes('loan waiver') || text.includes('financial assistance') || text.includes('kusum') || text.includes('dbt') || text.includes('financial aid') || text.includes('interest subvention')) {
    return 'Subsidies & Financial Aid';
  }
  if (text.includes('msp') || text.includes('minimum support price') || text.includes('procurement') || text.includes('mandi') || text.includes('support price')) {
    return 'MSP & Procurement';
  }
  if (text.includes('fertilizer') || text.includes('fertiliser') || text.includes('urea') || text.includes('dap') || text.includes('seed') || text.includes('seeds') || text.includes('npk')) {
    return 'Fertilizers & Seeds';
  }
  if (text.includes('farmer welfare') || text.includes('welfare') || text.includes('pension') || text.includes('rythu bharosa') || text.includes('rythu bandhu') || text.includes('kcc') || text.includes('kisan credit card') || text.includes('annadatha')) {
    return 'Farmer Welfare';
  }
  return 'Other Agriculture Schemes';
};

/**
 * Strict Server-Side Relevance Filter (Validates BOTH Group A and Group B, and rejects Blacklist)
 */
export const isValidSchemeArticle = (article) => {
  if (!article || !article.title || article.title === '[Removed]' || !article.url) {
    return false;
  }

  const title = article.title.toLowerCase();
  const desc = (article.description || '').toLowerCase();
  const fullText = `${title} ${desc}`;

  // 1. Blacklist check (cricket, sports, movies, stocks, foreign non-India politics)
  for (const pattern of BLACKLIST_PATTERNS) {
    if (pattern.test(fullText)) {
      return false;
    }
  }

  // 2. Agriculture context requirement (Group A)
  const hasAgri = AGRI_TERMS.some((term) => fullText.includes(term));
  if (!hasAgri) {
    return false;
  }

  // 3. Government Scheme/Subsidy/Policy/Support requirement (Group B)
  const hasGovtScheme = GOVT_SCHEME_TERMS.some((term) => fullText.includes(term));
  if (!hasGovtScheme) {
    return false;
  }

  // 4. India / Government authority context check
  const hasIndiaContext = INDIA_GOVT_INDICATORS.some((term) => fullText.includes(term));
  if (!hasIndiaContext) {
    return false;
  }

  // 5. Reject obituary/personality news unless announcing a concrete policy/scheme
  if (fullText.includes('passes away') || fullText.includes('dead at') || fullText.includes('dies at') || fullText.includes('obituary')) {
    if (!fullText.includes('scheme') && !fullText.includes('subsidy') && !fullText.includes('policy') && !fullText.includes('package')) {
      return false;
    }
  }

  return true;
};

/**
 * Fetch latest agricultural and farmer-related government news from News API with strict server-side relevance filtering
 * @param {Object} options
 * @param {string} options.query - Optional custom search query keyword
 * @param {number} options.pageSize - Number of articles to fetch
 * @param {number} options.page - Page number
 * @returns {Promise<Object>} Formatted and strictly filtered government scheme news articles
 */
export const fetchFarmerNews = async ({ query = '', pageSize = 20, page = 1 } = {}) => {
  const apiKey = (process.env.NEWS_API_KEY || '').trim();

  if (!apiKey || apiKey === 'mock_news_key' || apiKey === 'your_news_api_key_here') {
    const error = new Error('Live news service is currently unavailable.');
    error.statusCode = 503;
    error.code = 'NEWS_SERVICE_UNAVAILABLE';
    throw error;
  }

  // Construct search query
  let searchQuery = STRICT_AGRI_SCHEME_QUERY;
  if (query && query.trim()) {
    const cleanQ = query.trim();
    searchQuery = `(${cleanQ}) AND (${STRICT_AGRI_SCHEME_QUERY})`;
  }

  const params = new URLSearchParams({
    q: searchQuery,
    language: 'en',
    sortBy: 'publishedAt',
    pageSize: '50', // Fetch candidate pool of 50 for strict server-side filtering
    page: String(page),
  });

  const url = `https://newsapi.org/v2/everything?${params.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-Api-Key': apiKey,
      'User-Agent': 'FarmSetu-App/1.0',
    },
  });

  const data = await response.json();

  if (!response.ok || data.status === 'error') {
    const errorMsg = data.message || `News API request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.statusCode = response.status >= 400 && response.status < 600 ? response.status : 502;
    error.code = data.code || 'NEWS_API_ERROR';
    throw error;
  }

  const rawArticles = data.articles || [];
  const seenTitles = new Set();
  const filteredArticles = [];

  for (const article of rawArticles) {
    if (isValidSchemeArticle(article)) {
      // Normalize title for deduplication
      const normTitle = article.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 40);
      if (seenTitles.has(normTitle)) continue;
      seenTitles.add(normTitle);

      const topic = classifySchemeTopic(article.title, article.description || '');

      filteredArticles.push({
        title: article.title,
        description: article.description,
        source: article.source?.name || 'Government & Agri News',
        url: article.url,
        urlToImage: article.urlToImage || null,
        publishedAt: article.publishedAt,
        author: article.author || null,
        content: article.content || null,
        topic,
      });
    }
  }

  // Limit to requested pageSize
  const limitedArticles = filteredArticles.slice(0, pageSize || 20);

  return {
    totalResults: filteredArticles.length,
    articles: limitedArticles,
  };
};
