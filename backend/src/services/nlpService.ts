import VoiceCommand from '../models/VoiceCommand';

// Language detection patterns
const LANGUAGE_PATTERNS = {
  hi: /[\u0900-\u097F]/, // Devanagari (Hindi)
  te: /[\u0C00-\u0C7F]/, // Telugu
  ta: /[\u0B80-\u0BFF]/, // Tamil
  kn: /[\u0C80-\u0CFF]/, // Kannada
  ml: /[\u0D00-\u0D7F]/, // Malayalam
  bn: /[\u0980-\u09FF]/, // Bengali
  gu: /[\u0A80-\u0AFF]/, // Gujarati
  mr: /[\u0900-\u097F]/, // Marathi (uses Devanagari)
  pa: /[\u0A00-\u0A7F]/, // Punjabi
  ur: /[\u0600-\u06FF]/, // Urdu (Arabic script)
  en: /^[a-zA-Z\s\d\.,!?'"()-]+$/ // English (basic Latin)
};

// Multi-language keyword mappings
const KEYWORDS = {
  // Resource types
  resourceTypes: {
    en: {
      clinic: ['clinic', 'hospital', 'doctor', 'medical center', 'health center', 'dispensary'],
      pharmacy: ['pharmacy', 'medical store', 'chemist', 'drug store', 'medicine shop'],
      blood: ['blood bank', 'blood center', 'blood donation', 'plasma center'],
      hospital: ['hospital', 'medical college', 'nursing home', 'healthcare facility']
    },
    hi: {
      clinic: ['क्लिनिक', 'अस्पताल', 'डॉक्टर', 'चिकित्सा केंद्र', 'स्वास्थ्य केंद्र'],
      pharmacy: ['दवाखाना', 'फार्मेसी', 'दवा की दुकान', 'केमिस्ट', 'औषधालय'],
      blood: ['रक्त बैंक', 'खून बैंक', 'रक्तदान केंद्र', 'ब्लड बैंक'],
      hospital: ['अस्पताल', 'चिकित्सालय', 'नर्सिंग होम']
    },
    te: {
      clinic: ['క్लినిక్', 'ఆసుపత్రి', 'డాక్టర్', 'వైద్య కేంద్రం', 'ఆరోగ్య కేంద్రం'],
      pharmacy: ['ఫార్మసీ', 'మందుల దుకాణం', 'కెమిస్ట్', 'ఔషధాలయం'],
      blood: ['బ్లడ్ బ్యాంక్', 'రక్త బ్యాంక్', 'రక్తదాన కేంద్రం'],
      hospital: ['ఆసుపత్రి', 'వైద్యశాల', 'నర్సింగ్ హోమ్']
    }
  },
  
  // Actions
  actions: {
    en: {
      find: ['find', 'search', 'look for', 'locate', 'get', 'show me'],
      show: ['show', 'display', 'open', 'view', 'see'],
      navigate: ['go to', 'take me to', 'navigate to', 'open']
    },
    hi: {
      find: ['खोजो', 'ढूंढो', 'तलाश करो', 'दिखाओ', 'बताओ'],
      show: ['दिखाओ', 'खोलो', 'देखो', 'प्रदर्शित करो'],
      navigate: ['जाओ', 'ले चलो', 'खोलो']
    },
    te: {
      find: ['వెతకండి', 'కనుగొనండి', 'చూపించండి', 'తెలియజేయండి'],
      show: ['చూపించు', 'తెరువు', 'చూడండి', 'ప్రదర్శించు'],
      navigate: ['వెళ్ళు', 'తీసుకెళ్ళు', 'తెరువు']
    }
  },
  
  // Quality indicators
  quality: {
    en: {
      best: ['best', 'top', 'excellent', 'good', 'high rated', 'highly rated', 'quality'],
      emergency: ['emergency', 'urgent', 'immediate', 'asap', 'quick', 'fast']
    },
    hi: {
      best: ['सबसे अच्छा', 'बेस्ट', 'उत्तम', 'अच्छा', 'उच्च रेटेड'],
      emergency: ['आपातकाल', 'जरूरी', 'तुरंत', 'तत्काल', 'जल्दी']
    },
    te: {
      best: ['ఉత్తమ', 'బెస్ట్', 'మంచి', 'అత్యుत్తమ', 'హై రేటెड్'],
      emergency: ['అత్యవసరం', 'అవసరం', 'వెంటనే', 'తక్షణం', 'త్వరగా']
    }
  },
  
  // Location indicators
  location: {
    en: ['near', 'nearby', 'close', 'around', 'local', 'here', 'current location'],
    hi: ['पास', 'नजदीक', 'आसपास', 'यहाँ', 'स्थानीय', 'वर्तमान स्थान'],
    te: ['దగ్గర', 'దగ్గరలో', 'ఇక్కడ', 'స్థానిక', 'ప్రస్తుత స్థానం']
  },
  
  // Navigation targets
  targets: {
    en: {
      saved: ['saved', 'bookmarks', 'favorites', 'bookmarked', 'my saved'],
      settings: ['settings', 'preferences', 'configuration', 'options'],
      map: ['map', 'maps', 'directions', 'navigation', 'route']
    },
    hi: {
      saved: ['सेव्ड', 'बुकमार्क', 'पसंदीदा', 'मेरे सेव्ड'],
      settings: ['सेटिंग्स', 'प्राथमिकताएं', 'विकल्प'],
      map: ['मैप', 'नक्शा', 'दिशा', 'रूट']
    },
    te: {
      saved: ['సేవ్డ్', 'బుక్‌మార్క్', 'ఇష్టమైన', 'నా సేవ్డ్'],
      settings: ['సెట్టింగ్స్', 'ప్రాధాన్యతలు', 'ఎంపికలు'],
      map: ['మ్యాప్', 'మ్యాప్స్', 'దిశలు', 'రూట్']
    }
  }
};

/**
 * Detect language from text
 */
export function detectLanguage(text: string): string {
  if (!text) return 'en';
  
  for (const [lang, pattern] of Object.entries(LANGUAGE_PATTERNS)) {
    if (pattern.test(text)) {
      return lang;
    }
  }
  
  return 'en'; // Default to English
}

/**
 * Extract entities from text using NLP
 */
export function extractEntities(text: string, language: string = 'en') {
  const lowerText = text.toLowerCase();
  const entities: any = {};
  
  // Get language-specific keywords
  const langKeywords = {
    resourceTypes: KEYWORDS.resourceTypes[language as keyof typeof KEYWORDS.resourceTypes] || KEYWORDS.resourceTypes.en,
    actions: KEYWORDS.actions[language as keyof typeof KEYWORDS.actions] || KEYWORDS.actions.en,
    quality: KEYWORDS.quality[language as keyof typeof KEYWORDS.quality] || KEYWORDS.quality.en,
    location: KEYWORDS.location[language as keyof typeof KEYWORDS.location] || KEYWORDS.location.en,
    targets: KEYWORDS.targets[language as keyof typeof KEYWORDS.targets] || KEYWORDS.targets.en
  };
  
  // Extract resource type
  for (const [type, keywords] of Object.entries(langKeywords.resourceTypes)) {
    if (keywords.some(keyword => lowerText.includes(keyword.toLowerCase()))) {
      entities.resourceType = type;
      break;
    }
  }
  
  // Extract action
  for (const [action, keywords] of Object.entries(langKeywords.actions)) {
    if (keywords.some(keyword => lowerText.includes(keyword.toLowerCase()))) {
      entities.action = action;
      break;
    }
  }
  
  // Extract quality indicators
  for (const [quality, keywords] of Object.entries(langKeywords.quality)) {
    if (keywords.some(keyword => lowerText.includes(keyword.toLowerCase()))) {
      entities.quality = quality;
      break;
    }
  }
  
  // Extract location indicators
  if (langKeywords.location.some(keyword => lowerText.includes(keyword.toLowerCase()))) {
    entities.location = 'nearby';
  }
  
  // Extract navigation targets
  for (const [target, keywords] of Object.entries(langKeywords.targets)) {
    if (keywords.some(keyword => lowerText.includes(keyword.toLowerCase()))) {
      entities.target = target;
      break;
    }
  }
  
  // Extract availability
  const availabilityKeywords = ['open', 'available', 'now', 'currently', 'खुला', 'उपलब्ध', 'తెరిచి', 'అందుబాటులో'];
  if (availabilityKeywords.some(keyword => lowerText.includes(keyword.toLowerCase()))) {
    entities.availability = 'now';
  }
  
  return entities;
}

/**
 * Determine intent from entities and text
 */
export function determineIntent(text: string, entities: any) {
  const lowerText = text.toLowerCase();
  
  // Conversational intents
  const greetings = ['hi', 'hello', 'hey', 'good morning', 'good evening', 'namaste', 'नमस्ते', 'హలో', 'வணக்கம்'];
  const thanks = ['thank you', 'thanks', 'धन्यवाद', 'ధన్యవాదాలు', 'நன்றி'];
  const help = ['help', 'assist', 'support', 'मदद', 'సహాయం', 'உதவி'];
  
  if (greetings.some(greeting => lowerText.includes(greeting))) {
    return {
      type: 'greeting',
      confidence: 0.95
    };
  }
  
  if (thanks.some(thank => lowerText.includes(thank))) {
    return {
      type: 'thanks',
      confidence: 0.95
    };
  }
  
  if (help.some(helpWord => lowerText.includes(helpWord))) {
    return {
      type: 'help',
      confidence: 0.9
    };
  }
  
  // Emergency intent
  if (entities.quality === 'emergency' || entities.urgency) {
    return {
      type: 'emergency',
      confidence: 0.95
    };
  }
  
  // Navigation intent
  if (entities.target) {
    return {
      type: 'navigation',
      confidence: 0.9
    };
  }
  
  // Search intent
  if (entities.resourceType || entities.action === 'find') {
    return {
      type: 'search',
      confidence: 0.85
    };
  }
  
  // Filter intent
  if (entities.quality || entities.availability || entities.location) {
    return {
      type: 'filter',
      confidence: 0.8
    };
  }
  
  // Default to conversation
  return {
    type: 'conversation',
    confidence: 0.6
  };
}

/**
 * Generate conversational responses
 */
export function generateResponse(intent: any, entities: any, text: string, language: string = 'en') {
  const responses = {
    greeting: {
      en: [
        "Hi! How can I help you find healthcare resources today?",
        "Hello! I'm here to help you locate clinics, pharmacies, and blood banks. What do you need?",
        "Hey there! Looking for medical facilities? I can help you find them."
      ],
      hi: [
        "नमस्ते! आज मैं आपको स्वास्थ्य सेवाओं को खोजने में कैसे मदद कर सकता हूं?",
        "हैलो! मैं यहां आपको क्लिनिक, फार्मेसी और ब्लड बैंक खोजने में मदद करने के लिए हूं। आपको क्या चाहिए?",
        "नमस्कार! चिकित्सा सुविधाओं की तलाश कर रहे हैं? मैं आपकी मदद कर सकता हूं।"
      ],
      te: [
        "హలో! ఈరోజు ఆరోగ్య వనరులను కనుగొనడంలో నేను మీకు ఎలా సహాయపడగలను?",
        "నమస్కారం! క్లినిక్‌లు, ఫార్మసీలు మరియు బ్లడ్ బ్యాంక్‌లను కనుగొనడంలో మీకు సహాయం చేయడానికి నేను ఇక్కడ ఉన్నాను। మీకు ఏమి కావాలి?",
        "హాయ్! వైద్య సౌకర్యాల కోసం చూస్తున్నారా? నేను మీకు వాటిని కనుగొనడంలో సహాయపడగలను."
      ]
    },
    thanks: {
      en: [
        "You're welcome! Is there anything else I can help you with?",
        "Happy to help! Need assistance with anything else?",
        "Glad I could help! What else can I do for you?"
      ],
      hi: [
        "आपका स्वागत है! क्या कोई और चीज़ है जिसमें मैं आपकी मदद कर सकता हूं?",
        "मदद करके खुशी हुई! कुछ और सहायता चाहिए?",
        "खुशी है कि मैं मदद कर सका! मैं आपके लिए और क्या कर सकता हूं?"
      ],
      te: [
        "మీకు స్వాగతం! నేను మీకు సహాయపడగల మరేదైనా ఉందా?",
        "సహాయం చేయడంలో సంతోషం! మరేదైనా సహాయం కావాలా?",
        "నేను సహాయపడగలిగినందుకు సంతోషం! నేను మీ కోసం ఇంకా ఏమి చేయగలను?"
      ]
    },
    help: {
      en: [
        "I can help you find nearby clinics, pharmacies, and blood banks. Try saying 'find clinics near me' or 'show pharmacies'.",
        "I'm here to locate healthcare facilities for you. You can ask for hospitals, medical stores, or blood donation centers.",
        "I can assist with finding medical resources. Just tell me what type of healthcare facility you need!"
      ],
      hi: [
        "मैं आपको नजदीकी क्लिनिक, फार्मेसी और ब्लड बैंक खोजने में मदद कर सकता हूं। 'मेरे पास क्लिनिक खोजें' या 'फार्मेसी दिखाएं' कहने की कोशिश करें।",
        "मैं आपके लिए स्वास्थ्य सुविधाओं का पता लगाने के लिए यहां हूं। आप अस्पतालों, मेडिकल स्टोर या रक्तदान केंद्रों के लिए पूछ सकते हैं।",
        "मैं चिकित्सा संसाधन खोजने में सहायता कर सकता हूं। बस मुझे बताएं कि आपको किस प्रकार की स्वास्थ्य सुविधा चाहिए!"
      ],
      te: [
        "నేను మీకు సమీపంలోని క్లినిక్‌లు, ఫార్మసీలు మరియు బ్లడ్ బ్యాంక్‌లను కనుగొనడంలో సహాయపడగలను. 'నా దగ్గర క్లినిక్‌లను కనుగొనండి' లేదా 'ఫార్మసీలను చూపించండి' అని చెప్పడానికి ప్రయత్నించండి.",
        "మీ కోసం ఆరోగ్య సౌకర్యాలను గుర్తించడానికి నేను ఇక్కడ ఉన్నాను. మీరు ఆసుపత్రులు, మెడికల్ స్టోర్లు లేదా రక్తదాన కేంద్రాల కోసం అడగవచ్చు.",
        "వైద్య వనరులను కనుగొనడంలో నేను సహాయపడగలను. మీకు ఎలాంటి ఆరోగ్య సౌకర్యం కావాలో నాకు చెప్పండి!"
      ]
    },
    conversation: {
      en: [
        "I didn't quite understand that. Could you tell me what healthcare facility you're looking for?",
        "I'm here to help you find medical resources. What can I help you locate today?",
        "Could you be more specific? I can help you find clinics, pharmacies, or blood banks."
      ],
      hi: [
        "मुझे वह समझ नहीं आया। क्या आप मुझे बता सकते हैं कि आप किस स्वास्थ्य सुविधा की तलाश कर रहे हैं?",
        "मैं आपको चिकित्सा संसाधन खोजने में मदद करने के लिए यहां हूं। आज मैं आपको क्या खोजने में मदद कर सकता हूं?",
        "क्या आप अधिक स्पष्ट हो सकते हैं? मैं आपको क्लिनिक, फार्मेसी या ब्लड बैंक खोजने में मदद कर सकता हूं।"
      ],
      te: [
        "నాకు అది బాగా అర్థం కాలేదు. మీరు ఏ ఆరోగ్య సౌకర్యం కోసం చూస్తున్నారో నాకు చెప్పగలరా?",
        "వైద్య వనరులను కనుగొనడంలో మీకు సహాయపడటానికి నేను ఇక్కడ ఉన్నాను. ఈరోజు నేను మీకు ఏమి గుర్తించడంలో సహాయపడగలను?",
        "మీరు మరింత నిర్దిష్టంగా చెప్పగలరా? నేను మీకు క్లినిక్‌లు, ఫార్మసీలు లేదా బ్లడ్ బ్యాంక్‌లను కనుగొనడంలో సహాయపడగలను."
      ]
    }
  };
  
  const langResponses = responses[intent.type as keyof typeof responses]?.[language as keyof typeof responses.greeting] || 
                      responses[intent.type as keyof typeof responses]?.en || 
                      responses.conversation.en;
  
  return langResponses[Math.floor(Math.random() * langResponses.length)];
}

/**
 * Generate navigation instructions
 */
export function generateNavigation(intent: any, entities: any, text: string) {
  // Navigation targets
  if (entities.target === 'saved') {
    return {
      targetScreen: 'Saved',
      filterParams: {}
    };
  }
  
  if (entities.target === 'settings') {
    return {
      targetScreen: 'Settings',
      filterParams: {}
    };
  }
  
  if (entities.target === 'map') {
    return {
      targetScreen: 'Maps',
      filterParams: {
        searchQuery: text,
        type: entities.resourceType
      }
    };
  }
  
  // Default to Home with filters
  const filterParams: any = {
    searchQuery: text
  };
  
  // Apply resource type filter
  if (entities.resourceType) {
    filterParams.type = entities.resourceType;
  }
  
  // Apply quality filters
  if (entities.quality === 'best') {
    filterParams.minRating = 4;
  }
  
  // Apply availability filters
  if (entities.availability === 'now') {
    filterParams.openNow = true;
  }
  
  // Apply location filters
  if (entities.location === 'nearby') {
    filterParams.near = true;
  }
  
  // Apply emergency filters
  if (intent.type === 'emergency') {
    filterParams.emergency = true;
    filterParams.openNow = true;
  }
  
  return {
    targetScreen: 'Home',
    filterParams
  };
}

/**
 * Main NLP processing function
 */
export async function processVoiceCommand(
  text: string, 
  userContext?: { 
    userId?: string; 
    location?: { lat: number; lng: number }; 
    previousQueries?: string[] 
  }
) {
  try {
    // Detect language
    const detectedLanguage = detectLanguage(text);
    
    // Extract entities
    const entities = extractEntities(text, detectedLanguage);
    
    // Determine intent
    const intent = determineIntent(text, entities);
    
    // Generate conversational response
    const conversationalResponse = generateResponse(intent, entities, text, detectedLanguage);
    
    // Generate navigation (only for actionable intents)
    const navigation = ['search', 'navigation', 'filter', 'emergency'].includes(intent.type) 
      ? generateNavigation(intent, entities, text)
      : null;
    
    // Create voice command record
    const voiceCommand = new VoiceCommand({
      originalText: text,
      detectedLanguage,
      intent: {
        type: intent.type,
        confidence: intent.confidence,
        entities
      },
      navigation: navigation || { targetScreen: 'Home', filterParams: {} },
      userContext
    });
    
    // Save to database for analytics
    await voiceCommand.save();
    
    return {
      success: true,
      data: {
        originalText: text,
        detectedLanguage,
        intent: {
          type: intent.type,
          confidence: intent.confidence,
          entities
        },
        response: conversationalResponse,
        navigation,
        shouldNavigate: navigation !== null,
        processingTime: Date.now()
      }
    };
    
  } catch (error) {
    console.error('NLP processing error:', error);
    
    // Fallback response
    return {
      success: false,
      error: 'Failed to process voice command',
      data: {
        originalText: text,
        detectedLanguage: 'en',
        intent: {
          type: 'search',
          confidence: 0.5,
          entities: {}
        },
        navigation: {
          targetScreen: 'Home',
          filterParams: { searchQuery: text }
        }
      }
    };
  }
}

/**
 * Get analytics for voice commands
 */
export async function getVoiceCommandAnalytics(userId?: string) {
  try {
    const query = userId ? { 'userContext.userId': userId } : {};
    
    const analytics = await VoiceCommand.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$intent.type',
          count: { $sum: 1 },
          avgConfidence: { $avg: '$intent.confidence' },
          commonEntities: { $push: '$intent.entities' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    return {
      success: true,
      data: analytics
    };
  } catch (error) {
    console.error('Analytics error:', error);
    return {
      success: false,
      error: 'Failed to get analytics'
    };
  }
}