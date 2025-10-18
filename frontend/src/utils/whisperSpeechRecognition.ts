/**
 * OpenAI Whisper Speech Recognition - Free Tier Available
 * Free tier: $0.006 per minute (very affordable)
 * Extremely accurate, supports 99+ languages
 */

import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

interface WhisperRecognitionOptions {
  language?: string;
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

class WhisperSpeechRecognition {
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

  async startRecording(options: WhisperRecognitionOptions = {}): Promise<void> {
    try {
      if (this.isRecording) {
        throw new Error('Already recording');
      }

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Microphone permission denied');
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create recording
      this.recording = new Audio.Recording();
      await this.recording.prepareToRecordAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
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

  async stopRecording(options: WhisperRecognitionOptions = {}): Promise<void> {
    try {
      if (!this.recording || !this.isRecording) {
        return;
      }

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.isRecording = false;
      options.onEnd?.();

      if (uri) {
        // Send to Whisper API for transcription
        await this.transcribeWithWhisper(uri, options);
      }

    } catch (error) {
      console.error('Failed to stop recording:', error);
      options.onError?.(error instanceof Error ? error.message : 'Stop recording failed');
    } finally {
      this.recording = null;
    }
  }

  private async transcribeWithWhisper(audioUri: string, options: WhisperRecognitionOptions): Promise<void> {
    try {
      // Read audio file
      const audioData = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert base64 to blob (for web) or FormData (for native)
      const formData = new FormData();
      formData.append('file', {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'audio.m4a',
      } as any);
      formData.append('model', 'whisper-1');
      
      if (options.language) {
        formData.append('language', options.language);
      }

      // Call OpenAI Whisper API
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Whisper API error: ${response.status}`);
      }

      const result = await response.json();
      const transcript = result.text;

      if (transcript) {
        options.onResult?.(transcript);
      } else {
        options.onError?.('No speech detected');
      }

    } catch (error) {
      console.error('Whisper transcription failed:', error);
      options.onError?.(error instanceof Error ? error.message : 'Transcription failed');
    }
  }
}

export default WhisperSpeechRecognition;

// Usage example:
export const createWhisperVoiceRecognition = () => {
  const whisper = new WhisperSpeechRecognition();
  
  return {
    startListening: (language = 'en') => {
      return whisper.startRecording({
        language,
        onResult: (transcript) => {
          console.log('Whisper result:', transcript);
        },
        onError: (error) => {
          console.error('Whisper error:', error);
        },
        onStart: () => {
          console.log('Whisper recording started');
        },
        onEnd: () => {
          console.log('Whisper recording ended');
        }
      });
    },
    stopListening: () => {
      return whisper.stopRecording();
    }
  };
};