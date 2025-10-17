import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppColors } from '../theme/ThemeProvider';
import VoiceSearch from './VoiceSearch';
import { translateText, detectLanguage } from '../utils/translationService';
import { parseQuery, generateSearchSuggestions, isEmergencyQuery } from '../utils/nlp';

interface DemoResult {
  originalText: string;
  detectedLanguage: string;
  translatedText: string;
  intent: string;
  confidence: number;
  isEmergency: boolean;
  suggestions: string[];
}

export default function VoiceSearchDemo() {
  const colors = useAppColors();
  const styles = createStyles(colors);
  const [results, setResults] = useState<DemoResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const demoQueries = [
    { text: "Find nearby clinic", language: "en" },
    { text: "नजदीकी फार्मेसी", language: "hi" },
    { text: "దగ్గర్లో క్లినిక్", language: "te" },
    { text: "रक्त बैंक", language: "hi" },
    { text: "Emergency hospital", language: "en" },
    { text: "औषधालय", language: "hi" },
    { text: "బ్లడ్ బ్యాంక్", language: "te" }
  ];

  const handleVoiceSearch = async (spokenText: string, detectedLanguage?: string) => {
    setIsProcessing(true);
    
    try {
      const language = detectedLanguage || detectLanguage(spokenText);
      const translatedText = await translateText(spokenText, 'en', language);
      const parsedQuery = parseQuery(spokenText, language);
      const isEmergency = isEmergencyQuery(spokenText, language);
      const suggestions = generateSearchSuggestions(parsedQuery.intent, language);

      const result: DemoResult = {
        originalText: spokenText,
        detectedLanguage: language,
        translatedText,
        intent: parsedQuery.intent.type,
        confidence: parsedQuery.intent.confidence,
        isEmergency,
        suggestions
      };

      setResults(prev => [result, ...prev.slice(0, 4)]); // Keep last 5 results

      // Show emergency alert if detected
      if (isEmergency) {
        Alert.alert(
          '🚨 Emergency Detected',
          'This appears to be an emergency query. For immediate medical assistance, please call emergency services.',
          [
            { text: 'Call Emergency', onPress: () => console.log('Emergency call initiated') },
            { text: 'Continue', style: 'cancel' }
          ]
        );
      }

    } catch (error) {
      console.error('Demo processing error:', error);
      Alert.alert('Error', 'Failed to process voice input. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const runDemoQuery = async (query: { text: string; language: string }) => {
    setIsProcessing(true);
    await handleVoiceSearch(query.text, query.language);
    setIsProcessing(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  const getLanguageFlag = (lang: string) => {
    const flags: { [key: string]: string } = {
      'en': '🇺🇸',
      'hi': '🇮🇳',
      'te': '🇮🇳',
      'ta': '🇮🇳',
      'kn': '🇮🇳',
      'ml': '🇮🇳',
      'bn': '🇮🇳',
      'gu': '🇮🇳',
      'mr': '🇮🇳',
      'pa': '🇮🇳',
      'ur': '🇵🇰'
    };
    return flags[lang] || '🌍';
  };

  const getIntentIcon = (intent: string) => {
    switch (intent) {
      case 'clinic': return 'medical';
      case 'pharmacy': return 'bag';
      case 'blood': return 'water';
      default: return 'search';
    }
  };

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case 'clinic': return colors.accent;
      case 'pharmacy': return colors.success;
      case 'blood': return colors.danger;
      default: return colors.textSecondary;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎙️ Voice Search Demo</Text>
        <Text style={styles.subtitle}>
          Test multilingual voice search with NLP and translation
        </Text>
      </View>

      {/* Voice Search Component */}
      <View style={styles.voiceSection}>
        <Text style={styles.sectionTitle}>Live Voice Search</Text>
        <VoiceSearch
          onSearch={handleVoiceSearch}
          language="en-IN"
          disabled={isProcessing}
          placeholder="Tap to speak in any language"
        />
      </View>

      {/* Demo Queries */}
      <View style={styles.demoSection}>
        <Text style={styles.sectionTitle}>Quick Demo Queries</Text>
        <View style={styles.demoGrid}>
          {demoQueries.map((query, index) => (
            <TouchableOpacity
              key={index}
              style={styles.demoButton}
              onPress={() => runDemoQuery(query)}
              disabled={isProcessing}
            >
              <Text style={styles.demoButtonText}>
                {getLanguageFlag(query.language)} {query.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Processing Indicator */}
      {isProcessing && (
        <View style={styles.processingContainer}>
          <Ionicons name="sync" size={20} color={colors.accent} />
          <Text style={styles.processingText}>Processing...</Text>
        </View>
      )}

      {/* Results */}
      {results.length > 0 && (
        <View style={styles.resultsSection}>
          <View style={styles.resultsHeader}>
            <Text style={styles.sectionTitle}>Results</Text>
            <TouchableOpacity onPress={clearResults} style={styles.clearButton}>
              <Ionicons name="trash" size={16} color={colors.textSecondary} />
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>

          {results.map((result, index) => (
            <View key={index} style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <View style={styles.languageContainer}>
                  <Text style={styles.languageFlag}>
                    {getLanguageFlag(result.detectedLanguage)}
                  </Text>
                  <Text style={styles.languageCode}>
                    {result.detectedLanguage.toUpperCase()}
                  </Text>
                </View>
                
                <View style={styles.intentContainer}>
                  <Ionicons 
                    name={getIntentIcon(result.intent)} 
                    size={16} 
                    color={getIntentColor(result.intent)} 
                  />
                  <Text style={[styles.intentText, { color: getIntentColor(result.intent) }]}>
                    {result.intent.toUpperCase()}
                  </Text>
                </View>

                {result.isEmergency && (
                  <View style={styles.emergencyBadge}>
                    <Ionicons name="warning" size={12} color={colors.danger} />
                    <Text style={styles.emergencyText}>EMERGENCY</Text>
                  </View>
                )}
              </View>

              <View style={styles.resultContent}>
                <View style={styles.textRow}>
                  <Text style={styles.label}>Original:</Text>
                  <Text style={styles.value}>{result.originalText}</Text>
                </View>
                
                <View style={styles.textRow}>
                  <Text style={styles.label}>Translated:</Text>
                  <Text style={styles.value}>{result.translatedText}</Text>
                </View>

                <View style={styles.textRow}>
                  <Text style={styles.label}>Confidence:</Text>
                  <Text style={styles.value}>
                    {(result.confidence * 100).toFixed(1)}%
                  </Text>
                </View>

                {result.suggestions.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    <Text style={styles.suggestionsLabel}>Suggestions:</Text>
                    <View style={styles.suggestionsList}>
                      {result.suggestions.map((suggestion, idx) => (
                        <View key={idx} style={styles.suggestionChip}>
                          <Text style={styles.suggestionText}>{suggestion}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Instructions */}
      <View style={styles.instructionsSection}>
        <Text style={styles.sectionTitle}>How to Use</Text>
        <View style={styles.instructionList}>
          <View style={styles.instructionItem}>
            <Ionicons name="mic" size={16} color={colors.accent} />
            <Text style={styles.instructionText}>
              Tap the microphone to start voice search
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="language" size={16} color={colors.accent} />
            <Text style={styles.instructionText}>
              Speak in any supported language
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="search" size={16} color={colors.primary} />
            <Text style={styles.instructionText}>
              App will translate and detect intent automatically
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="warning" size={16} color={colors.danger} />
            <Text style={styles.instructionText}>
              Emergency queries will trigger alerts
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  voiceSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  demoSection: {
    padding: 16,
  },
  demoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  demoButton: {
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  demoButtonText: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  processingText: {
    fontSize: 16,
    color: colors.accent,
    fontWeight: '500',
  },
  resultsSection: {
    padding: 16,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clearButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  resultCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  languageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  languageFlag: {
    fontSize: 16,
  },
  languageCode: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  intentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  intentText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emergencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.danger + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  emergencyText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.danger,
  },
  resultContent: {
    gap: 8,
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    minWidth: 80,
  },
  value: {
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
  },
  suggestionsContainer: {
    marginTop: 8,
  },
  suggestionsLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  suggestionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  suggestionChip: {
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  suggestionText: {
    fontSize: 10,
    color: colors.accent,
    fontWeight: '500',
  },
  instructionsSection: {
    padding: 16,
  },
  instructionList: {
    gap: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  instructionText: {
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
  },
});
