'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Speech input and output for the concierge, on the browser's own Web Speech
 * API.
 *
 * Nothing is sent to a speech service of ours: recognition and synthesis both
 * run through the browser, so no audio leaves the guest's device by way of this
 * app and there is no key to manage. Support is uneven — Chrome and Edge have
 * both, Safari has synthesis and partial recognition, Firefox has neither — so
 * every hook reports whether it is usable and the UI hides the control when it
 * is not.
 */

/** The constructor is prefixed on WebKit and absent from the DOM lib types. */
type SpeechRecognitionInstance = any;

function getRecognitionConstructor(): any | null {
  if (typeof window === 'undefined') return null;
  return (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition ?? null;
}

export type SpeechRecognitionError =
  | 'not-allowed'
  | 'no-speech'
  | 'audio-capture'
  | 'network'
  | 'aborted'
  | 'unknown';

const ERROR_MESSAGES: Record<SpeechRecognitionError, string> = {
  'not-allowed': 'Microphone access is blocked. Allow it in your browser settings to talk to us.',
  'no-speech': "I didn't catch that — try again a little closer to the mic.",
  'audio-capture': 'No microphone found. Check that one is connected.',
  network: 'Speech recognition needs a connection and could not reach it.',
  aborted: '',
  unknown: 'Voice input stopped unexpectedly. Please try again or type instead.',
};

export function speechErrorMessage(error: SpeechRecognitionError): string {
  return ERROR_MESSAGES[error] ?? ERROR_MESSAGES.unknown;
}

/**
 * Dictation into a text field.
 *
 * Interim results stream into `transcript` as the guest speaks, which makes the
 * control feel alive; `onResult` fires once with the settled text so a caller
 * can send it.
 */
export function useSpeechRecognition({
  lang = 'en-IN',
  onResult,
}: {
  lang?: string;
  onResult?: (text: string) => void;
} = {}) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<SpeechRecognitionError | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  // Held in a ref so restarting recognition does not need the callback in the
  // effect's dependencies, which would tear down the session on every render.
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useEffect(() => {
    setSupported(Boolean(getRecognitionConstructor()));
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const start = useCallback(() => {
    const Constructor = getRecognitionConstructor();
    if (!Constructor) return;

    // A second session while one is live throws; restarting is what the guest
    // means by tapping the mic again.
    recognitionRef.current?.abort();

    const recognition = new Constructor();
    recognition.lang = lang;
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    let finalText = '';

    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) finalText += result[0].transcript;
        else interim += result[0].transcript;
      }
      setTranscript((finalText + interim).trim());
    };

    recognition.onerror = (event: any) => {
      const code = (event?.error ?? 'unknown') as SpeechRecognitionError;
      setError(code in ERROR_MESSAGES ? code : 'unknown');
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
      const settled = finalText.trim();
      if (settled) onResultRef.current?.(settled);
    };

    setError(null);
    setTranscript('');
    recognitionRef.current = recognition;

    try {
      recognition.start();
      setListening(true);
    } catch {
      setError('unknown');
      setListening(false);
    }
  }, [lang]);

  const toggle = useCallback(() => {
    if (listening) stop();
    else start();
  }, [listening, start, stop]);

  // Leaving the page mid-sentence should release the microphone.
  useEffect(() => () => recognitionRef.current?.abort(), []);

  return { supported, listening, transcript, error, start, stop, toggle, reset: () => setTranscript('') };
}

/**
 * Strip a reply down to what should actually be said aloud.
 *
 * Replies are written for the screen: markdown emphasis, emoji signposts and
 * bare URLs all read badly, and a phone number runs together into one long
 * number unless it is spaced out.
 */
export function speakableText(raw: string): string {
  return raw
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[(.+?)\]\((.+?)\)/g, '$1')
    .replace(/https?:\/\/\S+/g, '')
    // Emoji and pictographs, which a synthesiser either names or stumbles over.
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{2190}-\u{21FF}]/gu, '')
    // Digit groups read as one huge number otherwise.
    .replace(/\+?\d[\d\s-]{7,}\d/g, (match) => match.replace(/[\s-]/g, '').split('').join(' '))
    .replace(/\n{2,}/g, '. ')
    .replace(/\n/g, ', ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Reading replies aloud. */
export function useSpeechSynthesis(lang = 'en-IN') {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
  }, []);

  const cancel = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      const content = speakableText(text);
      if (!content) return;

      // Whatever is mid-sentence is stale the moment a new reply arrives.
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(content);
      utterance.lang = lang;
      utterance.rate = 1;
      utterance.pitch = 1;

      // Prefer a voice in the requested language; fall back to the browser's
      // default rather than forcing a mismatched accent.
      const voices = window.speechSynthesis.getVoices();
      const match =
        voices.find((v) => v.lang === lang) ??
        voices.find((v) => v.lang.split('-')[0] === lang.split('-')[0]);
      if (match) utterance.voice = match;

      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      setSpeaking(true);
      window.speechSynthesis.speak(utterance);
    },
    [lang]
  );

  // Navigating away should not leave a voice talking to an empty room.
  useEffect(() => () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
  }, []);

  return { supported, speaking, speak, cancel };
}
