import React, { useState } from "react";
import { X, Sparkles, Send, Bot, User, Loader2, Lightbulb, AlertTriangle } from "lucide-react";
import { SATQuestion } from "../types";
import { OwlyLogoIcon } from "./OwlyLogo";

interface AiTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: SATQuestion;
  userSelectedOption: number | null;
}

export const AiTutorModal: React.FC<AiTutorModalProps> = ({
  isOpen,
  onClose,
  question,
  userSelectedOption,
}) => {
  const [query, setQuery] = useState<string>("");
  const [messages, setMessages] = useState<
    { sender: "user" | "ai"; text: string; isInitial?: boolean }[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasFetchedInitial, setHasFetchedInitial] = useState<boolean>(false);

  // Initialize with initial explanation if opened
  React.useEffect(() => {
    if (isOpen && !hasFetchedInitial) {
      fetchExplanation(
        "Can you break down why the correct answer is right, explain why wrong options fail, and give me a 15-second shortcut to spot this on test day?"
      );
      setHasFetchedInitial(true);
    }
  }, [isOpen, hasFetchedInitial]);

  if (!isOpen) return null;

  async function fetchExplanation(userPromptText: string) {
    setIsLoading(true);
    const newMessages = [
      ...messages,
      { sender: "user" as const, text: userPromptText, isInitial: messages.length === 0 },
    ];
    setMessages(newMessages);

    try {
      const res = await fetch("/api/gemini/tutor-explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.question,
          options: question.options,
          selectedAnswer: userSelectedOption ?? -1,
          correctAnswer: question.correctAnswerIndex,
          explanation: question.explanation,
          userQuery: userPromptText,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to get response from AI Tutor");
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: data.explanationText || "Here is a breakdown of the question.",
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `Tutor Notice: ${err.message || "Failed to load explanation."} (Ensure GEMINI_API_KEY is active). Here is the standard solution: ${question.explanation}`,
        },
      ]);
    } finally {
      setIsLoading(false);
      setQuery("");
    }
  }

  const handleSend = () => {
    if (!query.trim() || isLoading) return;
    fetchExplanation(query);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl h-[600px] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-50 via-white to-blue-50">
          <div className="flex items-center gap-2.5">
            <OwlyLogoIcon size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-slate-900">OWLY AI Tutor</span>
                <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-indigo-100 text-indigo-700">
                  {question.domain}
                </span>
              </div>
              <p className="text-xs text-slate-500">Live step-by-step breakdown & pattern analysis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Question Snapshot Banner */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 text-xs text-slate-700 flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="line-clamp-2">
            <span className="font-semibold text-slate-900">Question: </span>
            {question.question}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-sm bg-slate-50/50">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${
                msg.sender === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {msg.sender === "user" ? (
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-slate-800 text-white">
                  <User className="w-3.5 h-3.5" />
                </div>
              ) : (
                <OwlyLogoIcon size="xs" />
              )}
              <div
                className={`rounded-2xl px-4 py-3 max-w-[85%] leading-relaxed text-sm ${
                  msg.sender === "user"
                    ? "bg-slate-900 text-white rounded-tr-xs"
                    : "bg-white text-slate-800 border border-slate-200 shadow-xs rounded-tl-xs space-y-2"
                }`}
              >
                {msg.sender === "user" ? (
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                ) : (
                  <div className="space-y-2">
                    {msg.text.split("\n\n").map((block, bIdx) => {
                      if (block.startsWith("### ")) {
                        return (
                          <h4 key={bIdx} className="font-bold text-slate-900 text-sm flex items-center gap-1.5 mt-1 border-b border-slate-100 pb-1">
                            {block.replace("### ", "")}
                          </h4>
                        );
                      }
                      if (block.startsWith("#### ")) {
                        return (
                          <h5 key={bIdx} className="font-semibold text-indigo-900 text-xs uppercase tracking-wider mt-2">
                            {block.replace("#### ", "")}
                          </h5>
                        );
                      }
                      if (block === "---") {
                        return <hr key={bIdx} className="border-slate-100 my-1.5" />;
                      }
                      return (
                        <p key={bIdx} className="text-slate-700 whitespace-pre-wrap leading-relaxed text-xs sm:text-sm">
                          {block}
                        </p>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3 text-slate-500 text-xs">
              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <div className="bg-white px-4 py-2.5 rounded-2xl border border-slate-200 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                <span>Analyzing question logic & drafting tips...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3.5 border-t border-slate-200 bg-white">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask a follow-up question, ask for another example..."
              className="flex-1 px-4 py-2 text-sm bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !query.trim()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium text-sm flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
