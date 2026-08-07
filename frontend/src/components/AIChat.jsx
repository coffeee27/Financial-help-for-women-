// AIChat.jsx
// Main AI Financial Assistant chat interface.
// Combines text chat, voice input, voice output, chat history, and error/loading states.

import { useState, useRef, useEffect, useCallback } from "react";
import ChatWindow from "./ChatWindow";
import TypingIndicator from "./TypingIndicator";
import VoiceButton from "./VoiceButton";
import { sendMessage } from "../services/groqService";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis";

const WELCOME_MESSAGE = {
  role: "assistant",
  content:
    "Hi! I'm your financial mentor. Ask me anything about savings, budgeting, scams, or your goals — no question is too small.",
  timestamp: Date.now(),
};

export default function AIChat() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [voiceReplyEnabled, setVoiceReplyEnabled] = useState(true);

  const scrollRef = useRef(null);

  const {
    transcript,
    isListening,
    isSupported: micSupported,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  const { speakText, cancel: cancelSpeech, isSpeaking, isSupported: ttsSupported } =
    useSpeechSynthesis();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Surface speech recognition errors in the same error banner
  useEffect(() => {
    if (speechError) setErrorMsg(speechError);
  }, [speechError]);

  // When the user stops speaking and we have a transcript, auto-send it
  useEffect(() => {
    if (!isListening && transcript.trim()) {
      handleSend(transcript);
      resetTranscript();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening]);

  const handleSend = useCallback(
    async (overrideText) => {
      const textToSend = (overrideText ?? input).trim();
      if (!textToSend || isLoading) return;

      setErrorMsg(null);
      cancelSpeech();

      const userMessage = {
        role: "user",
        content: textToSend,
        timestamp: Date.now(),
      };

      const historyForApi = messages.map(({ role, content }) => ({ role, content }));

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);

      try {
        const reply = await sendMessage(textToSend, historyForApi);

        const assistantMessage = {
          role: "assistant",
          content: reply,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        if (voiceReplyEnabled && ttsSupported) {
          speakText(reply);
        }
      } catch (err) {
        setErrorMsg(err.message || "Something went wrong. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, messages, voiceReplyEnabled, ttsSupported, speakText, cancelSpeech]
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMicClick = () => {
    setErrorMsg(null);
    if (isListening) {
      stopListening();
    } else {
      cancelSpeech();
      startListening();
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[85vh] w-full max-w-2xl mx-auto bg-gray-50 rounded-2xl shadow-md overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
        <div>
          <h2 className="font-semibold text-gray-800">ArthSaathi AI </h2>
          <p className="text-xs text-gray-400">Always here, always patient</p>
        </div>
        {ttsSupported && (
          <button
            type="button"
            onClick={() => {
              setVoiceReplyEnabled((v) => !v);
              if (isSpeaking) cancelSpeech();
            }}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${
              voiceReplyEnabled
                ? "bg-emerald-100 text-emerald-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {voiceReplyEnabled ? "🔊 Voice replies on" : "🔇 Voice replies off"}
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg, idx) => (
          <ChatWindow
            key={idx}
            role={msg.role}
            content={msg.content}
            timestamp={msg.timestamp}
          />
        ))}
        {isListening && transcript && (
          <div className="flex justify-end">
            <div className="max-w-[75%] px-4 py-3 rounded-2xl rounded-br-sm bg-purple-200 text-purple-800 text-sm italic">
              {transcript}…
            </div>
          </div>
        )}
        {isLoading && <TypingIndicator />}
        <div ref={scrollRef} />
      </div>

      {/* Error banner */}
      {errorMsg && (
        <div className="mx-4 mb-2 px-3 py-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg">
          {errorMsg}
        </div>
      )}

      {/* Input area */}
      <div className="flex items-center gap-2 px-4 py-3 bg-white border-t border-gray-100">
        <VoiceButton
          isListening={isListening}
          isSupported={micSupported}
          onClick={handleMicClick}
          disabled={isLoading}
        />

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "Listening…" : "Ask about savings, budgeting, scams…"}
          disabled={isListening || isLoading}
          className="flex-1 px-4 py-2.5 rounded-full bg-gray-100 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 disabled:opacity-60"
        />

        <button
          type="button"
          onClick={() => handleSend()}
          disabled={!input.trim() || isLoading || isListening}
          aria-label="Send message"
          className="p-3 rounded-full bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </div>
    </div>
  );
}