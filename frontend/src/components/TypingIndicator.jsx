// TypingIndicator.jsx
// Small animated "..." bubble shown while the AI is generating a reply.

export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm w-fit">
      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
    </div>
  );
}