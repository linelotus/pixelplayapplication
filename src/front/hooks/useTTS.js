import { useState, useEffect, useCallback } from 'react';

export const useTTS = () => {
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
        
        // Try to select a kid-friendly default voice
        const defaultVoice = voices.find(voice => 
          voice.name.includes('Google US English') ||
          voice.name.includes('Samantha') ||
          voice.name.includes('Karen') ||
          voice.name.includes('Female')
        ) || voices[0];
        
        setSelectedVoice(defaultVoice);
        setIsLoading(false);
      }
    };

    // Load voices immediately
    loadVoices();

    // Some browsers need this event
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Cleanup
    return () => {
      speechSynthesis.cancel();
    };
  }, []);

  // Speak function
  const speak = useCallback((text, options = {}) => {
    if (!voiceEnabled || !text) return;

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Kid-friendly settings
    utterance.rate = options.rate || 0.95; // Slightly slower for clarity
    utterance.pitch = options.pitch || 1.1; // Higher, friendlier pitch
    utterance.volume = options.volume || 0.8;
    
    // Use selected voice
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    // Optional callbacks
    if (options.onEnd) {
      utterance.onend = options.onEnd;
    }
    if (options.onError) {
      utterance.onerror = options.onError;
    }

    speechSynthesis.speak(utterance);
  }, [voiceEnabled, selectedVoice]);

  // Stop all speech
  const stopSpeaking = useCallback(() => {
    speechSynthesis.cancel();
  }, []);

  // Get kid-friendly voices only
  const getKidFriendlyVoices = useCallback(() => {
    return availableVoices.filter(voice => {
      const name = voice.name.toLowerCase();
      const lang = voice.lang.toLowerCase();
      
      // Filter for English voices that sound friendly
      return (
        lang.includes('en') && 
        (name.includes('female') || 
         name.includes('karen') || 
         name.includes('samantha') ||
         name.includes('google') ||
         name.includes('microsoft'))
      );
    });
  }, [availableVoices]);

  return {
    speak,
    stopSpeaking,
    voiceEnabled,
    setVoiceEnabled,
    availableVoices,
    selectedVoice,
    setSelectedVoice,
    getKidFriendlyVoices,
    isLoading
  };
};