import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Animated, 
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';
import Constants from 'expo-constants';
import { useAppColors } from '../theme/ThemeProvider';
import { detectLanguage } from '../utils/translationService';

interface VoiceSearchProps {
  onSearch: (text: string, language?: string) => void;
  onError?: (error: string) => void;
  language?: string;
  disabled?: boolean;
  placeholder?: string;
}

export default function VoiceSearch({ 
  onSearch, 
  onError, 
  language = 'en-IN', 
  disabled = false,
  placeholder = "Tap to speak"
}: VoiceSearchProps) {
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [isAvailable, setIsAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const colors = useAppColors();
  const styles = createStyles(colors);
  
  // Animation for listening state
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Initialize voice recognition
    const initializeVoice = async () => {
      try {
        // Expo Go does not include the native voice module; guard accordingly
        const isExpoGo = (Constants as any)?.appOwnership === 'expo';
        if (!Voice || typeof (Voice as any).isAvailable !== 'function' || isExpoGo) {
          setIsAvailable(false);
          setError('Voice not available in this build');
          return;
        }

        let available = false;
        try {
          available = !!(await (Voice as any).isAvailable());
        } catch {
          setIsAvailable(false);
          setError('Voice not available on this device');
          return;
        }
        setIsAvailable(!!available);
        
        if (!available) {
          setError('Voice recognition not available on this device');
          return;
        }

        // Set up event listeners
        Voice.onSpeechStart = () => {
          console.log('Speech started');
          setIsListening(true);
          setError(null);
          startPulseAnimation();
        };

        Voice.onSpeechEnd = () => {
          console.log('Speech ended');
          setIsListening(false);
          stopPulseAnimation();
        };

        Voice.onSpeechResults = (event: SpeechResultsEvent) => {
          console.log('Speech results:', event.value);
          if (event.value && event.value.length > 0) {
            const spokenText = event.value[0];
            setRecognizedText(spokenText);
            
            // Detect language and call onSearch
            const detectedLang = detectLanguage(spokenText);
            onSearch(spokenText, detectedLang);
          }
        };

        Voice.onSpeechError = (event: SpeechErrorEvent) => {
          console.error('Speech error:', event.error);
          setIsListening(false);
          stopPulseAnimation();
          setError(event.error?.message || 'Speech recognition error');
          
          if (onError) {
            onError(event.error?.message || 'Speech recognition failed');
          }
        };

        Voice.onSpeechPartialResults = (event: SpeechResultsEvent) => {
          if (event.value && event.value.length > 0) {
            setRecognizedText(event.value[0]);
          }
        };

      } catch (_err) {
        // Suppress noisy console errors in Expo Go; show friendly state instead
        setError('Voice not available in this build');
        setIsAvailable(false);
      }
    };

    initializeVoice();

    // Cleanup on unmount
    return () => {
      Voice.destroy().then(() => {
        Voice.removeAllListeners();
      });
    };
  }, [onSearch, onError]);

  const startListening = async () => {
    if (disabled || !isAvailable) {
      Alert.alert('Voice Search Unavailable', 'Voice recognition is not available on this device');
      return;
    }

    try {
      setError(null);
      setRecognizedText('');
      
      // Stop any ongoing recognition
      await Voice.stop();
      
      // Start new recognition with specified language
      await Voice.start(language);
    } catch (err) {
      console.error('Error starting voice recognition:', err);
      setError('Failed to start voice recognition');
      setIsListening(false);
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

    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    scaleAnim.stopAnimation();
    pulseAnim.setValue(1);
    scaleAnim.setValue(1);
  };

  const getLanguageDisplayName = (langCode: string) => {
    const languageNames: { [key: string]: string } = {
      'en-IN': 'English (India)',
      'hi-IN': 'Hindi',
      'te-IN': 'Telugu',
      'ta-IN': 'Tamil',
      'kn-IN': 'Kannada',
      'ml-IN': 'Malayalam',
      'bn-IN': 'Bengali',
      'gu-IN': 'Gujarati',
      'mr-IN': 'Marathi',
      'pa-IN': 'Punjabi',
      'ur-IN': 'Urdu',
    };
    return languageNames[langCode] || langCode;
  };

  if (!isAvailable) {
    return (
      <View style={styles.container}>
        <TouchableOpacity 
          style={[styles.button, styles.disabledButton]} 
          disabled={true}
        >
          <Ionicons name="mic-off" size={24} color={colors.textSecondary} />
          <Text style={styles.disabledText}>Voice not available</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          isListening && styles.listeningButton,
          disabled && styles.disabledButton
        ]}
        onPress={isListening ? stopListening : startListening}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [
                { scale: isListening ? pulseAnim : 1 },
                { scale: isListening ? scaleAnim : 1 }
              ]
            }
          ]}
        >
          {isListening ? (
            <ActivityIndicator size="small" color={colors.accent} />
          ) : (
            <Ionicons 
              name="mic" 
              size={24} 
              color={isListening ? colors.accent : colors.textPrimary} 
            />
          )}
        </Animated.View>
        
        <View style={styles.textContainer}>
          <Text style={[
            styles.buttonText,
            isListening && styles.listeningText,
            disabled && styles.disabledText
          ]}>
            {isListening ? 'Listening...' : placeholder}
          </Text>
          <Text style={styles.languageText}>
            {getLanguageDisplayName(language)}
          </Text>
        </View>
      </TouchableOpacity>

      {recognizedText && (
        <View style={styles.recognizedTextContainer}>
          <Text style={styles.recognizedTextLabel}>Recognized:</Text>
          <Text style={styles.recognizedText}>{recognizedText}</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listeningButton: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
    borderWidth: 2,
  },
  disabledButton: {
    backgroundColor: colors.muted,
    borderColor: colors.muted,
  },
  iconContainer: {
    marginRight: 12,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  listeningText: {
    color: colors.accent,
    fontWeight: '700',
  },
  disabledText: {
    color: colors.textSecondary,
  },
  languageText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  recognizedTextContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.accentSoft,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  recognizedTextLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
    fontWeight: '500',
  },
  recognizedText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontStyle: 'italic',
  },
  errorContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: colors.danger + '20',
    borderRadius: 6,
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    textAlign: 'center',
  },
});
