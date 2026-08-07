// speechService.js
// Thin wrapper around browser Speech Recognition and Speech Synthesis APIs,
// so components/hooks don't deal with vendor prefixes or raw browser objects directly.

const SpeechRecognitionAPI =
  window.SpeechRecognition || window.webkitSpeechRecognition;

export function isSpeechRecognitionSupported() {
  return !!SpeechRecognitionAPI;
}

export function isSpeechSynthesisSupported() {
  return "speechSynthesis" in window;
}

/**
 * Creates a configured SpeechRecognition instance.
 * Returns null if unsupported.
 */
export function createRecognizer({ lang = "en-IN" } = {}) {
  if (!isSpeechRecognitionSupported()) return null;

  const recognizer = new SpeechRecognitionAPI();
  recognizer.lang = lang;
  recognizer.continuous = false;
  recognizer.interimResults = true;
  recognizer.maxAlternatives = 1;

  return recognizer;
}

/**
 * Speaks the given text aloud. Cancels any ongoing speech first.
 * @param {string} text
 * @param {object} options - { rate, pitch, lang, onEnd, onError }
 */
export function speak(text, options = {}) {
  if (!isSpeechSynthesisSupported() || !text) return;

  const { rate = 1, pitch = 1, lang = "en-IN", onEnd, onError } = options;

  window.speechSynthesis.cancel(); // stop any current speech

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.lang = lang;

  if (onEnd) utterance.onend = onEnd;
  if (onError) utterance.onerror = onError;

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}