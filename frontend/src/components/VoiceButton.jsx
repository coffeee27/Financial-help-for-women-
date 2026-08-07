// VoiceButton.jsx
// Microphone button that toggles speech recognition on/off, with visual feedback.

export default function VoiceButton({ isListening, isSupported, onClick, disabled }) {
  if (!isSupported) {
    return (
      <button
        type="button"
        disabled
        title="Voice input isn't supported in this browser"
        className="p-3 rounded-full bg-gray-200 text-gray-400 cursor-not-allowed"
      >
        <MicIcon />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={isListening ? "Stop listening" : "Start voice input"}
      title={isListening ? "Stop listening" : "Start voice input"}
      className={`p-3 rounded-full transition-all duration-200 shadow-sm ${
        isListening
          ? "bg-red-500 text-white animate-pulse"
          : "bg-purple-100 text-purple-600 hover:bg-purple-200"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <MicIcon />
    </button>
  );
}

function MicIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path d="M10 12a3 3 0 003-3V5a3 3 0 10-6 0v4a3 3 0 003 3z" />
      <path d="M5.5 9a.5.5 0 00-1 0 5.5 5.5 0 005 5.47V17H7a.5.5 0 000 1h6a.5.5 0 000-1h-2.5v-2.53A5.5 5.5 0 0015.5 9a.5.5 0 00-1 0 4.5 4.5 0 01-9 0z" />
    </svg>
  );
}