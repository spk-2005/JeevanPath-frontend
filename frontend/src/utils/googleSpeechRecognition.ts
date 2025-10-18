/**
 * Google Cloud Speech-to-Text API - Free Tier Available
 * Free tier: 60 minutes per month
 * Excellent accuracy, supports 125+ languages
 */

import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

interface GoogleSpeechRecognitionOptions {
  language?: string;
  onResult?: (transcript: string, confidence: number) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

class GoogleSpeechRecognition {
  private recording: Audio.Recording | null = null;
  private isRecording = false;

  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  async startRecording(options: GoogleSpeechRecognitionOptions = {}): Promise<void> {
    try {
      if (this.isRecording) {
        throw new Error('Already recording');
      }

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Microphone permission denied');
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      this.recording = new Audio.Recording();
      await this.recording.prepareToRecordAsync({
        android: {
          extension: '.wav',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_DEFAULT,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_DEFAULT,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      });

      await this.recording.startAsync();
      this.isRecording = true;
      options.onStart?.();

    } catch (error) {
      console.error('Failed to start recording:', error);
      options.onError?.(error instanceof Error ? error.message : 'Recording failed');
    }
  }

  async stopRecording(options: GoogleSpeechRecognitionOptions = {}): Promise<void> {
    try {
      if (!this.recording || !this.isRecording) {
        return;
      }

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.isRecording = false;
      options.onEnd?.();

      if (uri) {
        await this.transcribeWithGoogle(uri, options);
      }

    } catch (error) {
      console.error('Failed to stop recording:', error);
      options.onError?.(error instanceof Error ? error.message : 'Stop recording failed');
    } finally {
      this.recording = null;
    }
  }

  private async transcribeWithGoogle(audioUri: string, options: GoogleSpeechRecognitionOptions): Promise<void> {
    try {
      // Read audio file as base64
      const audioData = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Prepare request for Google Cloud Speech-to-Text
      const requestBody = {
        config: {
          encoding: 'WEBM_OPUS', // or 'LINEAR16' for WAV
          sampleRateHertz: 16000,
          languageCode: options.language || 'en-US',
          enableAutomaticPunctuation: true,
          model: 'latest_short', // Optimized for short audio clips
        },
        audio: {
          content: audioData,
        },
      };

      const response = await fetch(
        `https://speech.googleapis.com/v1/speech:recognize?key=${process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error(`Google Speech API error: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.results && result.results.length > 0) {
        const transcript = result.results[0].alternatives[0].transcript;
        const confidence = result.results[0].alternatives[0].confidence || 0.9;
        
        options.onResult?.(transcript, confidence);
      } else {
        options.onError?.('No speech detected');
      }

    } catch (error) {
      console.error('Google Speech transcription failed:', error);
      options.onError?.(error instanceof Error ? error.message : 'Transcription failed');
    }
  }
}

export default GoogleSpeechRecognition;

// Usage example:
export const createGoogleVoiceRecognition = () => {
  const googleSpeech = new GoogleSpeechRecognition();
  
  return {
    startListening: (language = 'en-US') => {
      return googleSpeech.startRecording({
        language,
        onResult: (transcript, confidence) => {
          console.log('Google Speech result:', transcript, 'Confidence:', confidence);
        },
        onError: (error) => {
          console.error('Google Speech error:', error);
        },
        onStart: () => {
          console.log('Google Speech recording started');
        },
        onEnd: () => {
          console.log('Google Speech recording ended');
        }
      });
    },
    stopListening: () => {
      return googleSpeech.stopRecording();
    }
  };
};