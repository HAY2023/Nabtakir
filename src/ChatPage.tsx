import React, { useState, useRef, useEffect } from "react";
import { Bot, RefreshCw, Send, Settings, Sparkles, AlertCircle, MessageSquareCode } from "lucide-react";
import { Link } from "react-router-dom";
import { useStore } from "./store";
import { ChatMessage } from "./types";

export function ChatPage() {
  const { botConfig, messages, setMessages } = useStore();
  const [inputMessage, setInputMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isGenerating) return;

    const userText = inputMessage.trim();
    setInputMessage("");
    setErrorStatus(null);

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsGenerating(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          botConfig: {
            name: botConfig.name,
            tone: botConfig.tone,
            rules: botConfig.rules,
            qaDatabase: botConfig.qaDatabase.filter(qa => qa.isActive),
            topics: botConfig.topics
          }
        })
      });

      if (!response.ok) {
        throw new Error(`تعذر على التطبيق الاتصال بالخادم الرئيسي (الحالة ${response.status})`);
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const botMsg: ChatMessage = {
        id: `msg_bot_${Date.now()}`,
        sender: "bot",
        text: data.text,
        timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      setErrorStatus(err.message || "فشلت عملية التوليد. يُرجى المحاولة لاحقاً.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([{
      id: `welcome_reset_${Date.now()}`,
      sender: "bot",
      text: `مرحباً بك! أنا ${botConfig.name}. مستعد للإجابة على أسئلتك!`,
      timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })
    }]);
    setErrorStatus(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans selection:bg-indigo-500 selection:text-white" dir="rtl">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 py-4 px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-indigo-500 to-indigo-600 p-2.5 rounded-xl shadow-md ring-1 ring-black/5">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black bg-gradient-to-l from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
              نبتكرة AI
            </h1>
            <p className="text-xs text-slate-500 font-medium">مساعدك الذكي المفضل</p>
          </div>
        </div>
        
        <div className="hidden">
          {/* زر الإدارة مخفي للمستخدمين العاديين، للدخول إليه اكتب /admin في عنوان الرابط */}
        </div>
      </header>

      {/* Main Chat Interface */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 flex flex-col h-[calc(100vh-80px)]">
        <div className="flex-1 bg-white border border-slate-200 rounded-3xl overflow-hidden flex flex-col shadow-xl relative">
          
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="bg-indigo-100 p-2.5 rounded-xl border border-indigo-200">
                    <Bot className="w-5 h-5 text-indigo-600" />
                  </div>
                  <span className="absolute -top-1 -left-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{botConfig.name}</h3>
                  <p className="text-[11px] text-emerald-600 font-bold">متصل ومستعد للرد</p>
                </div>
              </div>
              <button onClick={handleClearHistory} title="تفريغ المحادثة" className="text-slate-500 hover:text-slate-700 p-2.5 bg-white hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 shadow-sm">
                <RefreshCw className="w-4 h-4" />
              </button>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-6 scrollbar-thin scrollbar-thumb-slate-200">
            {messages.map((msg, i) => (
              <div key={msg.id || i} className={`flex flex-col max-w-[85%] md:max-w-[75%] ${msg.sender === "user" ? "self-start" : msg.sender === "system" ? "self-center text-center" : "self-end"}`}>
                  
                  {msg.sender !== "system" && (
                    <div className={`text-[10px] font-bold text-slate-500 mb-1.5 flex gap-1.5 ${msg.sender === "user" ? "justify-start pl-2" : "justify-end pr-2"}`}>
                      {msg.sender === "user" ? "أنت" : botConfig.name}
                      <span className="text-slate-400 font-normal">({msg.timestamp})</span>
                    </div>
                  )}

                  <div className={`p-4 rounded-2xl leading-relaxed text-sm whitespace-pre-wrap shadow-sm flex items-start flex-col ${
                    msg.sender === "user" 
                      ? "bg-indigo-600 text-white rounded-tr-none border border-indigo-500"
                      : msg.sender === "system"
                      ? "bg-slate-100 text-slate-700 border border-slate-200 font-bold px-6 text-xs rounded-xl"
                      : "bg-white text-slate-800 rounded-tl-none border border-slate-200"
                  }`}>
                    {msg.text}
                  </div>
              </div>
            ))}
            
            {isGenerating && (
              <div className="flex flex-col max-w-[75%] self-end">
                <div className="p-4 bg-white border border-slate-200 rounded-2xl rounded-tl-none flex items-center gap-3 shadow-sm">
                  <div className="flex space-x-1 space-x-reverse">
                    <div className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            )}

            {errorStatus && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2.5 self-center max-w-lg shadow-sm">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed font-medium">{errorStatus}</p>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-200">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="اكتب رسالتك للمساعد الذكي..."
                className="flex-1 bg-slate-50 border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3.5 px-4 text-sm outline-none text-slate-900 transition-all font-medium"
                disabled={isGenerating}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isGenerating}
                className={`px-6 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  !inputMessage.trim() || isGenerating
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>

        </div>
      </main>
    </div>
  );
}
