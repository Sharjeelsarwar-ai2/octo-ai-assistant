import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Filter and select sweet, soft female voice
 */
function findBestFemaleVoice(voices = []) {
  if (!voices || voices.length === 0) return null;

  // Known high-quality female English voices in Windows/Chrome/Edge/Mac
  const preferredKeywords = [
    'natural',
    'zira',
    'jenny',
    'samantha',
    'aria',
    'karen',
    'victoria',
    'cynthia',
    'female',
    'google us english',
    'stephanie'
  ];

  // Try to find English female voice matching preferred names
  for (const keyword of preferredKeywords) {
    const found = voices.find(
      (v) =>
        v.lang?.toLowerCase().startsWith('en') &&
        (v.name.toLowerCase().includes(keyword) || v.voiceURI.toLowerCase().includes(keyword))
    );
    if (found) return found;
  }

  // Fallback to any English voice
  const anyEnglish = voices.find((v) => v.lang?.toLowerCase().startsWith('en'));
  if (anyEnglish) return anyEnglish;

  // Fallback to default
  return voices.find((v) => v.default) || voices[0] || null;
}

// Clean markdown for spoken text so speech sounds natural
export function cleanTextForSpeech(text = '') {
  if (!text) return '';
  return text
    .replace(/```[\s\S]*?```/g, 'Here is the code block.') // don't read raw code blocks
    .replace(/`([^`]+)`/g, '$1') // inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/[#*_~>]/g, '') // markdown headers, bold, italics, quotes
    .replace(/\n+/g, ' ') // newlines to spaces
    .replace(/\s+/g, ' ')
    .trim();
}

export function useSpeechSynthesis() {
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [pitch, setPitch] = useState(() => {
    return parseFloat(localStorage.getItem('aara_pitch') || '1.05');
  });
  const [rate, setRate] = useState(() => {
    return parseFloat(localStorage.getItem('aara_rate') || '1.0');
  });
  const [autoSpeak, setAutoSpeak] = useState(() => {
    const saved = localStorage.getItem('aara_auto_speak');
    return saved !== null ? saved === 'true' : true; // Default auto-speak to ON for voice assistant experience
  });

  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);
  const utteranceRef = useRef(null);

  // Load available voices
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    const synth = window.speechSynthesis;

    const updateVoices = () => {
      const available = synth.getVoices();
      if (available && available.length > 0) {
        setVoices(available);

        // Check if user previously saved a voice preference
        const savedVoiceURI = localStorage.getItem('aara_selected_voice');
        let matched = available.find((v) => v.voiceURI === savedVoiceURI);

        if (!matched) {
          matched = findBestFemaleVoice(available);
        }

        setSelectedVoice(matched);
      }
    };

    updateVoices();

    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = updateVoices;
    }

    // Chrome sometimes requires a brief delay
    const timer = setTimeout(updateVoices, 300);

    return () => {
      clearTimeout(timer);
      if (synth) {
        synth.cancel();
      }
    };
  }, []);

  // Save autoSpeak preference
  const toggleAutoSpeak = useCallback((value) => {
    setAutoSpeak((prev) => {
      const nextVal = typeof value === 'boolean' ? value : !prev;
      localStorage.setItem('aara_auto_speak', String(nextVal));
      return nextVal;
    });
  }, []);

  // Select voice
  const chooseVoice = useCallback(
    (voiceURI) => {
      const found = voices.find((v) => v.voiceURI === voiceURI);
      if (found) {
        setSelectedVoice(found);
        localStorage.setItem('aara_selected_voice', found.voiceURI);
      }
    },
    [voices]
  );

  // Update pitch
  const updatePitch = useCallback((val) => {
    const p = parseFloat(val);
    setPitch(p);
    localStorage.setItem('aara_pitch', String(p));
  }, []);

  // Update rate
  const updateRate = useCallback((val) => {
    const r = parseFloat(val);
    setRate(r);
    localStorage.setItem('aara_rate', String(r));
  }, []);

  // Stop/interrupt speaking
  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
  }, []);

  // Speak text
  const speak = useCallback(
    (rawText, onStart, onEnd) => {
      if (!synthRef.current || !rawText) return;

      const synth = synthRef.current;
      synth.cancel(); // Interrupt any ongoing speech

      const cleanText = cleanTextForSpeech(rawText);
      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utteranceRef.current = utterance;

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      utterance.pitch = pitch;
      utterance.rate = rate;

      utterance.onstart = () => {
        setIsSpeaking(true);
        if (onStart) onStart();
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis error:', e);
        setIsSpeaking(false);
      };

      synth.speak(utterance);
    },
    [selectedVoice, pitch, rate]
  );

  // Preview / Test current voice
  const previewVoice = useCallback(() => {
    const previewMessage =
      "Hello Sharjeel! I'm OCTO AI, your personal AI assistant. My voice is ready and always at your service!";
    speak(previewMessage);
  }, [speak]);

  return {
    voices,
    selectedVoice,
    isSpeaking,
    isSupported,
    autoSpeak,
    pitch,
    rate,
    speak,
    stop,
    previewVoice,
    toggleAutoSpeak,
    chooseVoice,
    updatePitch,
    updateRate
  };
}

export default useSpeechSynthesis;
