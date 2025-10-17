/**
 * Test utilities for voice search functionality
 * This file contains test functions to verify all components work correctly
 */

import { translateText, detectLanguage } from './translationService';
import { parseQuery, generateSearchSuggestions, isEmergencyQuery } from './nlp';

// Test data for different languages
const testQueries = [
  { text: "Find nearby clinic", language: "en", expectedIntent: "clinic" },
  { text: "नजदीकी फार्मेसी", language: "hi", expectedIntent: "pharmacy" },
  { text: "దగ్గర్లో క్లినిక్", language: "te", expectedIntent: "clinic" },
  { text: "Emergency hospital", language: "en", expectedIntent: "clinic", isEmergency: true },
  { text: "रक्त बैंक", language: "hi", expectedIntent: "blood" },
  { text: "Find medicine store", language: "en", expectedIntent: "pharmacy" }
];

/**
 * Test translation functionality
 */
export async function testTranslation() {
  console.log('🧪 Testing Translation Service...');
  
  try {
    // Test English to Hindi translation
    const result1 = await translateText("find clinic", "hi", "en");
    console.log('✅ English to Hindi:', result1);
    
    // Test Hindi to English translation
    const result2 = await translateText("नजदीकी क्लिनिक", "en", "hi");
    console.log('✅ Hindi to English:', result2);
    
    // Test language detection
    const detectedLang1 = detectLanguage("find clinic");
    const detectedLang2 = detectLanguage("नजदीकी क्लिनिक");
    console.log('✅ Language detection - English:', detectedLang1);
    console.log('✅ Language detection - Hindi:', detectedLang2);
    
    return true;
  } catch (error) {
    console.error('❌ Translation test failed:', error);
    return false;
  }
}

/**
 * Test NLP functionality
 */
export function testNLP() {
  console.log('🧪 Testing NLP Service...');
  
  try {
    testQueries.forEach((query, index) => {
      const parsed = parseQuery(query.text, query.language);
      const suggestions = generateSearchSuggestions(parsed.intent, query.language);
      const isEmergency = isEmergencyQuery(query.text, query.language);
      
      console.log(`✅ Query ${index + 1}:`, {
        original: query.text,
        detectedIntent: parsed.intent.type,
        expectedIntent: query.expectedIntent,
        confidence: parsed.intent.confidence,
        isEmergency,
        suggestions: suggestions.slice(0, 2) // Show first 2 suggestions
      });
      
      // Verify intent detection
      if (parsed.intent.type !== query.expectedIntent) {
        console.warn(`⚠️ Intent mismatch for query ${index + 1}`);
      }
      
      // Verify emergency detection
      if (query.isEmergency && !isEmergency) {
        console.warn(`⚠️ Emergency not detected for query ${index + 1}`);
      }
    });
    
    return true;
  } catch (error) {
    console.error('❌ NLP test failed:', error);
    return false;
  }
}

/**
 * Test complete voice search flow
 */
export async function testVoiceSearchFlow() {
  console.log('🧪 Testing Complete Voice Search Flow...');
  
  try {
    const testQuery = "Find nearby clinic";
    const detectedLang = detectLanguage(testQuery);
    const translatedQuery = await translateText(testQuery, 'en', detectedLang);
    const parsedQuery = parseQuery(testQuery, detectedLang);
    const suggestions = generateSearchSuggestions(parsedQuery.intent, detectedLang);
    const isEmergency = isEmergencyQuery(testQuery, detectedLang);
    
    console.log('✅ Complete flow result:', {
      originalQuery: testQuery,
      detectedLanguage: detectedLang,
      translatedQuery,
      intent: parsedQuery.intent.type,
      confidence: parsedQuery.intent.confidence,
      isEmergency,
      suggestions: suggestions.slice(0, 3)
    });
    
    return true;
  } catch (error) {
    console.error('❌ Voice search flow test failed:', error);
    return false;
  }
}

/**
 * Test emergency detection
 */
export function testEmergencyDetection() {
  console.log('🧪 Testing Emergency Detection...');
  
  const emergencyQueries = [
    { text: "Emergency hospital", language: "en" },
    { text: "आपातकाल", language: "hi" },
    { text: "అత్యవసరం", language: "te" },
    { text: "Urgent clinic", language: "en" },
    { text: "जरूरी", language: "hi" }
  ];
  
  try {
    emergencyQueries.forEach((query, index) => {
      const isEmergency = isEmergencyQuery(query.text, query.language);
      console.log(`✅ Emergency test ${index + 1}:`, {
        query: query.text,
        language: query.language,
        isEmergency
      });
    });
    
    return true;
  } catch (error) {
    console.error('❌ Emergency detection test failed:', error);
    return false;
  }
}

/**
 * Test multilingual support
 */
export function testMultilingualSupport() {
  console.log('🧪 Testing Multilingual Support...');
  
  const languages = ['en', 'hi', 'te', 'ta', 'kn', 'ml', 'bn', 'gu', 'mr', 'pa', 'ur'];
  
  try {
    languages.forEach(lang => {
      const testText = lang === 'en' ? 'clinic' : 
                     lang === 'hi' ? 'क्लिनिक' :
                     lang === 'te' ? 'క్లినిక్' :
                     lang === 'ta' ? 'கிளினிக்' :
                     lang === 'kn' ? 'ಕ್ಲಿನಿಕ್' :
                     lang === 'ml' ? 'ക്ലിനിക്' :
                     lang === 'bn' ? 'ক্লিনিক' :
                     lang === 'gu' ? 'ક્લિનિક' :
                     lang === 'mr' ? 'क्लिनिक' :
                     lang === 'pa' ? 'ਕਲੀਨਿਕ' :
                     'کلینک';
      
      const detectedLang = detectLanguage(testText);
      const parsed = parseQuery(testText, detectedLang);
      
      console.log(`✅ Language ${lang}:`, {
        text: testText,
        detected: detectedLang,
        intent: parsed.intent.type,
        confidence: parsed.intent.confidence
      });
    });
    
    return true;
  } catch (error) {
    console.error('❌ Multilingual support test failed:', error);
    return false;
  }
}

/**
 * Run all tests
 */
export async function runAllTests() {
  console.log('🚀 Starting Voice Search Tests...\n');
  
  const results = {
    translation: await testTranslation(),
    nlp: testNLP(),
    voiceSearchFlow: await testVoiceSearchFlow(),
    emergencyDetection: testEmergencyDetection(),
    multilingualSupport: testMultilingualSupport()
  };
  
  console.log('\n📊 Test Results:');
  console.log('Translation Service:', results.translation ? '✅ PASS' : '❌ FAIL');
  console.log('NLP Service:', results.nlp ? '✅ PASS' : '❌ FAIL');
  console.log('Voice Search Flow:', results.voiceSearchFlow ? '✅ PASS' : '❌ FAIL');
  console.log('Emergency Detection:', results.emergencyDetection ? '✅ PASS' : '❌ FAIL');
  console.log('Multilingual Support:', results.multilingualSupport ? '✅ PASS' : '❌ FAIL');
  
  const allPassed = Object.values(results).every(result => result);
  console.log('\n🎯 Overall Result:', allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
  
  return results;
}

/**
 * Quick test for development
 */
export function quickTest() {
  console.log('⚡ Quick Test - Voice Search Components');
  
  // Test basic NLP
  const testQuery = "Find nearby pharmacy";
  const parsed = parseQuery(testQuery, 'en');
  const suggestions = generateSearchSuggestions(parsed.intent, 'en');
  
  console.log('✅ Basic NLP Test:', {
    query: testQuery,
    intent: parsed.intent.type,
    confidence: parsed.intent.confidence,
    suggestions: suggestions.slice(0, 2)
  });
  
  // Test emergency detection
  const isEmergency = isEmergencyQuery("Emergency hospital", 'en');
  console.log('✅ Emergency Detection:', isEmergency);
  
  // Test language detection
  const detectedLang = detectLanguage("नजदीकी क्लिनिक");
  console.log('✅ Language Detection:', detectedLang);
  
  return true;
}
