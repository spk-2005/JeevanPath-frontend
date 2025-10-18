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
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';
import * as Speech from 'expo-speech';
import { useAppColors } from '@/theme/ThemeProvider';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import Constants from 'expo-constants';

interface GoogleLikeVoiceAssistantProps {
  visible: boolean;
  onClose: () => void;
  onSearch?: (text: string, language?: string) => void;
}

const { width, height } = Dimensions.get('window');

export default function GoogleLikeVoiceAssistant({ visible, onClose, onSearch }: GoogleLikeVoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [processingResult, setProcessingResult] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [botResponse, setBotResponse] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceWaveform, setVoiceWaveform] = useState<number[]>([]);
  const colors = useAppColors();
  const navigation = useNavigation<any>();
  
  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnims = useRef(Array.from({ length: 5 }, () => new Animated.Value(0.3))).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset state
      setIsListening(false);
      setRecognizedText('');
      setError(null);
      setProcessingResult(false);
      setBotResponse('');
      setIsSpeaking(false);
      setVoiceWaveform([]);
      
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      // Auto-start listening after a short delay (Google-like)
      setTimeout(() => {
        startListening();
      }, 500);
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible]);

  useEffect(() => {
    initializeVoice();
    return () => {
      cleanupVoice();
    };
  }, []);

  const initializeVoice = async () => {
    try {
      // Check if running in development build - NEVER initialize in Expo Go
      const isExpoGo = Constants?.appOwnership === 'expo';
      if (isExpoGo) {
        console.log('🚫 GoogleLikeVoiceAssistant: Skipping voice initialization in Expo Go');
        return;
      }

      if (Platform.OS === 'web') {
        console.log('🚫 GoogleLikeVoiceAssistant: Voice not supported on web');
        return;
      }

      // Check if Voice module is available
      if (!Voice || !Voice._nativeModule) {
        console.log('🚫 GoogleLikeVoiceAssistant: Voice module not available');
        return;
      }

      // Initialize voice recognition ONLY in development builds
      Voice.onSpeechStart = () => {
        console.log('🎙️ Speech started');
        setIsListening(true);
        setError(null);
        startListeningAnimation();
      };

      Voice.onSpeechEnd = () => {
        console.log('🎙️ Speech ended');
        setIsListening(false);
        stopListeningAnimation();
      };

      Voice.onSpeechResults = (event: SpeechResultsEvent) => {
        console.log('🎙️ Speech results:', event.value);
        if (event.value && event.value.length > 0) {
          const spokenText = event.value[0];
          setRecognizedText(spokenText);
          processVoiceCommand(spokenText);
        }
      };

      Voice.onSpeechError = (event: SpeechErrorEvent) => {
        console.error('🎙️ Speech error:', event.error);
        setIsListening(false);
        stopListeningAnimation();
        
        const errorMsg = event.error?.message || 'Speech recognition error';
        setError(errorMsg);
        
        // Auto-close on error in dev builds
        setTimeout(() => {
          onClose();
        }, 2000);
      };

      Voice.onSpeechPartialResults = (event: SpeechResultsEvent) => {
        if (event.value && event.value.length > 0) {
          setRecognizedText(event.value[0]);
          // Simulate voice waveform
          setVoiceWaveform(Array.from({ length: 5 }, () => Math.random()));
        }
      };

      Voice.onSpeechVolumeChanged = (event: any) => {
        // Create waveform effect based on volume
        if (event.value !== undefined) {
          const volume = Math.max(0, Math.min(1, event.value / 10));
          setVoiceWaveform(Array.from({ length: 5 }, () => volume + Math.random() * 0.3));
        }
      };

      console.log('✅ GoogleLikeVoiceAssistant: Voice recognition initialized for development build');
    } catch (err) {
      console.error('❌ GoogleLikeVoiceAssistant: Voice initialization error:', err);
    }
  };

  const cleanupVoice = async () => {
    try {
      if (Voice) {
        await Voice.stop();
        await Voice.destroy();
        Voice.removeAllListeners();
      }
      if (Speech) {
        await Speech.stop();
      }
    } catch (err) {
      console.log('Voice cleanup error:', err);
    }
  };

  const startListening = async () => {
    try {
      // Check if voice is available - this should never be called in Expo Go
      const isExpoGo = Constants?.appOwnership === 'expo';
      if (isExpoGo || Platform.OS === 'web') {
        console.log('🚫 GoogleLikeVoiceAssistant should not be used in Expo Go');
        Alert.alert(
          'Voice Assistant Unavailable',
          'Voice recognition requires a development build. Please build the app with EAS Build to use voice features.',
          [
            {
              text: 'Learn More',
              onPress: () => {
                console.log('Open EAS Build documentation');
              }
            },
            {
              text: 'OK',
              onPress: onClose
            }
          ]
        );
        return;
      }

      // Check if Voice module is available
      if (!Voice || !Voice._nativeModule) {
        console.log('🚫 Voice module not available');
        Alert.alert(
          'Voice Module Unavailable',
          'Voice recognition module is not properly initialized.',
          [{ text: 'OK', onPress: onClose }]
        );
        return;
      }

      setError(null);
      setRecognizedText('');
      setBotResponse('');

      // Stop any ongoing speech
      try {
        await Voice.stop();
        await Speech.stop();
      } catch (stopErr) {
        console.log('Error stopping voice/speech:', stopErr);
      }

      // Start voice recognition with multiple language support
      const languages = ['en-IN', 'hi-IN', 'te-IN', 'ta-IN', 'en-US'];
      let started = false;

      for (const lang of languages) {
        try {
          await Voice.start(lang);
          console.log(`🎙️ Voice recognition started with language: ${lang}`);
          started = true;
          break;
        } catch (langErr) {
          console.log(`Failed to start with ${lang}, trying next...`);
        }
      }

      if (!started) {
        throw new Error('Could not start voice recognition with any language');
      }

    } catch (err) {
      console.error('🎙️ Error starting voice recognition:', err);
      setError('Voice recognition failed');
      setIsListening(false);
      stopListeningAnimation();
      
      // Auto-close on error
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
      stopListeningAnimation();
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

      // Process through backend NLP or frontend fallback
      let response = '';
      let navResult = null;
      let shouldNavigate = false;
      let detectedLanguage = 'en';

      try {
        // Try backend NLP first
        const { processVoiceCommand: processVoiceAPI } = await import('@/utils/api');
        const backendResult = await processVoiceAPI(text, userContext);
        
        if (backendResult.success) {
          response = backendResult.data.response;
          navResult = backendResult.data.navigation;
          shouldNavigate = backendResult.data.shouldNavigate;
          detectedLanguage = backendResult.data.detectedLanguage;
        } else {
          throw new Error('Backend processing failed');
        }
      } catch (backendError) {
        console.log('Using frontend fallback processing');
        
        // Frontend fallback processing
        const { processVoiceCommand: processFrontend } = await import('@/utils/voiceCommandProcessor');
        const { detectLanguage } = await import('@/utils/translationService');
        
        detectedLanguage = detectLanguage(text);
        const frontendResult = processFrontend(text);
        
        // Generate conversational responses
        const lowerText = text.toLowerCase();
        if (lowerText.includes('hi') || lowerText.includes('hello') || lowerText.includes('नमस्ते') || lowerText.includes('హలో')) {
          response = detectedLanguage === 'hi' ? 'नमस्ते! मैं आपको स्वास्थ्य सेवाओं को खोजने में मदद कर सकता हूं।' :
                   detectedLanguage === 'te' ? 'హలో! ఆరోగ్య వనరులను కనుగొనడంలో నేను మీకు సహాయపడగలను।' :
                   'Hi! How can I help you find healthcare resources today?';
          shouldNavigate = false;
        } else if (frontendResult.filterParams && Object.keys(frontendResult.filterParams).length > 0) {
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
                   detectedLanguage === 'te' ? 'నాకు అర్థం కాలेదు। మీరు మరింత స్పష్టంగా చెప్పగలరా?' :
                   'I didn\'t quite understand. Could you be more specific?';
          shouldNavigate = false;
        }
      }

      // Set bot response and speak it
      setBotResponse(response);
      await speakResponse(response, detectedLanguage);

      // Navigate if needed
      if (shouldNavigate && navResult) {
        setTimeout(() => {
          if (navResult.targetScreen === 'Home' && navResult.filterParams) {
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
          
          // Close after navigation
          setTimeout(() => {
            onClose();
          }, 1000);
        }, 2000); // Wait for speech to complete
      } else {
        // Close after response for conversational queries
        setTimeout(() => {
          onClose();
        }, 3000);
      }

      if (onSearch) {
        onSearch(text, detectedLanguage);
      }

    } catch (error: any) {
      console.error('Voice command processing error:', error);
      setError('Failed to process command');
      setBotResponse('Sorry, I encountered an error. Please try again.');
      await speakResponse('Sorry, I encountered an error. Please try again.', 'en');
      
      setTimeout(() => {
        onClose();
      }, 2000);
    } finally {
      setProcessingResult(false);
    }
  };

  const speakResponse = async (text: string, language: string = 'en') => {
    try {
      setIsSpeaking(true);
      
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

  const startListeningAnimation = () => {
    // Pulse animation for main button
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

    // Waveform animation
    const animateWaves = () => {
      const animations = waveAnims.map((anim, index) => 
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 0.8 + Math.random() * 0.4,
              duration: 300 + index * 100,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.3,
              duration: 300 + index * 100,
              useNativeDriver: true,
            }),
          ])
        )
      );
      
      Animated.stagger(100, animations).start();
    };

    animateWaves();
  };

  const stopListeningAnimation = () => {
    pulseAnim.stopAnimation();
    waveAnims.forEach(anim => anim.stopAnimation());
    pulseAnim.setValue(1);
    waveAnims.forEach(anim => anim.setValue(0.3));
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
        <View style={styles.modalContent}>
          
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>

          {/* Main Voice Interface */}
          <View style={styles.voiceInterface}>
            
            {/* Status Text */}
            <Text style={styles.statusText}>
              {isListening ? 'Listening...' : 
               processingResult ? 'Processing...' : 
               isSpeaking ? 'Speaking...' :
               error ? 'Error occurred' :
               'Tap to speak'}
            </Text>

            {/* Voice Waveform */}
            {isListening && (
              <View style={styles.waveformContainer}>
                {waveAnims.map((anim, index) => (
                  <Animated.View
                    key={index}
                    style={[
                      styles.waveformBar,
                      {
                        transform: [{ scaleY: anim }]
                      }
                    ]}
                  />
                ))}
              </View>
            )}

            {/* Main Voice Button */}
            <Animated.View style={[
              styles.voiceButtonContainer,
              { transform: [{ scale: pulseAnim }] }
            ]}>
              <TouchableOpacity
                style={[
                  styles.voiceButton,
                  { 
                    backgroundColor: isListening ? '#ff4444' : 
                                   processingResult ? '#ffa500' :
                                   isSpeaking ? '#00aa00' : '#4285f4'
                  }
                ]}
                onPress={isListening ? stopListening : startListening}
                disabled={processingResult || isSpeaking}
              >
                {processingResult ? (
                  <ActivityIndicator size="large" color="white" />
                ) : (
                  <Ionicons 
                    name={isListening ? "stop" : 
                          isSpeaking ? "volume-high" : "mic"} 
                    size={40} 
                    color="white"
                  />
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Recognized Text */}
            {recognizedText && (
              <View style={styles.recognizedTextContainer}>
                <Text style={styles.recognizedText}>
                  "{recognizedText}"
                </Text>
              </View>
            )}

            {/* Bot Response */}
            {botResponse && (
              <View style={styles.botResponseContainer}>
                <Text style={styles.botResponseText}>
                  {botResponse}
                </Text>
              </View>
            )}

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

          </View>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    height: height * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  voiceInterface: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  statusText: {
    fontSize: 24,
    fontWeight: '300',
    color: 'white',
    marginBottom: 40,
    textAlign: 'center',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    marginBottom: 40,
  },
  waveformBar: {
    width: 4,
    height: 40,
    backgroundColor: '#4285f4',
    marginHorizontal: 2,
    borderRadius: 2,
  },
  voiceButtonContainer: {
    marginBottom: 40,
  },
  voiceButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  recognizedTextContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    maxWidth: '90%',
  },
  recognizedText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  botResponseContainer: {
    backgroundColor: 'rgba(66,133,244,0.2)',
    padding: 20,
    borderRadius: 12,
    maxWidth: '90%',
  },
  botResponseText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    lineHeight: 24,
  },
  errorContainer: {
    backgroundColor: 'rgba(255,68,68,0.2)',
    padding: 15,
    borderRadius: 8,
    maxWidth: '90%',
  },
  errorText: {
    fontSize: 14,
    color: '#ff6b6b',
    textAlign: 'center',
  },
});