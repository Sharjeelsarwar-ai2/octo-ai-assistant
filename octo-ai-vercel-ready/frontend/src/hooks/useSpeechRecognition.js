import { useState, useEffect, useRef, useCallback } from 'react';

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition ||
      window.mozSpeechRecognition ||
      window.msSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // single phrase by default
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      setError('Speech recognition is not supported in this browser. You can still chat by typing!');
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore cleanup abort
        }
      }
    };
  }, []);

  const startListening = useCallback(
    (onFinalResult) => {
      if (!recognitionRef.current) {
        setError('Speech recognition is not available in your browser.');
        return;
      }

      setError(null);
      setTranscript('');
      setInterimTranscript('');

      const recognition = recognitionRef.current;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            currentFinal += item[0].transcript;
          } else {
            currentInterim += item[0].transcript;
          }
        }

        if (currentFinal) {
          setTranscript(currentFinal);
          setInterimTranscript('');
          if (onFinalResult) {
            onFinalResult(currentFinal);
          }
        } else {
          setInterimTranscript(currentInterim);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setError('Microphone permission denied. Please allow microphone access in your browser settings.');
        } else if (event.error === 'no-speech') {
          setError('No speech was detected. Please try again.');
        } else if (event.error === 'audio-capture') {
          setError('No microphone found on your device.');
        } else {
          setError(`Voice input notice: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      try {
        recognition.start();
      } catch (err) {
        // If already started or aborting
        console.warn('SpeechRecognition start error:', err);
        setIsListening(false);
      }
    },
    []
  );

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript
  };
}

export default useSpeechRecognition;
