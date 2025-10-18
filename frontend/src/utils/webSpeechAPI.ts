// Web Speech API implementation for browser voice recognition
export class WebSpeechAPI {
  private recognition: any;
  private isListening = false;
  private onResult: (text: string) => void = () => {};
  private onError: (error: string) => void = () => {};
  private onStart: () => void = () => {};
  private onEnd: () => void = () => {};

  constructor() {
    // Check if Web Speech API is supported
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.setupRecognition();
      }
    }
  }

  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      this.isListening = true;
      this.onStart();
    };

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      this.onResult(transcript);
    };

    this.recognition.onerror = (event: any) => {
      this.onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.onEnd();
    };
  }

  public isSupported(): boolean {
    return !!this.recognition;
  }

  public start(callbacks: {
    onResult: (text: string) => void;
    onError: (error: string) => void;
    onStart: () => void;
    onEnd: () => void;
  }) {
    if (!this.recognition || this.isListening) return false;

    this.onResult = callbacks.onResult;
    this.onError = callbacks.onError;
    this.onStart = callbacks.onStart;
    this.onEnd = callbacks.onEnd;

    try {
      this.recognition.start();
      return true;
    } catch (error) {
      this.onError('Failed to start voice recognition');
      return false;
    }
  }

  public stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  public getIsListening(): boolean {
    return this.isListening;
  }
}

export const webSpeechAPI = new WebSpeechAPI();