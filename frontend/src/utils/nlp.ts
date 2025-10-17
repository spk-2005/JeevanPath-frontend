/**
 * Natural Language Processing utilities for JeevanPath
 * Provides intent detection and query parsing for healthcare resource search
 */

export interface SearchIntent {
  type: 'clinic' | 'pharmacy' | 'blood' | 'general';
  confidence: number;
  keywords: string[];
  location?: string;
  urgency?: 'low' | 'medium' | 'high';
  services?: string[];
}

export interface ParsedQuery {
  intent: SearchIntent;
  originalText: string;
  processedText: string;
  language: string;
}

// Keyword mappings for different languages
const KEYWORD_MAPPINGS = {
  // English keywords
  en: {
    clinic: ['clinic', 'hospital', 'doctor', 'medical', 'health', 'care', 'treatment', 'consultation', 'checkup', 'examination'],
    pharmacy: ['pharmacy', 'medicine', 'drug', 'medication', 'prescription', 'chemist', 'medical store', 'drugstore', 'pills', 'tablets'],
    blood: ['blood', 'blood bank', 'donation', 'transfusion', 'plasma', 'donate blood', 'blood center', 'hematology'],
    emergency: ['emergency', 'urgent', 'immediate', 'critical', 'asap', 'quick', 'fast', 'now'],
    location: ['near', 'nearby', 'close', 'around', 'here', 'local', 'distance', 'walking', 'driving'],
    services: ['cardiology', 'dermatology', 'pediatrics', 'orthopedics', 'gynecology', 'neurology', 'oncology', 'psychiatry']
  },
  
  // Hindi keywords
  hi: {
    clinic: ['क्लिनिक', 'अस्पताल', 'डॉक्टर', 'चिकित्सा', 'स्वास्थ्य', 'उपचार', 'परीक्षा', 'जांच', 'देखभाल', 'चिकित्सालय'],
    pharmacy: ['औषधालय', 'फार्मेसी', 'दवा', 'दवाई', 'मेडिसिन', 'दवाखाना', 'केमिस्ट', 'गोली', 'टैबलेट', 'दवा की दुकान'],
    blood: ['खून', 'रक्त', 'रक्तदान', 'ब्लड बैंक', 'रक्त संचार', 'प्लाज्मा', 'हेमेटोलॉजी', 'रक्त केंद्र'],
    emergency: ['आपातकाल', 'जरूरी', 'तुरंत', 'अति आवश्यक', 'तत्काल', 'शीघ्र', 'अभी', 'फौरन'],
    location: ['पास', 'नजदीक', 'आसपास', 'यहाँ', 'स्थानीय', 'दूरी', 'चलकर', 'गाड़ी से'],
    services: ['हृदय रोग', 'त्वचा रोग', 'बाल रोग', 'हड्डी रोग', 'स्त्री रोग', 'मस्तिष्क रोग', 'कैंसर', 'मनोरोग']
  },
  
  // Telugu keywords
  te: {
    clinic: ['క్లినిక్', 'ఆసుపత్రి', 'డాక్టర్', 'వైద్యం', 'ఆరోగ్యం', 'చికిత్స', 'పరీక్ష', 'తనిఖీ', 'సంరక్షణ', 'వైద్యశాల'],
    pharmacy: ['ఔషధాలయం', 'ఫార్మసీ', 'మందు', 'మెడిసిన్', 'దవాఖానా', 'కెమిస్ట్', 'గోలీ', 'టాబ్లెట్', 'మందుల దుకాణం'],
    blood: ['రక్తం', 'రక్తదానం', 'బ్లడ్ బ్యాంక్', 'రక్త ప్రసరణ', 'ప్లాస్మా', 'హెమటాలజీ', 'రక్త కేంద్రం'],
    emergency: ['అత్యవసరం', 'అవసరం', 'వెంటనే', 'తక్షణం', 'ఇప్పుడే', 'త్వరగా', 'వేగంగా'],
    location: ['దగ్గర', 'కొద్ది దూరం', 'ఇక్కడ', 'స్థానిక', 'దూరం', 'నడిచి', 'కారులో'],
    services: ['హృదయ వ్యాధి', 'చర్మ వ్యాధి', 'పిల్లల వైద్యం', 'ఎముకల వ్యాధి', 'స్త్రీ వ్యాధి', 'మెదడు వ్యాధి', 'క్యాన్సర్', 'మనస్తత్వ వ్యాధి']
  },
  
  // Tamil keywords
  ta: {
    clinic: ['கிளினிக்', 'மருத்துவமனை', 'டாக்டர்', 'மருத்துவம்', 'ஆரோக்கியம்', 'சிகிச்சை', 'பரிசோதனை', 'சோதனை', 'பராமரிப்பு', 'மருத்துவமனை'],
    pharmacy: ['மருந்தகம்', 'பார்மசி', 'மருந்து', 'மெடிசின்', 'மருந்தகம்', 'கெமிஸ்ட்', 'மாத்திரை', 'டேப்லெட்', 'மருந்து கடை'],
    blood: ['இரத்தம்', 'இரத்த தானம்', 'பிளட் பாங்க்', 'இரத்த சுழற்சி', 'பிளாஸ்மா', 'ஹெமடாலஜி', 'இரத்த மையம்'],
    emergency: ['அவசரம்', 'தேவை', 'உடனடியாக', 'விரைவில்', 'இப்போது', 'வேகமாக'],
    location: ['அருகில்', 'அருகே', 'இங்கே', 'உள்ளூர்', 'தூரம்', 'நடந்து', 'காரில்'],
    services: ['இதய நோய்', 'தோல் நோய்', 'குழந்தை மருத்துவம்', 'எலும்பு நோய்', 'பெண் நோய்', 'மூளை நோய்', 'புற்றுநோய்', 'மனநலம்']
  },
  
  // Kannada keywords
  kn: {
    clinic: ['ಕ್ಲಿನಿಕ್', 'ಆಸ್ಪತ್ರೆ', 'ವೈದ್ಯ', 'ವೈದ್ಯಕೀಯ', 'ಆರೋಗ್ಯ', 'ಚಿಕಿತ್ಸೆ', 'ಪರೀಕ್ಷೆ', 'ತಪಾಸಣೆ', 'ಸಂರಕ್ಷಣೆ', 'ವೈದ್ಯಶಾಲೆ'],
    pharmacy: ['ಔಷಧಾಲಯ', 'ಫಾರ್ಮಸಿ', 'ಮದ್ದು', 'ಮೆಡಿಸಿನ್', 'ದವಾಖಾನೆ', 'ಕೆಮಿಸ್ಟ್', 'ಗುಳಿಗೆ', 'ಟ್ಯಾಬ್ಲೆಟ್', 'ಮದ್ದಿನ ಅಂಗಡಿ'],
    blood: ['ರಕ್ತ', 'ರಕ್ತದಾನ', 'ಬ್ಲಡ್ ಬ್ಯಾಂಕ್', 'ರಕ್ತ ಸಂಚಾರ', 'ಪ್ಲಾಸ್ಮಾ', 'ಹೆಮಟಾಲಜಿ', 'ರಕ್ತ ಕೇಂದ್ರ'],
    emergency: ['ಅತ್ಯವಸರ', 'ಅಗತ್ಯ', 'ತಕ್ಷಣ', 'ಇದೀಗ', 'ವೇಗವಾಗಿ'],
    location: ['ಹತ್ತಿರ', 'ಹತ್ತಿರದಲ್ಲಿ', 'ಇಲ್ಲಿ', 'ಸ್ಥಳೀಯ', 'ದೂರ', 'ನಡೆದು', 'ಕಾರಿನಲ್ಲಿ'],
    services: ['ಹೃದಯ ರೋಗ', 'ಚರ್ಮ ರೋಗ', 'ಮಕ್ಕಳ ವೈದ್ಯ', 'ಎಲುಬು ರೋಗ', 'ಸ್ತ್ರೀ ರೋಗ', 'ಮೆದುಳು ರೋಗ', 'ಕ್ಯಾನ್ಸರ್', 'ಮನೋರೋಗ']
  }
};

/**
 * Detect the primary intent from user query
 * @param text - User input text
 * @param language - Language code (default: 'en')
 * @returns SearchIntent object
 */
export function detectIntent(text: string, language: string = 'en'): SearchIntent {
  if (!text || text.trim() === '') {
    return {
      type: 'general',
      confidence: 0,
      keywords: [],
      urgency: 'low'
    };
  }

  const lowerText = text.toLowerCase();
  const keywords = language in KEYWORD_MAPPINGS ? KEYWORD_MAPPINGS[language as keyof typeof KEYWORD_MAPPINGS] : KEYWORD_MAPPINGS.en;
  
  let clinicScore = 0;
  let pharmacyScore = 0;
  let bloodScore = 0;
  let emergencyScore = 0;
  let locationScore = 0;
  let servicesScore = 0;
  
  const matchedKeywords: string[] = [];
  
  // Score each category
  keywords.clinic.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      clinicScore++;
      matchedKeywords.push(keyword);
    }
  });
  
  keywords.pharmacy.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      pharmacyScore++;
      matchedKeywords.push(keyword);
    }
  });
  
  keywords.blood.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      bloodScore++;
      matchedKeywords.push(keyword);
    }
  });
  
  keywords.emergency.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      emergencyScore++;
      matchedKeywords.push(keyword);
    }
  });
  
  keywords.location.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      locationScore++;
      matchedKeywords.push(keyword);
    }
  });
  
  keywords.services.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      servicesScore++;
      matchedKeywords.push(keyword);
    }
  });
  
  // Determine primary intent
  const scores = [
    { type: 'clinic' as const, score: clinicScore },
    { type: 'pharmacy' as const, score: pharmacyScore },
    { type: 'blood' as const, score: bloodScore }
  ];
  
  const maxScore = Math.max(...scores.map(s => s.score));
  const primaryIntent = maxScore > 0 ? scores.find(s => s.score === maxScore)?.type || 'general' : 'general';
  
  // Calculate confidence (0-1)
  const totalKeywords = matchedKeywords.length;
  const confidence = Math.min(totalKeywords / 3, 1); // Max confidence with 3+ keywords
  
  // Determine urgency
  let urgency: 'low' | 'medium' | 'high' = 'low';
  if (emergencyScore > 0) urgency = 'high';
  else if (locationScore > 0 || servicesScore > 0) urgency = 'medium';
  
  return {
    type: primaryIntent,
    confidence,
    keywords: matchedKeywords,
    urgency
  };
}

/**
 * Parse user query and extract structured information
 * @param text - User input text
 * @param language - Language code
 * @returns ParsedQuery object
 */
export function parseQuery(text: string, language: string = 'en'): ParsedQuery {
  const intent = detectIntent(text, language);
  
  // Extract location information
  const locationKeywords = language in KEYWORD_MAPPINGS ? 
    KEYWORD_MAPPINGS[language as keyof typeof KEYWORD_MAPPINGS].location : 
    KEYWORD_MAPPINGS.en.location;
  
  const locationMatch = locationKeywords.find(keyword => 
    text.toLowerCase().includes(keyword)
  );
  
  // Extract services
  const serviceKeywords = language in KEYWORD_MAPPINGS ? 
    KEYWORD_MAPPINGS[language as keyof typeof KEYWORD_MAPPINGS].services : 
    KEYWORD_MAPPINGS.en.services;
  
  const matchedServices = serviceKeywords.filter(keyword => 
    text.toLowerCase().includes(keyword)
  );
  
  return {
    intent: {
      ...intent,
      location: locationMatch,
      services: matchedServices
    },
    originalText: text,
    processedText: text.trim(),
    language
  };
}

/**
 * Generate search suggestions based on intent
 * @param intent - SearchIntent object
 * @param language - Language code
 * @returns Array of search suggestions
 */
export function generateSearchSuggestions(intent: SearchIntent, language: string = 'en'): string[] {
  const suggestions: string[] = [];
  
  if (intent.type === 'clinic') {
    if (language === 'hi') {
      suggestions.push('नजदीकी क्लिनिक', 'अस्पताल', 'डॉक्टर', 'चिकित्सा केंद्र');
    } else if (language === 'te') {
      suggestions.push('దగ్గర్లో క్లినిక్', 'ఆసుపత్రి', 'డాక్టర్', 'వైద్య కేంద్రం');
    } else {
      suggestions.push('nearby clinic', 'hospital', 'doctor', 'medical center');
    }
  } else if (intent.type === 'pharmacy') {
    if (language === 'hi') {
      suggestions.push('नजदीकी फार्मेसी', 'दवा की दुकान', 'औषधालय');
    } else if (language === 'te') {
      suggestions.push('దగ్గర్లో ఫార్మసీ', 'మందుల దుకాణం', 'ఔషధాలయం');
    } else {
      suggestions.push('nearby pharmacy', 'medicine store', 'drugstore');
    }
  } else if (intent.type === 'blood') {
    if (language === 'hi') {
      suggestions.push('रक्त बैंक', 'रक्तदान केंद्र', 'खून');
    } else if (language === 'te') {
      suggestions.push('బ్లడ్ బ్యాంక్', 'రక్తదాన కేంద్రం', 'రక్తం');
    } else {
      suggestions.push('blood bank', 'blood donation center', 'blood center');
    }
  }
  
  return suggestions;
}

/**
 * Check if query contains emergency keywords
 * @param text - User input text
 * @param language - Language code
 * @returns boolean indicating if query is emergency-related
 */
export function isEmergencyQuery(text: string, language: string = 'en'): boolean {
  const emergencyKeywords = language in KEYWORD_MAPPINGS ? 
    KEYWORD_MAPPINGS[language as keyof typeof KEYWORD_MAPPINGS].emergency : 
    KEYWORD_MAPPINGS.en.emergency;
  
  const lowerText = text.toLowerCase();
  return emergencyKeywords.some(keyword => lowerText.includes(keyword));
}

/**
 * Extract location information from query
 * @param text - User input text
 * @param language - Language code
 * @returns string | null - Extracted location or null
 */
export function extractLocation(text: string, language: string = 'en'): string | null {
  const locationKeywords = language in KEYWORD_MAPPINGS ? 
    KEYWORD_MAPPINGS[language as keyof typeof KEYWORD_MAPPINGS].location : 
    KEYWORD_MAPPINGS.en.location;
  
  const lowerText = text.toLowerCase();
  const locationMatch = locationKeywords.find(keyword => lowerText.includes(keyword));
  
  return locationMatch || null;
}

/**
 * Get supported languages for NLP processing
 * @returns Array of supported language codes
 */
export function getSupportedLanguages(): string[] {
  return Object.keys(KEYWORD_MAPPINGS);
}

/**
 * Validate if language is supported for NLP
 * @param language - Language code
 * @returns boolean indicating if language is supported
 */
export function isLanguageSupported(language: string): boolean {
  return language in KEYWORD_MAPPINGS;
}
