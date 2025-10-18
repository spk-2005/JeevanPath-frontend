/**
 * Web Speech API - 100% Free Voice Recognition for Web/PWA
 * Works in Chrome, Edge, Safari (with some limitations)
 */

interface WebSpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

interface WebSpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (result: WebSpeechRecognitionResult) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

class WebSpeechRecognition {
  private recognition: any;
  private isListening = false;

  constructor() {
    // Check if Web Speech API is available
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
    } else {
      console.warn('Web Speech API not supported in this browser');
    }
  }

  isSupported(): boolean {
    return !!this.recognition;
  }

  start(options: WebSpeechRecognitionOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Web Speech API not supported'));
        return;
      }

      if (this.isListening) {
        reject(new Error('Already listening'));
        return;
      }

      // Configure recognition
      this.recognition.lang = options.language || 'en-US';
      this.recognition.continuous = options.continuous || false;
      this.recognition.interimResults = options.interimResults || true;

      // Set up event handlers
      this.recognition.onstart = () => {
        this.isListening = true;
        options.onStart?.();
        resolve();
      };

      this.recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          const confidence = result[0].confidence;
          const isFinal = result.isFinal;

          options.onResult?.({
            transcript,
            confidence,
            isFinal
          });
        }
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        options.onError?.(event.error);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        options.onEnd?.();
      };

      // Start recognition
      try {
        this.recognition.start();
      } catch (error) {
        reject(error);
      }
    });
  }

  stop(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  abort(): void {
    if (this.recognition && this.isListening) {
      this.recognition.abort();
    }
  }
}

export default WebSpeechRecognition;

// Usage example:
export const createWebVoiceRecognition = () => {
  const webSpeech = new WebSpeechRecognition();
  
  if (!webSpeech.isSupported()) {
    console.warn('Web Speech API not supported');
    return null;
  }

  return {
    startListening: (language = 'en-US') => {
      return webSpeech.start({
        language,
        continuous: false,
        interimResults: true,
        onResult: (result) => {
          console.log('Speech result:', result.transcript);
          if (result.isFinal) {
            console.log('Final result:', result.transcript);
          }
        },
        onError: (error) => {
          console.error('Speech error:', error);
        },
        onStart: () => {
          console.log('Speech recognition started');
        },
        onEnd: () => {
          console.log('Speech recognition ended');
        }
      });
    },
    stopListening: () => {
      webSpeech.stop();
    }
  };
};