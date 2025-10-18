import { parseQuery, isEmergencyQuery } from './nlp';
import { detectLanguage } from './translationService';

export interface VoiceCommandResult {
  originalText: string;
  detectedLanguage: string;
  intent: string;
  targetScreen?: string;
  filterParams?: {
    type?: string;
    rating?: number;
    emergency?: boolean;
    searchQuery?: string;
    minRating?: number;
    openNow?: boolean;
    [key: string]: any;
  };
}

/**
 * Process voice command and determine navigation target and parameters
 * @param text - Voice command text
 * @returns VoiceCommandResult object with navigation info
 */
export function processVoiceCommand(text: string): VoiceCommandResult {
  if (!text) {
    return {
      originalText: '',
      detectedLanguage: 'en',
      intent: 'unknown'
    };
  }

  const language = detectLanguage(text);
  const parsedQuery = parseQuery(text, language);
  const isEmergency = isEmergencyQuery(text, language);
  const lowerText = text.toLowerCase();
  
  // Determine target screen based on keywords
  let targetScreen = 'Home'; // Default target
  let filterParams: VoiceCommandResult['filterParams'] = {};
  
  // Enhanced navigation logic with multi-language support
  
  // 1. Check for saved/bookmarks screen (English + Hindi + Telugu)
  const savedKeywords = [
    // English
    'saved', 'bookmark', 'favorite', 'bookmarked', 'my saved', 'saved resources',
    // Hindi
    'सेव', 'सेव्ड', 'बुकमार्क', 'पसंदीदा', 'मेरे सेव्ड',
    // Telugu  
    'సేవ్', 'సేవ్డ్', 'బుక్‌మార్క్', 'ఇష్టమైన', 'నా సేవ్డ్'
  ];
  
  const hasSavedKeyword = savedKeywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
  const hasNavigationToSaved = (
    (lowerText.includes('watch') && hasSavedKeyword) ||
    (lowerText.includes('show') && hasSavedKeyword) ||
    (lowerText.includes('see') && hasSavedKeyword) ||
    (lowerText.includes('open') && hasSavedKeyword) ||
    (lowerText.includes('go to') && hasSavedKeyword) ||
    // Hindi navigation
    (lowerText.includes('दिखाओ') && hasSavedKeyword) ||
    (lowerText.includes('खोलो') && hasSavedKeyword) ||
    // Telugu navigation
    (lowerText.includes('చూపించు') && hasSavedKeyword) ||
    (lowerText.includes('తెరువు') && hasSavedKeyword)
  );
  
  if (hasSavedKeyword || hasNavigationToSaved) {
    targetScreen = 'Saved';
    return {
      originalText: text,
      detectedLanguage: language,
      intent: 'navigation',
      targetScreen
    };
  } 
  
  // 2. Check for map screen
  else if (lowerText.includes('map') || 
           lowerText.includes('location') || 
           lowerText.includes('direction') ||
           lowerText.includes('navigate') ||
           lowerText.includes('route')) {
    targetScreen = 'Maps';
    // If it's a search on map, pass the query
    if (parsedQuery.intent.type !== 'general') {
      filterParams = {
        type: parsedQuery.intent.type === 'clinic' ? 'clinic' : 
              parsedQuery.intent.type === 'pharmacy' ? 'pharmacy' :
              parsedQuery.intent.type === 'blood' ? 'blood' : undefined,
        searchQuery: getSearchQueryFromVoice(text)
      };
    }
  } 
  
  // 3. Check for settings screen
  else if (lowerText.includes('setting') || 
           lowerText.includes('preference') || 
           lowerText.includes('config') ||
           lowerText.includes('language') ||
           lowerText.includes('theme')) {
    targetScreen = 'Settings';
    return {
      originalText: text,
      detectedLanguage: language,
      intent: 'navigation',
      targetScreen
    };
  } 
  
  // 4. Default to home with enhanced search parameters
  else {
    targetScreen = 'Home';
    
    // Enhanced filter parameters based on voice command
    filterParams = {
      searchQuery: getSearchQueryFromVoice(text),
      type: parsedQuery.intent.type === 'clinic' ? 'clinic' : 
            parsedQuery.intent.type === 'pharmacy' ? 'pharmacy' :
            parsedQuery.intent.type === 'blood' ? 'blood' : undefined,
      emergency: isEmergency
    };
    
    // Quality indicators
    if (lowerText.includes('best') || 
        lowerText.includes('top') || 
        lowerText.includes('good') ||
        lowerText.includes('excellent') ||
        lowerText.includes('high rated') ||
        lowerText.includes('highly rated')) {
      filterParams.minRating = 4;
    }
    
    // Time-based filters
    if (lowerText.includes('open now') || 
        lowerText.includes('currently open') ||
        lowerText.includes('available now')) {
      filterParams.openNow = true;
    }
    
    // Distance/location indicators
    if (lowerText.includes('near') || 
        lowerText.includes('nearby') || 
        lowerText.includes('close') ||
        lowerText.includes('around') ||
        lowerText.includes('local')) {
      filterParams.near = true;
    }
    
    // Emergency handling
    if (isEmergency) {
      filterParams.emergency = true;
      filterParams.openNow = true; // Emergency usually needs immediate availability
    }
  }
  
  return {
    originalText: text,
    detectedLanguage: language,
    intent: parsedQuery.intent.type,
    targetScreen,
    filterParams
  };
}

/**
 * Get search query from voice command
 * @param text - Voice command text
 * @returns Processed search query
 */
export function getSearchQueryFromVoice(text: string): string {
  if (!text) return '';
  
  const language = detectLanguage(text);
  const parsedQuery = parseQuery(text, language);
  
  // Remove common command words to get cleaner search query
  let cleanQuery = text;
  const commandWords = [
    'find', 'search', 'look for', 'show me', 'get', 'locate',
    'nearby', 'close', 'nearest', 'best', 'top', 'good'
  ];
  
  commandWords.forEach(word => {
    cleanQuery = cleanQuery.replace(new RegExp(`\\b${word}\\b`, 'gi'), '');
  });
  
  return cleanQuery.trim();
}