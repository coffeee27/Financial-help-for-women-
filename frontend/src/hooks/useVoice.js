export function useVoice() {
  return {
    isListening: false,
    speak: (text) => console.log(text),
  };
}
