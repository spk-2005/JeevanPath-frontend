/**
 * Unified Voice Recognition System
 * Tries multiple FREE voice recognition methods in order of preference:
 * 1. Native device recognition (@react-native-voice/voice) - 100% free
 * 2. Web Speech API (for web/PWA) - 100% free
 * 3. OpenAI Whisper (free tier) - $0.006/minute
 * 4. Google Cloud Speech (free tier) - 60 minutes/month free
 * 5. Text input fallback - 100% free
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import Voice from '@react-native-voice/voice';
import WebSpeechRecognition from './webSpeechRecognition';
import WhisperSpeechRecognition from './whisperSpeechRecognition';
import GoogleSpeechRecognition from './googleSpeechRecognition';

export interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  language: string;
  method: 'native' | 'web' | 'whisper' | 'google' | 'text';
}

export interface VoiceRecognitionOptions {
  language?: string;
  preferredMethod?: 'native' | 'web' | 'whisper' | 'google' | 'auto';
  onResult?: (result: VoiceRecognitionResult) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
  onMethodSelected?: (method: string) => void;
}

class UnifiedVoiceRecognition {
  private currentMethod: string | null = null;
  private isListening = false;
  private nativeVoice: any = null;
  private webSpeech: any = null;
  private whisperSpeech: WhisperSpeechRecognition | null = null;
  private googleSpeech: GoogleSpeechRecognition | null = null;

  constructor() {
    this.initializeServices();
  }

  private async initializeServices() {
    // Initialize native voice (only in development builds)
    const isExpoGo = Constants?.appOwnership === 'expo';
    if (!isExpoGo && Platform.OS !== 'web' && Voice && Voice._nativeModule) {
      this.nativeVoice = Voice;
      console.log('✅ Native voice recognition available');
    }

    // Initialize web speech (only on web)
    if (Platform.OS === 'web') {
      const { createWebVoiceRecognition } = await import('./webSpeechRecognition');
      this.webSpeech = createWebVoiceRecognition();
      if (this.webSpeech) {
        console.log('✅ Web Speech API available');
      }
    }

    // Initialize Whisper (if API key available)
    if (process.env.EXPO_PUBLIC_OPENAI_API_KEY) {
      this.whisperSpeech = new WhisperSpeechRecognition();
      console.log('✅ OpenAI Whisper available');
    }

    // Initialize Google Speech (if API key available)
    if (process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY) {
      this.googleSpeech = new GoogleSpeechRecognition();
      console.log('✅ Google Cloud Speech available');
    }
  }

  async startListening(options: VoiceRecognitionOptions = {}): Promise<void> {
    if (this.isListening) {
      throw new Error('Already listening');
    }

    const method = await this.selectBestMethod(options.preferredMethod);
    this.currentMethod = method;
    this.isListening = true;

    options.onMethodSelected?.(method);
    options.onStart?.();

    try {
      switch (method) {
        case 'native':
          await this.startNativeRecognition(options);
          break;
        case 'web':
          await this.startWebRecognition(options);
          break;
        case 'whisper':
          await this.startWhisperRecognition(options);
          break;
        case 'google':
          await this.startGoogleRecognition(options);
          break;
        default:
          throw new Error('No voice recognition method available');
      }
    } catch (error) {
      this.isListening = false;
      this.currentMethod = null;
      throw error;
    }
  }

  async stopListening(): Promise<void> {
    if (!this.isListening || !this.currentMethod) {
      return;
    }

    try {
      switch (this.currentMethod) {
        case 'native':
          if (this.nativeVoice) {
            await this.nativeVoice.stop();
          }
          break;
        case 'web':
          if (this.webSpeech) {
            this.webSpeech.stopListening();
          }
          break;
        case 'whisper':
          if (this.whisperSpeech) {
            await this.whisperSpeech.stopRecording();
          }
          break;
        case 'google':
          if (this.googleSpeech) {
            await this.googleSpeech.stopRecording();
          }
          break;
      }
    } finally {
      this.isListening = false;
      this.currentMethod = null;
    }
  }

  private async selectBestMethod(preferred?: string): Promise<string> {
    // If user specified a preference and it's available, use it
    if (preferred && preferred !== 'auto') {
      if (await this.isMethodAvailable(preferred)) {
        return preferred;
      }
    }

    // Auto-select best available method
    const methods = ['native', 'web', 'whisper', 'google'];
    
    for (const method of methods) {
      if (await this.isMethodAvailable(method)) {
        return method;
      }
    }

    throw new Error('No voice recognition method available');
  }

  private async isMethodAvailable(method: string): Promise<boolean> {
    switch (method) {
      case 'native':
        return !!this.nativeVoice;
      case 'web':
        return !!this.webSpeech;
      case 'whisper':
        return !!this.whisperSpeech;
      case 'google':
        return !!this.googleSpeech;
      default:
        return false;
    }
  }

  private async startNativeRecognition(options: VoiceRecognitionOptions): Promise<void> {
    if (!this.nativeVoice) {
      throw new Error('Native voice recognition not available');
    }

    // Set up event handlers
    this.nativeVoice.onSpeechResults = (event: any) => {
      if (event.value && event.value.length > 0) {
        const transcript = event.value[0];
        options.onResult?.({
          transcript,
          confidence: 0.9, // Native doesn't provide confidence
          language: options.language || 'en',
          method: 'native'
        });
      }
    };

    this.nativeVoice.onSpeechError = (event: any) => {
      options.onError?.(event.error?.message || 'Native voice recognition error');
    };

    this.nativeVoice.onSpeechEnd = () => {
      options.onEnd?.();
    };

    // Start recognition
    await this.nativeVoice.start(options.language || 'en-IN');
  }

  private async startWebRecognition(options: VoiceRecognitionOptions): Promise<void> {
    if (!this.webSpeech) {
      throw new Error('Web Speech API not available');
    }

    await this.webSpeech.startListening(options.language || 'en-US');
  }

  private async startWhisperRecognition(options: VoiceRecognitionOptions): Promise<void> {
    if (!this.whisperSpeech) {
      throw new Error('Whisper speech recognition not available');
    }

    await this.whisperSpeech.startRecording({
      language: options.language?.split('-')[0] || 'en', // Whisper uses 'en' not 'en-US'
      onResult: (transcript) => {
        options.onResult?.({
          transcript,
          confidence: 0.95, // Whisper is very accurate
          language: options.language || 'en',
          method: 'whisper'
        });
      },
      onError: options.onError,
      onEnd: options.onEnd
    });
  }

  private async startGoogleRecognition(options: VoiceRecognitionOptions): Promise<void> {
    if (!this.googleSpeech) {
      throw new Error('Google Speech recognition not available');
    }

    await this.googleSpeech.startRecording({
      language: options.language || 'en-US',
      onResult: (transcript, confidence) => {
        options.onResult?.({
          transcript,
          confidence,
          language: options.language || 'en-US',
          method: 'google'
        });
      },
      onError: options.onError,
      onEnd: options.onEnd
    });
  }

  getAvailableMethods(): string[] {
    const methods: string[] = [];
    
    if (this.nativeVoice) methods.push('native');
    if (this.webSpeech) methods.push('web');
    if (this.whisperSpeech) methods.push('whisper');
    if (this.googleSpeech) methods.push('google');
    
    return methods;
  }

  getCurrentMethod(): string | null {
    return this.currentMethod;
  }

  isCurrentlyListening(): boolean {
    return this.isListening;
  }
}

// Export singleton instance
export const unifiedVoiceRecognition = new UnifiedVoiceRecognition();

// Export factory function for easy use
export const createUnifiedVoiceRecognition = () => {
  return unifiedVoiceRecognition;
};

// Export usage example
export const useVoiceRecognition = () => {
  const voiceRecognition = createUnifiedVoiceRecognition();
  
  return {
    startListening: async (language = 'en-US') => {
      try {
        await voiceRecognition.startListening({
          language,
          onResult: (result) => {
            console.log(`Voice result (${result.method}):`, result.transcript);
          },
          onError: (error) => {
            console.error('Voice recognition error:', error);
          },
          onStart: () => {
            console.log('Voice recognition started');
          },
          onEnd: () => {
            console.log('Voice recognition ended');
          },
          onMethodSelected: (method) => {
            console.log('Using voice recognition method:', method);
          }
        });
      } catch (error) {
        console.error('Failed to start voice recognition:', error);
      }
    },
    
    stopListening: async () => {
      try {
        await voiceRecognition.stopListening();
      } catch (error) {
        console.error('Failed to stop voice recognition:', error);
      }
    },
    
    getAvailableMethods: () => voiceRecognition.getAvailableMethods(),
    getCurrentMethod: () => voiceRecognition.getCurrentMethod(),
    isListening: () => voiceRecognition.isCurrentlyListening()
  };
};