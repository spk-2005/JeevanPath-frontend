# 🎙️ Voice Search & Multilingual Setup Guide

This guide will help you set up the enhanced voice search and multilingual features for JeevanPath.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

The following dependencies are already included:
- `@react-native-voice/voice` - Voice recognition
- `expo-speech` - Text-to-speech
- `expo-av` - Audio handling
- `@react-native-async-storage/async-storage` - Caching

### 2. Platform-Specific Setup

#### Android Setup

1. **Permissions** (already configured in `app.json`):
   ```json
   "android": {
     "permissions": [
       "ACCESS_COARSE_LOCATION",
       "ACCESS_FINE_LOCATION",
       "RECORD_AUDIO"
     ]
   }
   ```

2. **Add to `android/app/src/main/AndroidManifest.xml`**:
   ```xml
   <uses-permission android:name="android.permission.RECORD_AUDIO" />
   <uses-permission android:name="android.permission.INTERNET" />
   ```

#### iOS Setup

1. **Add to `ios/JeevanPath/Info.plist`**:
   ```xml
   <key>NSMicrophoneUsageDescription</key>
   <string>This app needs access to microphone for voice search functionality.</string>
   <key>NSSpeechRecognitionUsageDescription</key>
   <string>This app needs access to speech recognition for voice search functionality.</string>
   ```

### 3. Environment Configuration

Create or update your environment variables:

```env
# Backend (.env)
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
PORT=4000

# Frontend (app.json)
EXPO_PUBLIC_API_URL=http://your-backend-url:4000
```

## 🎯 Features Overview

### ✅ What's Implemented

1. **Voice Search Component** (`VoiceSearch.tsx`)
   - Real-time speech recognition
   - Multi-language support
   - Visual feedback with animations
   - Error handling and fallbacks

2. **Translation Service** (`translationService.ts`)
   - LibreTranslate API integration
   - Offline caching with AsyncStorage
   - Language detection
   - Batch translation support

3. **NLP Parser** (`nlp.ts`)
   - Intent detection for healthcare resources
   - Multi-language keyword mapping
   - Emergency query detection
   - Search suggestions generation

4. **Enhanced Search Screen** (`SearchScreen.tsx`)
   - Integrated voice + text search
   - Real-time translation
   - Smart suggestions
   - Emergency detection
   - Offline support

## 🌍 Supported Languages

### Voice Recognition
- English (en-IN)
- Hindi (hi-IN)
- Telugu (te-IN)
- Tamil (ta-IN)
- Kannada (kn-IN)
- Malayalam (ml-IN)
- Bengali (bn-IN)
- Gujarati (gu-IN)
- Marathi (mr-IN)
- Punjabi (pa-IN)
- Urdu (ur-IN)

### Translation
- All above languages + Spanish, French, German, Japanese, Korean, Chinese

## 🔧 Configuration Options

### Voice Search Settings

```typescript
// In VoiceSearch component
const voiceConfig = {
  language: 'en-IN', // Change based on user preference
  timeout: 10000,    // 10 seconds
  partialResults: true,
  onError: (error) => console.log('Voice error:', error)
};
```

### Translation Settings

```typescript
// In translationService.ts
const TRANSLATE_API = 'https://libretranslate.de/translate';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
```

### NLP Keywords

Add custom keywords in `nlp.ts`:

```typescript
const CUSTOM_KEYWORDS = {
  your_language: {
    clinic: ['your_clinic_keywords'],
    pharmacy: ['your_pharmacy_keywords'],
    blood: ['your_blood_keywords']
  }
};
```

## 🧪 Testing

### Test Voice Search

1. **Basic Test**:
   ```typescript
   // Test in SearchScreen
   const testVoiceSearch = async () => {
     await handleVoiceSearch("find nearby clinic", "en");
   };
   ```

2. **Multi-language Test**:
   ```typescript
   // Hindi test
   await handleVoiceSearch("नजदीकी क्लिनिक", "hi");
   
   // Telugu test
   await handleVoiceSearch("దగ్గర్లో క్లినిక్", "te");
   ```

### Test Translation

```typescript
import { translateText } from '../utils/translationService';

// Test translation
const translated = await translateText("find clinic", "hi");
console.log(translated); // Should output in Hindi
```

### Test NLP

```typescript
import { parseQuery } from '../utils/nlp';

// Test intent detection
const result = parseQuery("I need a pharmacy", "en");
console.log(result.intent.type); // Should be "pharmacy"
```

## 🚨 Troubleshooting

### Common Issues

1. **Voice Recognition Not Working**
   - Check microphone permissions
   - Ensure device has internet connection
   - Verify language code format (e.g., 'en-IN')

2. **Translation Fails**
   - Check internet connection
   - Verify LibreTranslate API is accessible
   - Check cache storage permissions

3. **NLP Not Detecting Intent**
   - Verify keywords are in the correct language
   - Check if language is supported
   - Test with simpler queries

### Debug Mode

Enable debug logging:

```typescript
// In translationService.ts
const DEBUG = true;

if (DEBUG) {
  console.log('Translation request:', { text, targetLang, sourceLang });
}
```

## 📱 User Experience Flow

### Typical User Journey

1. **User opens SearchScreen**
2. **Taps voice button** → Voice recognition starts
3. **Speaks in their language** → "दग्गरलो क्लिनिक" (Telugu)
4. **App detects language** → Telugu (te)
5. **Translates to English** → "nearby clinic"
6. **Detects intent** → clinic
7. **Searches backend** → /api/resources?type=clinic
8. **Translates results** → Back to Telugu
9. **Displays results** → Localized clinic names

### Emergency Detection

When user says emergency keywords:
- "urgent", "emergency", "immediate"
- "आपातकाल", "जरूरी" (Hindi)
- "అత్యవసరం" (Telugu)

App shows emergency alert with option to call emergency services.

## 🔄 Performance Optimization

### Caching Strategy

1. **Translation Cache**: Stores translated text for 24 hours
2. **Search Results**: Cached for 1 hour
3. **Voice Recognition**: Uses device cache

### Memory Management

```typescript
// Clear cache when needed
import { clearTranslationCache } from '../utils/translationService';

// Clear cache on app start
useEffect(() => {
  clearTranslationCache();
}, []);
```

## 🚀 Deployment

### Production Checklist

- [ ] Test all supported languages
- [ ] Verify voice recognition on different devices
- [ ] Check translation API reliability
- [ ] Test offline functionality
- [ ] Verify emergency detection
- [ ] Test with real healthcare data

### Monitoring

Monitor these metrics:
- Voice recognition success rate
- Translation accuracy
- Search result relevance
- User engagement with voice features

## 📞 Support

For issues with:
- **Voice Recognition**: Check device permissions and microphone
- **Translation**: Verify internet connection and API status
- **NLP**: Review keyword mappings and language support
- **Performance**: Check cache storage and memory usage

## 🎉 Success Metrics

After implementation, you should see:
- ✅ Voice search working in multiple languages
- ✅ Real-time translation of queries and results
- ✅ Smart intent detection for healthcare resources
- ✅ Emergency query detection and alerts
- ✅ Offline functionality with cached translations
- ✅ Seamless integration with existing backend

---

**🎯 Your JeevanPath app now supports:**
- 🎙️ Voice search in 10+ languages
- 🌍 Real-time translation
- 🧠 Smart NLP intent detection
- 🚨 Emergency query detection
- 📱 Offline functionality
- 🔄 Seamless backend integration

All using free services - no paid APIs required! 🚀
