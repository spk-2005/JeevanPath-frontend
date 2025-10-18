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
    // Initialize voice recognition
    const initializeVoice = async () => {
      try {
        // Check if Voice is available
        const isExpoGo = Platform.OS === 'web' || (Constants?.appOwnership === 'expo');
        if (isExpoGo) {
          console.log('Voice not available in Expo Go');
          setError('Voice recognition not available in Expo Go');
          return;
        }
        // Set up event listeners
        Voice.onSpeechStart = () => {
          setIsListening(true);
          setError(null);
          startPulseAnimation();
        };

        Voice.onSpeechEnd = () => {
          setIsListening(false);
          stopPulseAnimation();
        };

        Voice.onSpeechResults = (event: SpeechResultsEvent) => {
          if (event.value && event.value.length > 0) {
            const spokenText = event.value[0];
            setRecognizedText(spokenText);
            processVoiceCommand(spokenText);
          }
        };

        Voice.onSpeechError = (event: SpeechErrorEvent) => {
          setIsListening(false);
          stopPulseAnimation();
          setError(event.error?.message || 'Speech recognition error');
        };

        Voice.onSpeechPartialResults = (event: SpeechResultsEvent) => {
          if (event.value && event.value.length > 0) {
            setRecognizedText(event.value[0]);
          }
        };
      } catch (err) {
        setError('Voice recognition initialization failed');
      }
    };

    initializeVoice();

    // Cleanup on unmount
    return () => {
      Voice.destroy().then(() => {
        Voice.removeAllListeners();
      });
    };
  }, []);

  const startListening = async () => {
    try {
      setError(null);
      setRecognizedText('');
      setBotResponse('');
      
      // For demo purposes when native module isn't available
      if (Platform.OS === 'web' || !Voice._nativeModule) {
        console.log('Using demo mode for voice recognition');
        setShowTextInput(true);
        return;
      }
      
      // Stop any ongoing recognition and speech
      try {
        await Voice.stop();
        await Speech.stop();
      } catch (stopErr) {
        console.log('Error stopping voice/speech:', stopErr);
      }
      
      // Start new recognition with auto language detection
      try {
        await Voice.start('en-IN'); // Start with English, but will detect language in backend
        console.log('Voice recognition started');
      } catch (voiceErr) {
        console.error('Voice start error:', voiceErr);
        
        // Fallback to text input
        Alert.alert(
          'Voice Recognition Unavailable',
          'Voice recognition is not available. Would you like to type instead?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => {
                setError('Voice recognition unavailable');
                setIsListening(false);
                stopPulseAnimation();
              }
            },
            {
              text: 'Type Message',
              onPress: () => {
                setShowTextInput(true);
              }
            }
          ]
        );
      }
    } catch (err) {
      console.error('Error starting voice recognition:', err);
      setError('Failed to start voice recognition');
      setIsListening(false);
      stopPulseAnimation();
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
      
      // Process voice command through backend NLP
      const { processVoiceCommand: processVoiceAPI } = await import('@/utils/api');
      const result = await processVoiceAPI(text, userContext);
      
      console.log('Backend NLP result:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to process voice command');
      }
      
      const { response, navigation: navResult, detectedLanguage, shouldNavigate } = result.data;
      
      // Set bot response
      setBotResponse(response);
      setConversationMode(true);
      
      // Speak the response in the detected language
      await speakResponse(response, detectedLanguage);
      
      // Navigate only if it's an actionable command
      if (shouldNavigate && navResult) {
        // Wait a bit for the user to hear the response
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
          onClose();
        }, 3000); // 3 second delay to let user hear response
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
               'Voice Search'}
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
                    name={isListening ? "stop" : "mic"} 
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
               'Tap the microphone to start'}
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
                  Try saying:
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
                  • "Show saved resources"
                </Text>
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
              Type your message
            </Text>
            <TextInput
              style={[styles.textInputField, { 
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.textPrimary
              }]}
              value={textInput}
              onChangeText={setTextInput}
              placeholder="e.g., Hi, I need blood, find clinics..."
              placeholderTextColor={colors.textSecondary}
              multiline
              autoFocus
            />
            
            {/* Quick Demo Options */}
            <View style={styles.quickOptions}>
              <Text style={[styles.quickOptionsTitle, { color: colors.textSecondary }]}>
                Quick test options:
              </Text>
              <View style={styles.quickOptionsRow}>
                {['Hi', 'I want blood', 'Find clinics', 'Help'].map((option) => (
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
});