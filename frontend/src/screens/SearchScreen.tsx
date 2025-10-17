import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/utils/api';
import { useTranslation } from 'react-i18next';
import { useAppColors } from '../theme/ThemeProvider';
import VoiceSearch from '../components/VoiceSearch';
import { translateText, detectLanguage } from '../utils/translationService';
import { parseQuery, generateSearchSuggestions, isEmergencyQuery } from '../utils/nlp';

interface SearchResult {
  _id: string;
  name: string;
  type: 'clinic' | 'pharmacy' | 'blood';
  address?: string;
  contact?: string;
  rating?: number;
  services?: string[];
  languages?: string[];
  wheelchairAccessible?: boolean;
  distance?: number;
}

export default function SearchScreen() {
  const { t, i18n } = useTranslation();
  const colors = useAppColors();
  const styles = createStyles(colors);
  
  // State management
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'clinic' | 'pharmacy' | 'blood'>('clinic');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isVoiceSearching, setIsVoiceSearching] = useState(false);
  const [lastSearchTime, setLastSearchTime] = useState<number>(0);

  // Search function with NLP and translation
  const performSearch = useCallback(async (searchText: string, detectedLanguage?: string) => {
    if (!searchText.trim()) {
      setResults([]);
      setSuggestions([]);
      return;
    }

    setLoading(true);
    setLastSearchTime(Date.now());

    try {
      // Detect language if not provided
      const language = detectedLanguage || detectLanguage(searchText);
      setCurrentLanguage(language);

      // Parse query for intent detection
      const parsedQuery = parseQuery(searchText, language);
      console.log('Parsed query:', parsedQuery);

      // Check for emergency queries
      const isEmergency = isEmergencyQuery(searchText, language);
      if (isEmergency) {
        Alert.alert(
          'Emergency Detected',
          'This appears to be an emergency query. For immediate medical assistance, please call emergency services.',
          [
            { text: 'Call Emergency', onPress: () => {/* Handle emergency call */} },
            { text: 'Continue Search', style: 'cancel' }
          ]
        );
      }

      // Translate query to English for backend search
      let englishQuery = searchText;
      if (language !== 'en') {
        try {
          englishQuery = await translateText(searchText, 'en', language);
          console.log('Translated query:', englishQuery);
        } catch (error) {
          console.warn('Translation failed, using original query:', error);
        }
      }

      // Use detected intent or fallback to current category
      const searchType = parsedQuery.intent.type !== 'general' ? parsedQuery.intent.type : category;

      // Build search parameters
      const searchParams: any = {
        q: englishQuery,
        type: searchType,
        limit: 20
      };

      // Add location if available (you can integrate with location services)
      // searchParams.lat = userLocation.latitude;
      // searchParams.lng = userLocation.longitude;
      // searchParams.radius = 10; // km

      console.log('Searching with params:', searchParams);

      // Perform API search
      const response = await api.get('/api/resources', { params: searchParams });
      const searchResults = response.data || [];

      // Translate results back to user's language if needed
      let translatedResults = searchResults;
      if (language !== 'en' && searchResults.length > 0) {
        try {
          translatedResults = await Promise.all(
            searchResults.map(async (result: SearchResult) => ({
              ...result,
              name: await translateText(result.name, language, 'en'),
              address: result.address ? await translateText(result.address, language, 'en') : result.address
            }))
          );
        } catch (error) {
          console.warn('Result translation failed:', error);
        }
      }

      setResults(translatedResults);
      
      // Generate suggestions based on intent
      const newSuggestions = generateSearchSuggestions(parsedQuery.intent, language);
      setSuggestions(newSuggestions);

      console.log(`Found ${translatedResults.length} results for "${searchText}"`);

    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Search Error', 'Failed to search resources. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [category]);

  // Handle voice search
  const handleVoiceSearch = useCallback(async (spokenText: string, detectedLanguage?: string) => {
    setIsVoiceSearching(true);
    setQuery(spokenText);
    await performSearch(spokenText, detectedLanguage);
    setIsVoiceSearching(false);
  }, [performSearch]);

  // Handle text input search
  const handleTextSearch = useCallback(async (text: string) => {
    setQuery(text);
    setShowSuggestions(text.length > 0);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      performSearch(text);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [performSearch]);

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    performSearch(suggestion);
  }, [performSearch]);

  // Refresh function
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await performSearch(query);
    setRefreshing(false);
  }, [query, performSearch]);

  // Category change handler
  const handleCategoryChange = useCallback((newCategory: 'clinic' | 'pharmacy' | 'blood') => {
    setCategory(newCategory);
    if (query.trim()) {
      performSearch(query);
    }
  }, [query, performSearch]);

  // Render search result item
  const renderResultItem = useCallback(({ item }: { item: SearchResult }) => (
    <TouchableOpacity style={styles.resultItem}>
      <View style={styles.resultHeader}>
        <Text style={styles.resultName}>{item.name}</Text>
        <View style={styles.resultType}>
          <Ionicons 
            name={
              item.type === 'clinic' ? 'medical' : 
              item.type === 'pharmacy' ? 'bag' : 'water'
            } 
            size={16} 
            color={colors.accent} 
          />
          <Text style={styles.resultTypeText}>
            {item.type === 'clinic' ? 'Clinic' : 
             item.type === 'pharmacy' ? 'Pharmacy' : 'Blood Bank'}
          </Text>
        </View>
      </View>
      
      {item.address && (
        <Text style={styles.resultAddress}>{item.address}</Text>
      )}
      
      {item.contact && (
        <Text style={styles.resultContact}>📞 {item.contact}</Text>
      )}
      
      <View style={styles.resultFooter}>
        {item.rating && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
          </View>
        )}
        
        {item.wheelchairAccessible && (
          <View style={styles.accessibilityContainer}>
            <Ionicons name="accessibility" size={14} color={colors.success} />
            <Text style={styles.accessibilityText}>Wheelchair Accessible</Text>
          </View>
        )}
        
        {item.distance && (
          <Text style={styles.distanceText}>{item.distance.toFixed(1)} km away</Text>
        )}
      </View>
    </TouchableOpacity>
  ), [colors, styles]);

  // Render suggestion item
  const renderSuggestionItem = useCallback(({ item }: { item: string }) => (
    <TouchableOpacity 
      style={styles.suggestionItem}
      onPress={() => handleSuggestionSelect(item)}
    >
      <Ionicons name="search" size={16} color={colors.textSecondary} />
      <Text style={styles.suggestionText}>{item}</Text>
    </TouchableOpacity>
  ), [colors, styles, handleSuggestionSelect]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Search Input */}
        <View style={styles.searchContainer}>
          <View style={styles.inputContainer}>
            <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder={t('search_placeholder') as string}
          value={query}
              onChangeText={handleTextSearch}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {query.length > 0 && (
              <TouchableOpacity 
                onPress={() => {
                  setQuery('');
                  setResults([]);
                  setSuggestions([]);
                  setShowSuggestions(false);
                }}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Voice Search */}
          <VoiceSearch
            onSearch={handleVoiceSearch}
            language={`${currentLanguage}-IN`}
            disabled={loading}
            placeholder="Tap to speak"
        />
      </View>

        {/* Category Pills */}
        <View style={styles.categoryContainer}>
          <TouchableOpacity 
            style={[styles.pill, category === 'clinic' && styles.pillActive]} 
            onPress={() => handleCategoryChange('clinic')}
          >
            <Ionicons name="medical" size={16} color={category === 'clinic' ? colors.accent : colors.textSecondary} />
            <Text style={[styles.pillText, category === 'clinic' && styles.pillTextActive]}>
              {t('clinics')}
            </Text>
        </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.pill, category === 'pharmacy' && styles.pillActive]} 
            onPress={() => handleCategoryChange('pharmacy')}
          >
            <Ionicons name="bag" size={16} color={category === 'pharmacy' ? colors.accent : colors.textSecondary} />
            <Text style={[styles.pillText, category === 'pharmacy' && styles.pillTextActive]}>
              {t('pharmacies')}
            </Text>
        </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.pill, category === 'blood' && styles.pillActive]} 
            onPress={() => handleCategoryChange('blood')}
          >
            <Ionicons name="water" size={16} color={category === 'blood' ? colors.accent : colors.textSecondary} />
            <Text style={[styles.pillText, category === 'blood' && styles.pillTextActive]}>
              {t('blood_banks')}
            </Text>
        </TouchableOpacity>
      </View>

        {/* Search Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Suggestions:</Text>
            <FlatList
              data={suggestions}
              keyExtractor={(item, index) => `suggestion-${index}`}
              renderItem={renderSuggestionItem}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </View>
        )}

        {/* Language Indicator */}
        {currentLanguage !== 'en' && (
          <View style={styles.languageIndicator}>
            <Ionicons name="language" size={16} color={colors.accent} />
            <Text style={styles.languageText}>
              Detected: {currentLanguage.toUpperCase()}
            </Text>
          </View>
        )}

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>
              Found {results.length} result{results.length !== 1 ? 's' : ''}
            </Text>
      <FlatList
        data={results}
        keyExtractor={(item) => item._id}
              renderItem={renderResultItem}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {/* No Results */}
        {!loading && query.length > 0 && results.length === 0 && (
          <View style={styles.noResultsContainer}>
            <Ionicons name="search" size={48} color={colors.textSecondary} />
            <Text style={styles.noResultsTitle}>No results found</Text>
            <Text style={styles.noResultsText}>
              Try adjusting your search terms or check your spelling
            </Text>
          </View>
        )}

        {/* Search Hint */}
        {query.length === 0 && (
          <View style={styles.hintContainer}>
            <Text style={styles.hintText}>
              💡 Try voice search or type in your preferred language
            </Text>
            <Text style={styles.hintSubtext}>
              Supported: English, Hindi, Telugu, Tamil, Kannada, and more
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    gap: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  clearButton: {
    padding: 4,
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  pillActive: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  pillTextActive: {
    color: colors.accent,
    fontWeight: '600',
  },
  suggestionsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.card,
    borderRadius: 16,
    marginRight: 8,
    gap: 6,
  },
  suggestionText: {
    fontSize: 12,
    color: colors.textPrimary,
  },
  languageIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.primaryLight,
    marginHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  languageText: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  resultsContainer: {
    paddingHorizontal: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  resultItem: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  resultType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resultTypeText: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '500',
  },
  resultAddress: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  resultContact: {
    fontSize: 14,
    color: colors.accent,
    marginBottom: 8,
  },
  resultFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  accessibilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  accessibilityText: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '500',
  },
  distanceText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  hintContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  hintSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
