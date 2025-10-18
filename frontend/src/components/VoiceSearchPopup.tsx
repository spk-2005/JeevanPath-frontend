import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  StyleSheet, 
  TouchableOpacity, 
  Animated,
  ActivityIndicator,
  Platform,
  Alert,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';
import * as Speech from 'expo-speech';
import { useAppColors } from '@/theme/ThemeProvider';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import Constants from 'expo-constants';


interface VoiceSearchPopupProps {
  visible: boolean;
  onClose: () => void;
  onSearch?: (text: string, language?: string) => void;
}

export default function VoiceSearchPopup({ visible, onClose, onSearch }: VoiceSearchPopupProps) {
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [processingResult, setProcessingResult] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [botResponse, setBotResponse] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversationMode, setConversationMode] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState('');
  const colors = useAppColors();
  const navigation = useNavigation<any>();
  
  // Animation for listening state
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      setIsListening(false);
      setRecognizedText('');
      setError(null);
      setProcessingResult(false);
      setBotResponse('');
      setIsSpeaking(false);
      setConversationMode(false);
      setShowTextInput(false);
      setTextInput('');
    }
  }, [visible]);

  useEffect(() => {
    // Initialize voice recognition only in development builds
    const initializeVoice = async () => {
      try {
        // Skip voice initialization in Expo Go
        const isExpoGo = Constants?.appOwnership === 'expo';
        if (isExpoGo) {
          console.log('📱 Expo Go - skipping voice initialization');
          return;
        }
        
        if (Platform.OS === 'web') {
          console.log('🌐 Web platform - skipping voice initialization');
          return;
        }
        
        // Check if Voice module is properly loaded
        if (!Voice || typeof Voice.onSpeechStart !== 'function' || !Voice._nativeModule) {
          console.log('🎙️ Voice module not available - skipping initialization');
          return;
        }
        
        // Set up event listeners only in development builds
        Voice.onSpeechStart = () => {
          console.log('✅ Speech started');
          setIsListening(true);
          setError(null);
          startPulseAnimation();
        };

        Voice.onSpeechEnd = () => {
          console.log('✅ Speech ended');
          setIsListening(false);
          stopPulseAnimation();
        };

        Voice.onSpeechResults = (event: SpeechResultsEvent) => {
          console.log('✅ Speech results:', event.value);
          if (event.value && event.value.length > 0) {
            const spokenText = event.value[0];
            setRecognizedText(spokenText);
            processVoiceCommand(spokenText);
          }
        };

        Voice.onSpeechError = (event: SpeechErrorEvent) => {
          console.error('❌ Speech error:', event.error);
          setIsListening(false);
          stopPulseAnimation();
          
          // Fallback to text input on error
          console.log('📝 Voice error - falling back to text input');
          setShowTextInput(true);
        };

        Voice.onSpeechPartialResults = (event: SpeechResultsEvent) => {
          if (event.value && event.value.length > 0) {
            setRecognizedText(event.value[0]);
          }
        };
        
        console.log('✅ Voice recognition initialized for development build');
      } catch (err) {
        console.error('❌ Voice initialization error:', err);
      }
    };

    initializeVoice();

    // Cleanup on unmount
    return () => {
      try {
        if (Voice && typeof Voice.destroy === 'function' && Voice._nativeModule) {
          Voice.destroy().then(() => {
            if (typeof Voice.removeAllListeners === 'function') {
              Voice.removeAllListeners();
            }
          }).catch((err) => {
            console.log('Voice cleanup error:', err);
          });
        }
      } catch (err) {
        console.log('Voice cleanup error:', err);
      }
    };
  }, []);

  const startListening = async () => {
    try {
      setError(null);
      setRecognizedText('');
      setBotResponse('');
      
      // Check environment - prioritize Expo Go detection
      const isExpoGo = Constants?.appOwnership === 'expo';
      const isWeb = Platform.OS === 'web';
      
      // In Expo Go, always use text input - no voice attempts
      if (isExpoGo) {
        console.log('📱 Expo Go detected - using chat interface');
        setShowTextInput(true);
        return;
      }
      
      // On web, use text input
      if (isWeb) {
        console.log('🌐 Web platform - using text input');
        setShowTextInput(true);
        return;
      }
      
      // Check if Voice module is properly loaded (only for dev builds)
      const voiceModuleAvailable = Voice && 
        Voice._nativeModule !== null &&
        Voice._nativeModule !== undefined &&
        typeof Voice.start === 'function';
      
      if (!voiceModuleAvailable) {
        console.log('🎙️ Voice module not available - using text input');
        setShowTextInput(true);
        return;
      }
      
      // Only attempt voice recognition in development builds
      console.log('🎙️ Development build detected - attempting voice recognition');
      await attemptVoiceRecognition();
      
    } catch (err) {
      console.error('❌ Error in startListening:', err);
      setShowTextInput(true);
    }
  };

  const attemptVoiceRecognition = async () => {
    try {
      // Stop any ongoing recognition and speech
      try {
        if (Voice && typeof Voice.stop === 'function') {
          await Voice.stop();
        }
        if (Speech && typeof Speech.stop === 'function') {
          await Speech.stop();
        }
      } catch (stopErr) {
        console.log('Error stopping voice/speech:', stopErr);
      }
      
      // Start voice recognition
      setIsListening(true);
      startPulseAnimation();
      
      // Try to start voice recognition with better error handling
      if (Voice && typeof Voice.start === 'function' && Voice._nativeModule) {
        try {
          await Voice.start('en-IN');
          console.log('✅ Voice recognition started successfully');
        } catch (startErr) {
          console.error('🎙️ Voice start failed:', startErr);
          throw new Error('Voice recognition not available on this device');
        }
      } else {
        throw new Error('Voice module not properly initialized');
      }
      
    } catch (voiceErr) {
      console.error('🎙️ Error starting voice recognition:', voiceErr);
      setIsListening(false);
      stopPulseAnimation();
      
      // Fallback to text input immediately without alert
      console.log('📝 Falling back to text input');
      setShowTextInput(true);
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
      stopPulseAnimation();
    } catch (err) {
      console.error('Error stopping voice recognition:', err);
    }
  };

  const processVoiceCommand = async (text: string) => {
    setProcessingResult(true);
    
    try {
      // Get user location for context
      let userContext: any = {};
      
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          userContext.location = {
            lat: location.coords.latitude,
            lng: location.coords.longitude
          };
        }
      } catch (locationError) {
        console.log('Could not get location for context:', locationError);
      }
      
      // Try backend NLP first, fallback to frontend processing
      let result;
      let detectedLanguage = 'en';
      let response = '';
      let navResult = null;
      let shouldNavigate = false;
      
      try {
        // Try backend NLP
        const { processVoiceCommand: processVoiceAPI } = await import('@/utils/api');
        const backendResult = await processVoiceAPI(text, userContext);
        
        if (backendResult.success) {
          console.log('Backend NLP result:', backendResult);
          result = backendResult.data;
          detectedLanguage = result.detectedLanguage;
          response = result.response;
          navResult = result.navigation;
          shouldNavigate = result.shouldNavigate;
        } else {
          throw new Error('Backend NLP failed');
        }
      } catch (backendError) {
        console.log('Backend NLP not available, using frontend fallback:', backendError);
        
        // Fallback to frontend processing
        const { processVoiceCommand: processFrontend } = await import('@/utils/voiceCommandProcessor');
        const { detectLanguage } = await import('@/utils/translationService');
        
        detectedLanguage = detectLanguage(text);
        const frontendResult = processFrontend(text);
        
        // Generate simple conversational responses
        const lowerText = text.toLowerCase();
        if (lowerText.includes('hi') || lowerText.includes('hello') || lowerText.includes('नमस्ते') || lowerText.includes('హలో')) {
          response = detectedLanguage === 'hi' ? 'नमस्ते! मैं आपको स्वास्थ्य सेवाओं को खोजने में मदद कर सकता हूं।' :
                   detectedLanguage === 'te' ? 'హలో! ఆరోగ్య వనరులను కనుగొనడంలో నేను మీకు సహాయపడగలను।' :
                   'Hi! How can I help you find healthcare resources today?';
          shouldNavigate = false;
        } else if (lowerText.includes('thank') || lowerText.includes('धन्यवाद') || lowerText.includes('ధన్యవాదాలు')) {
          response = detectedLanguage === 'hi' ? 'आपका स्वागत है! कुछ और सहायता चाहिए?' :
                   detectedLanguage === 'te' ? 'మీకు స్వాగతం! మరేదైనా సహాయం కావాలా?' :
                   'You\'re welcome! Anything else I can help with?';
          shouldNavigate = false;
        } else {
          // Enhanced processing for different types of commands
          const lowerText = text.toLowerCase();
          
          // Check for sorting commands (enhanced to handle more variations)
          if (lowerText.includes('sort') || lowerText.includes('arrange') || lowerText.includes('order') || 
              lowerText.includes('highest rating') || lowerText.includes('best rating') || 
              lowerText.includes('top rated') || lowerText.includes('sorted order')) {
            
            if (lowerText.includes('rating') || lowerText.includes('review') || lowerText.includes('star') ||
                lowerText.includes('highest') || lowerText.includes('best') || lowerText.includes('top')) {
              response = detectedLanguage === 'hi' ? 'मैं संसाधनों को रेटिंग के अनुसार क्रमबद्ध कर रहा हूं। सबसे अच्छी रेटिंग वाले पहले दिखाए जाएंगे।' :
                       detectedLanguage === 'te' ? 'నేను వనరులను రేటింగ్ ప్రకారం క్రమబద్ధీకరిస్తున్నాను। అత్యుత్తమ రేటింగ్ ఉన్నవి మొదట చూపబడతాయి।' :
                       'I\'ll sort the resources by rating for you. Highest rated resources will be shown first.';
              console.log('Frontend fallback: Setting sortBy to rating for command:', text);
              navResult = {
                targetScreen: 'Home',
                filterParams: {
                  searchQuery: '',
                  sortBy: 'rating',
                  showAll: true // Show all resources, not filtered by type
                }
              };
              shouldNavigate = true;
            } else if (lowerText.includes('distance') || lowerText.includes('location') || lowerText.includes('near') || lowerText.includes('closest')) {
              response = detectedLanguage === 'hi' ? 'मैं संसाधनों को दूरी के अनुसार क्रमबद्ध कर रहा हूं। सबसे नजदीकी पहले दिखाए जाएंगे।' :
                       detectedLanguage === 'te' ? 'నేను వనరులను దూరం ప్రకారం క్రమబద్ధీకరిస్తున్నాను। దగ్గరగా ఉన్నవి మొదట చూపబడతాయి।' :
                       'I\'ll sort the resources by distance for you. Nearest resources will be shown first.';
              navResult = {
                targetScreen: 'Home',
                filterParams: {
                  searchQuery: '',
                  sortBy: 'distance',
                  showAll: true
                }
              };
              shouldNavigate = true;
            } else if (lowerText.includes('name') || lowerText.includes('alphabetical')) {
              response = detectedLanguage === 'hi' ? 'मैं संसाधनों को नाम के अनुसार क्रमबद्ध कर रहा हूं।' :
                       detectedLanguage === 'te' ? 'నేను వనరులను పేరు ప్రకారం క్రమబద్ధీకరిస్తున్నాను।' :
                       'I\'ll sort the resources alphabetically by name for you.';
              navResult = {
                targetScreen: 'Home',
                filterParams: {
                  searchQuery: '',
                  sortBy: 'name',
                  showAll: true
                }
              };
              shouldNavigate = true;
            } else {
              // Default to rating sort when sorting is mentioned but no specific criteria
              response = detectedLanguage === 'hi' ? 'मैं संसाधनों को रेटिंग के अनुसार व्यवस्थित कर रहा हूं।' :
                       detectedLanguage === 'te' ? 'నేను వనరులను రేటింగ్ ప్రకారం వ్యవస్థీకరిస్తున్నాను।' :
                       'I\'ll organize the resources by rating for you.';
              navResult = {
                targetScreen: 'Home',
                filterParams: {
                  searchQuery: '',
                  sortBy: 'rating',
                  showAll: true
                }
              };
              shouldNavigate = true;
            }
          }
          // Check for "show all" or "display all" commands (enhanced)
          else if (lowerText.includes('show all') || lowerText.includes('display all') || lowerText.includes('list all') ||
                   lowerText.includes('all resources') || lowerText.includes('everything') || 
                   lowerText.includes('complete list') || lowerText.includes('full list')) {
            response = detectedLanguage === 'hi' ? 'मैं सभी उपलब्ध संसाधन दिखा रहा हूं। आप फिल्टर और सॉर्ट विकल्पों का उपयोग कर सकते हैं।' :
                     detectedLanguage === 'te' ? 'నేను అందుబాటులో ఉన్న అన్ని వనరులను చూపిస్తున్నాను. మీరు ఫిల్టర్ మరియు సార్ట్ ఎంపికలను ఉపయోగించవచ్చు।' :
                     'I\'ll show you all available resources. You can use filter and sort options to refine your search.';
            navResult = {
              targetScreen: 'Home',
              filterParams: {
                searchQuery: '',
                showAll: true
              }
            };
            shouldNavigate = true;
          }
          // For search queries, provide helpful response and navigate
          else if (frontendResult.filterParams && Object.keys(frontendResult.filterParams).length > 0) {
            const resourceType = frontendResult.filterParams.type || 'healthcare resources';
            response = detectedLanguage === 'hi' ? `मैं आपको ${resourceType} खोजने में मदद करूंगा।` :
                     detectedLanguage === 'te' ? `నేను మీకు ${resourceType} కనుగొనడంలో సహాయపడతాను।` :
                     `I'll help you find ${resourceType}.`;
            navResult = {
              targetScreen: frontendResult.targetScreen,
              filterParams: frontendResult.filterParams
            };
            shouldNavigate = true;
          } else {
            response = detectedLanguage === 'hi' ? 'मुझे समझ नहीं आया। क्या आप अधिक स्पष्ट हो सकते हैं?' :
                     detectedLanguage === 'te' ? 'నాకు అర్థం కాలేదు। మీరు మరింత స్పష్టంగా చెప్పగలరా?' :
                     'I didn\'t quite understand. Could you be more specific about what you need?';
            shouldNavigate = false;
          }
        }
      }
      
      // Set bot response
      setBotResponse(response);
      setConversationMode(true);
      
      // Speak the response in the detected language
      await speakResponse(response, detectedLanguage);
      
      // Navigate immediately for actionable commands
      if (shouldNavigate && navResult) {
        console.log('Voice command navigating with params:', navResult);
        
        // Close the popup first
        onClose();
        
        // Navigate immediately for better user experience
        setTimeout(() => {
          if (navResult.targetScreen === 'Home' && navResult.filterParams) {
            console.log('Navigating to Home with filterParams:', navResult.filterParams);
            navigation.navigate('Home', { 
              searchQuery: navResult.filterParams.searchQuery || text,
              filterParams: navResult.filterParams
            });
          } else if (navResult.targetScreen === 'Maps' && navResult.filterParams) {
            navigation.navigate('Maps', { 
              searchQuery: navResult.filterParams.searchQuery || text,
              filterParams: navResult.filterParams
            });
          } else {
            navigation.navigate(navResult.targetScreen);
          }
        }, 500); // Short delay to allow popup to close smoothly
      }
      
      if (onSearch) {
        onSearch(text, detectedLanguage);
      }
      
    } catch (error: any) {
      console.error('Voice command processing error:', error);
      setError(error.message || 'Failed to process command');
      setBotResponse('Sorry, I encountered an error. Please try again.');
      await speakResponse('Sorry, I encountered an error. Please try again.', 'en');
    } finally {
      setProcessingResult(false);
    }
  };

  const speakResponse = async (text: string, language: string = 'en') => {
    try {
      setIsSpeaking(true);
      
      // Map language codes to Speech API language codes
      const languageMap: { [key: string]: string } = {
        'en': 'en-US',
        'hi': 'hi-IN',
        'te': 'te-IN',
        'ta': 'ta-IN',
        'kn': 'kn-IN',
        'ml': 'ml-IN',
        'bn': 'bn-IN',
        'gu': 'gu-IN',
        'mr': 'mr-IN',
        'pa': 'pa-IN'
      };
      
      const speechLanguage = languageMap[language] || 'en-US';
      
      await Speech.speak(text, {
        language: speechLanguage,
        pitch: 1.0,
        rate: 0.9,
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false)
      });
      
    } catch (error) {
      console.error('Speech error:', error);
      setIsSpeaking(false);
    }
  };

  const handleTextInput = () => {
    if (textInput.trim()) {
      setRecognizedText(textInput.trim());
      setShowTextInput(false);
      setTextInput('');
      processVoiceCommand(textInput.trim());
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {isListening ? 'Listening...' : 
               processingResult ? 'Processing...' : 
               isSpeaking ? 'Speaking...' :
               conversationMode ? 'Chat Assistant' :
               Constants?.appOwnership === 'expo' ? 'Chat Assistant' : 'Voice Search'}
            </Text>
          </View>
          
          {/* Main Content */}
          <View style={styles.content}>
            <Animated.View 
              style={[
                styles.micContainer, 
                { 
                  backgroundColor: isListening ? colors.accentSoft : colors.background,
                  transform: [{ scale: isListening ? pulseAnim : 1 }]
                }
              ]}
            >
              <TouchableOpacity
                style={[styles.micButton, { 
                  backgroundColor: isListening ? colors.accent : colors.primary 
                }]}
                onPress={isListening ? stopListening : startListening}
                disabled={processingResult}
              >
                {processingResult ? (
                  <ActivityIndicator size="large" color="white" />
                ) : (
                  <Ionicons 
                    name={isListening ? "stop" : 
                          Constants?.appOwnership === 'expo' ? "chatbox" : "mic"} 
                    size={32} 
                    color="white"
                  />
                )}
              </TouchableOpacity>
            </Animated.View>
            
            {/* Status Text */}
            <Text style={[styles.statusText, { color: colors.textSecondary }]}>
              {isListening ? 'Listening... Speak now' : 
               processingResult ? 'Processing your request...' : 
               isSpeaking ? 'Speaking...' :
               conversationMode ? 'Tap to continue conversation' :
               Constants?.appOwnership === 'expo' ? 'Tap to type your message' : 'Tap the microphone to start'}
            </Text>
            
            {/* Conversation Display */}
            {(recognizedText || botResponse) && (
              <View style={styles.conversationContainer}>
                {/* User Message */}
                {recognizedText && (
                  <View style={[styles.userMessage, { backgroundColor: colors.accentSoft }]}>
                    <View style={styles.messageHeader}>
                      <Ionicons name="person" size={16} color={colors.accent} />
                      <Text style={[styles.messageLabel, { color: colors.accent }]}>You</Text>
                    </View>
                    <Text style={[styles.messageText, { color: colors.textPrimary }]}>
                      {recognizedText}
                    </Text>
                  </View>
                )}
                
                {/* Bot Response */}
                {botResponse && (
                  <View style={[styles.botMessage, { backgroundColor: colors.background }]}>
                    <View style={styles.messageHeader}>
                      <Ionicons name="medical" size={16} color={colors.primary} />
                      <Text style={[styles.messageLabel, { color: colors.primary }]}>JeevanPath</Text>
                      {isSpeaking && <Ionicons name="volume-high" size={14} color={colors.primary} />}
                    </View>
                    <Text style={[styles.messageText, { color: colors.textPrimary }]}>
                      {botResponse}
                    </Text>
                  </View>
                )}
              </View>
            )}
            
            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="warning" size={20} color="#ef4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            
            {/* Example Commands */}
            {!isListening && !processingResult && !recognizedText && !conversationMode && (
              <View style={styles.examplesContainer}>
                <Text style={[styles.examplesTitle, { color: colors.textSecondary }]}>
                  Try saying or typing:
                </Text>
                <Text style={[styles.exampleText, { color: colors.textSecondary }]}>
                  • "Hi" or "Hello"
                </Text>
                <Text style={[styles.exampleText, { color: colors.textSecondary }]}>
                  • "I want blood"
                </Text>
                <Text style={[styles.exampleText, { color: colors.textSecondary }]}>
                  • "Find clinics near me"
                </Text>
                <Text style={[styles.exampleText, { color: colors.textSecondary }]}>
                  • "Sort by highest rating"
                </Text>
                <Text style={[styles.exampleText, { color: colors.textSecondary }]}>
                  • "Show all resources"
                </Text>
                
                {/* Type Message Button */}
                <TouchableOpacity 
                  style={[styles.typeMessageButton, { backgroundColor: colors.accentSoft, borderColor: colors.accent }]}
                  onPress={() => setShowTextInput(true)}
                >
                  <Ionicons name="chatbox" size={16} color={colors.accent} />
                  <Text style={[styles.typeMessageText, { color: colors.accent }]}>
                    Type Message Instead
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            
            {/* Continue Conversation Button */}
            {conversationMode && !isListening && !processingResult && (
              <TouchableOpacity 
                style={[styles.continueButton, { backgroundColor: colors.accent }]}
                onPress={() => {
                  setRecognizedText('');
                  setBotResponse('');
                  startListening();
                }}
              >
                <Ionicons name="mic" size={20} color="white" />
                <Text style={styles.continueButtonText}>Continue Conversation</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Text Input Modal for Demo Mode */}
      <Modal
        visible={showTextInput}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTextInput(false)}
      >
        <View style={styles.textInputOverlay}>
          <View style={[styles.textInputModal, { backgroundColor: colors.card }]}>
            <Text style={[styles.textInputTitle, { color: colors.textPrimary }]}>
              {Constants?.appOwnership === 'expo' ? 'Chat with JeevanPath Assistant' : 'Type your message'}
            </Text>
            <TextInput
              style={[styles.textInputField, { 
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.textPrimary
              }]}
              value={textInput}
              onChangeText={setTextInput}
              placeholder="e.g., Hi, I need blood, sort by highest rating, show all resources..."
              placeholderTextColor={colors.textSecondary}
              multiline
              autoFocus
            />
            
            {/* Quick Demo Options */}
            <View style={styles.quickOptions}>
              <Text style={[styles.quickOptionsTitle, { color: colors.textSecondary }]}>
                Quick examples:
              </Text>
              <View style={styles.quickOptionsRow}>
                {[
                  'Hi', 
                  'I want blood', 
                  'Find clinics near me', 
                  'Sort by highest rating',
                  'Show all resources',
                  'Give highest rating resources in sorted order',
                  'नमस्ते', // Hindi: Hello
                  'హలో' // Telugu: Hello
                ].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[styles.quickOption, { backgroundColor: colors.accentSoft }]}
                    onPress={() => setTextInput(option)}
                  >
                    <Text style={[styles.quickOptionText, { color: colors.accent }]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.textInputButtons}>
              <TouchableOpacity
                style={[styles.textInputButton, styles.cancelButton]}
                onPress={() => {
                  setShowTextInput(false);
                  setTextInput('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.textInputButton, styles.sendButton, { backgroundColor: colors.accent }]}
                onPress={handleTextInput}
              >
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    width: '100%',
    maxHeight: '70%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    left: 20,
    top: 20,
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  micContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(37, 99, 235, 0.2)',
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  statusText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  textContainer: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.2)',
  },
  recognizedText: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  examplesContainer: {
    width: '100%',
    paddingTop: 10,
  },
  examplesTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  exampleText: {
    fontSize: 13,
    marginBottom: 4,
    textAlign: 'center',
    opacity: 0.8,
  },
  conversationContainer: {
    width: '100%',
    maxHeight: 200,
    marginBottom: 20,
  },
  userMessage: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    alignSelf: 'flex-end',
    maxWidth: '80%',
  },
  botMessage: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    alignSelf: 'flex-start',
    maxWidth: '80%',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.2)',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  messageLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 10,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  textInputOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  textInputModal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  textInputTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  textInputField: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 80,
    maxHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  textInputButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  textInputButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  sendButton: {
    // backgroundColor set dynamically
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  quickOptions: {
    marginBottom: 16,
  },
  quickOptionsTitle: {
    fontSize: 12,
    marginBottom: 8,
  },
  quickOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  quickOptionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  typeMessageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 12,
  },
  typeMessageText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});