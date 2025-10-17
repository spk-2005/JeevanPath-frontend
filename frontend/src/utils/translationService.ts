import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TRANSLATE_API = 'https://libretranslate.de/translate';

// Language code mapping for better support
export const SUPPORTED_LANGUAGES = {
  en: 'English',
  hi: 'Hindi',
  te: 'Telugu',
  ta: 'Tamil',
  kn: 'Kannada',
  ml: 'Malayalam',
  bn: 'Bengali',
  gu: 'Gujarati',
  mr: 'Marathi',
  pa: 'Punjabi',
  ur: 'Urdu',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  ja: 'Japanese',
  ko: 'Korean',
  zh: 'Chinese'
};

export interface TranslationCache {
  [key: string]: string;
}

/**
 * Translate text using LibreTranslate API with caching
 * @param text - Text to translate
 * @param targetLang - Target language code (default: 'hi' for Hindi)
 * @param sourceLang - Source language code (default: 'en' for English)
 * @returns Promise<string> - Translated text
 */
export async function translateText(
  text: string, 
  targetLang: string = 'hi', 
  sourceLang: string = 'en'
): Promise<string> {
  if (!text || text.trim() === '') return text;
  
  const cacheKey = `${sourceLang}_${targetLang}_${text}`;
  
  try {
    // Check cache first
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      console.log('Translation cache hit:', cacheKey);
      return cached;
    }

    // If source and target are the same, no translation needed
    if (sourceLang === targetLang) {
      await AsyncStorage.setItem(cacheKey, text);
      return text;
    }

    console.log(`Translating: "${text}" from ${sourceLang} to ${targetLang}`);
    
    const response = await axios.post(TRANSLATE_API, {
      q: text,
      source: sourceLang,
      target: targetLang,
      format: 'text'
    }, {
      timeout: 10000, // 10 second timeout
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const translatedText = response.data.translatedText;
    
    if (translatedText && translatedText !== text) {
      // Cache the translation
      await AsyncStorage.setItem(cacheKey, translatedText);
      console.log('Translation successful:', translatedText);
      return translatedText;
    }
    
    return text; // Return original if translation failed
  } catch (error) {
    console.error('Translation error:', error);
    
    // Try to get cached translation as fallback
    try {
      const fallbackCache = await AsyncStorage.getItem(`${sourceLang}_en_${text}`);
      if (fallbackCache) {
        return await translateText(fallbackCache, targetLang, 'en');
      }
    } catch (fallbackError) {
      console.error('Fallback translation error:', fallbackError);
    }
    
    return text; // Return original text as final fallback
  }
}

/**
 * Detect language of input text (simple heuristic)
 * @param text - Input text
 * @returns string - Detected language code
 */
export function detectLanguage(text: string): string {
  if (!text) return 'en';
  
  const lowerText = text.toLowerCase();
  
  // Hindi detection
  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  
  // Telugu detection
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te';
  
  // Tamil detection
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta';
  
  // Kannada detection
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kn';
  
  // Malayalam detection
  if (/[\u0D00-\u0D7F]/.test(text)) return 'ml';
  
  // Bengali detection
  if (/[\u0980-\u09FF]/.test(text)) return 'bn';
  
  // Gujarati detection
  if (/[\u0A80-\u0AFF]/.test(text)) return 'gu';
  
  // Marathi detection (uses Devanagari script like Hindi)
  if (/[\u0900-\u097F]/.test(text) && lowerText.includes('मराठी')) return 'mr';
  
  // Punjabi detection
  if (/[\u0A00-\u0A7F]/.test(text)) return 'pa';
  
  // Urdu detection
  if (/[\u0600-\u06FF]/.test(text)) return 'ur';
  
  // Default to English
  return 'en';
}

/**
 * Translate multiple texts in batch
 * @param texts - Array of texts to translate
 * @param targetLang - Target language
 * @param sourceLang - Source language
 * @returns Promise<string[]> - Array of translated texts
 */
export async function translateBatch(
  texts: string[], 
  targetLang: string = 'hi', 
  sourceLang: string = 'en'
): Promise<string[]> {
  const translations = await Promise.allSettled(
    texts.map(text => translateText(text, targetLang, sourceLang))
  );
  
  return translations.map(result => 
    result.status === 'fulfilled' ? result.value : ''
  );
}

/**
 * Clear translation cache
 */
export async function clearTranslationCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const translationKeys = keys.filter(key => 
      key.includes('_') && key.split('_').length === 3
    );
    await AsyncStorage.multiRemove(translationKeys);
    console.log('Translation cache cleared');
  } catch (error) {
    console.error('Error clearing translation cache:', error);
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{totalKeys: number, translationKeys: number}> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const translationKeys = keys.filter(key => 
      key.includes('_') && key.split('_').length === 3
    );
    return {
      totalKeys: keys.length,
      translationKeys: translationKeys.length
    };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return { totalKeys: 0, translationKeys: 0 };
  }
}
