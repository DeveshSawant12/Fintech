import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles, Send, X, Loader2, MessageSquare, Minimize2, Maximize2,
  Activity, Target, Umbrella, TrendingUp, CreditCard, Calculator,
  Zap, PiggyBank, ChevronDown, Trash2, Plus, AlertCircle,
} from "lucide-react";
import { aiAPI, type AIMessage, type AIConversation } from "../services/aiService";

// ── Quick action chips ────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { icon: Activity,   label: "Health score", message: "What is my financial health score?" },
  { icon: PiggyBank,  label: "Budget",        message: "Analyse my monthly budget" },
  { icon: Target,     label: "Goals",         message: "Am I on track for my financial goals?" },
  { icon: Umbrella,   label: "Retirement",    message: "Will I have enough for retirement?" },
  { icon: TrendingUp, label: "Investments",   message: "How is my investment portfolio?" },
  { icon: CreditCard, label: "Loans",         message: "Summarise my loans and EMIs" },
  { icon: Calculator, label: "Tax",           message: "Show my tax planning summary" },
  { icon: Zap,        label: "What-if",       message: "Run a what-if scenario for my finances" },
  { icon: TrendingUp, label: "Forecast",      message: "What will my wealth be in 10 years?" },
];

// ── Markdown renderer ─────────────────────────────────────────────────────────
function md(raw: string): string {
  let s = raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // fenced code blocks
  s = s.replace(/```[\w]*\n?([\s\S]*?)```/g,
    '<pre class="bg-gray-100 rounded-lg p-3 text-xs font-mono overflow-x-auto my-2 whitespace-pre-wrap">$1</pre>');
  // inline code
  s = s.replace(/`([^`]+)`/g,
    '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-gray-700">$1</code>');
  // headings
  s = s.replace(/^## (.+)$/gm,
    '<p class="text-[15px] font-bold text-gray-900 mt-3 mb-1">$1</p>');
  // bold
  s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  // tables
  s = s.replace(/(\|.+\|\r?\n)+/g, (block) => {
    const lines = block.trim().split(/\r?\n/)
      .filter(l => !/^\|[-| :]+\|$/.test(l));
    if (!lines.length) return block;
    const row = (line: string, tag: string, cls: string) =>
      `<tr>${line.split("|").slice(1, -1)
        .map(c => `<${tag} class="${cls}">${c.trim()}</${tag}>`).join("")}</tr>`;
    const [hdr, ...rows] = lines;
    return `<div class="overflow-x-auto my-2 rounded-lg border border-gray-100 shadow-sm">
      <table class="w-full bg-white">
        <thead class="bg-gray-50">${row(hdr, "th", "px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide")}</thead>
        <tbody>${rows.map(r => row(r, "td", "px-3 py-2 text-sm text-gray-800 border-t border-gray-100")).join("")}</tbody>
      </table></div>`;
  });
  // bullets
  s = s.replace(/^[•\-] (.+)$/gm,
    '<li class="text-sm text-gray-700 ml-4 list-disc">$1</li>');
  // numbered
  s = s.replace(/^\d+\. (.+)$/gm,
    '<li class="text-sm text-gray-700 ml-4 list-decimal">$1</li>');
  // wrap li groups
  s = s.replace(/(<li[^>]*>[\s\S]*?<\/li>\n?)+/g,
    m => `<ul class="space-y-1 my-1.5 pl-1">${m}</ul>`);
  // newlines
  s = s.replace(/\n/g, "<br/>");
  s = s.replace(/(<br\/>)+(<\/?(?:p|ul|ol|li|div|pre|table))/g, "$2");
  s = s.replace(/(<\/(?:p|ul|ol|li|div|pre|table)>)(<br\/>)+/g, "$1");
  return s;
}

// ── Tracks which message IDs have already finished animating, so reopening a
// conversation or re-rendering doesn't replay the typewriter effect ──────────
const animatedIds = new Set<string>();

// ── Claude-style progressive reveal: renders assistant text word-by-word ─────
function MsgContent({ text, isUser, msgId }: { text: string; isUser: boolean; msgId: string }) {
  const alreadyAnimated = animatedIds.has(msgId);
  const [display, setDisplay] = useState(isUser || alreadyAnimated ? text : "");
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isUser || animatedIds.has(msgId)) {
      setDisplay(text);
      return;
    }

    animatedIds.add(msgId);
    indexRef.current = 0;

    // Split into words while keeping whitespace attached, so markdown tokens
    // (**, |, #, etc.) stay intact at every intermediate render.
    const chunks = text.match(/\S+\s*|\s+/g) || [text];

    const step = () => {
      indexRef.current += 1;
      setDisplay(chunks.slice(0, indexRef.current).join(""));
      if (indexRef.current < chunks.length) {
        // Long replies stream faster so they don't drag on; short ones get a
        // touch more pacing so they don't feel instant/abrupt.
        const delay = chunks.length > 120 ? 8 : 18;
        timerRef.current = setTimeout(step, delay);
      }
    };
    step();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, msgId, isUser]);

  if (isUser) return <p className="text-sm leading-relaxed">{text}</p>;
  return (
    <div className="text-sm leading-relaxed"
      dangerouslySetInnerHTML={{ __html: md(display) }} />
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
interface Props { inline?: boolean }

export function AIAssistant({ inline = false }: Props) {
  const [open, setOpen]         = useState(inline);
  const [expanded, setExpanded] = useState(false);
  const [convs, setConvs]       = useState<AIConversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [showHist, setShowHist] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const endRef      = useRef<HTMLDivElement>(null);
  const inputRef    = useRef<HTMLInputElement>(null);
  // Stable refs — never stale in async callbacks
  const activeIdRef  = useRef<string | null>(null);
  const loadingRef   = useRef(false);
  activeIdRef.current = activeId;
  loadingRef.current  = loading;

  useEffect(() => {
    if (open) {
      fetchConvs();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function fetchConvs() {
    try {
      const res = await aiAPI.listConversations();
      setConvs(res.data.conversations || []);
    } catch {
      // silent — user might not be authenticated yet
    }
  }

  async function loadConv(id: string) {
    setActiveId(id);
    setShowHist(false);
    setError(null);
    try {
      const res = await aiAPI.getConversation(id);
      setMessages(res.data.messages || []);
    } catch (e: any) {
      setError(e.message || "Could not load conversation");
    }
  }

  // ── Core send — uses refs so no stale closures ────────────────────────────
  async function send(text: string) {
    const msg = text.trim();
    if (!msg || loadingRef.current) return;

    setError(null);
    setInput("");
    setLoading(true);
    setShowHist(false);

    const tempId = `tmp-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: tempId, role: "user" as const, content: msg,
      createdAt: new Date().toISOString(),
    }]);

    try {
      const res = await aiAPI.chat(msg, activeIdRef.current || undefined);
      const { conversationId, messageId, content } = res.data;

      if (!activeIdRef.current) {
        setActiveId(conversationId);
        fetchConvs();
      }

      setMessages(prev => [
        ...prev.filter(m => m.id !== tempId),
        { id: `u-${messageId}`, role: "user" as const,      content: msg,     createdAt: new Date().toISOString() },
        { id: messageId,        role: "assistant" as const,  content,          createdAt: new Date().toISOString() },
      ]);
    } catch (e: any) {
      // Remove optimistic message
      setMessages(prev => prev.filter(m => m.id !== tempId));

      // Show error inside the chat panel (not just a toast)
      if (e.code === "PROFILE_INCOMPLETE" || e.status === 403) {
        setError("Please complete your financial profile in Settings → Financial Profile before using the AI assistant.");
      } else if (e.status === 401) {
        setError("You need to log in to use the AI assistant.");
      } else if (e.status === 0) {
        setError("Cannot reach the server. Make sure the backend is running on port 5000.");
      } else if (e.status === 500) {
        setError(`Server error: ${e.message}. Check the backend console for details.`);
      } else {
        setError(e.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }

  function newChat() {
    setActiveId(null);
    setMessages([]);
    setShowHist(false);
    setError(null);
    setInput("");
    inputRef.current?.focus();
  }

  async function delConv(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await aiAPI.deleteConversation(id);
      setConvs(prev => prev.filter(c => c.id !== id));
      if (activeId === id) { setActiveId(null); setMessages([]); }
    } catch (err: any) {
      setError(err.message);
    }
  }

  // ── Panel ─────────────────────────────────────────────────────────────────
  const panelCls = inline
    ? "w-full flex flex-col"
    : expanded
    ? "fixed inset-4 z-50 flex flex-col rounded-2xl shadow-2xl overflow-hidden"
    : "fixed bottom-24 right-6 z-50 w-[440px] max-h-[640px] flex flex-col rounded-2xl shadow-2xl overflow-hidden";

  const panel = (
    <div className={`${panelCls} bg-white border border-gray-200`}
      style={inline ? { minHeight: 560 } : undefined}>

      {/* Header */}
      <div className="bg-gradient-to-r from-[#1A5F3D] to-[#2D8A5F] px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
          <Sparkles size={18} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm">SmartFinance AI</p>
          <p className="text-white/70 text-xs">Your personal wealth advisor</p>
        </div>
        <div className="flex items-center gap-0.5">
          <button onClick={() => { setShowHist(s => !s); setError(null); }} title="History"
            className="p-2 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors">
            <MessageSquare size={15} />
          </button>
          <button onClick={newChat} title="New chat"
            className="p-2 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors">
            <Plus size={15} />
          </button>
          {!inline && <>
            <button onClick={() => setExpanded(e => !e)}
              className="p-2 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors">
              {expanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
            <button onClick={() => setOpen(false)}
              className="p-2 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors">
              <X size={15} />
            </button>
          </>}
        </div>
      </div>

      {/* Error banner — shown inline so it's always visible */}
      {error && (
        <div className="flex-shrink-0 mx-3 mt-3 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
          <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-red-700 leading-relaxed">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 flex-shrink-0">
            <X size={14} />
          </button>
        </div>
      )}

      {/* History drawer */}
      {showHist && (
        <div className="border-b border-gray-100 bg-gray-50 flex-shrink-0">
          <div className="p-3 max-h-52 overflow-y-auto space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Past conversations</p>
            {convs.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-3">No previous conversations</p>
            )}
            {convs.map(c => (
              <div key={c.id} onClick={() => loadConv(c.id)}
                className={`flex items-center gap-2 p-2.5 rounded-xl cursor-pointer group transition-colors ${
                  activeId === c.id ? "bg-green-50 border border-green-200" : "hover:bg-gray-100"}`}>
                <MessageSquare size={13} className="text-gray-400 flex-shrink-0" />
                <span className="flex-1 text-xs text-gray-700 truncate">{c.title}</span>
                <span className="text-xs text-gray-400">
                  {new Date(c.lastMessageAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </span>
                <button onClick={e => delConv(c.id, e)}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 p-0.5 transition-all">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions — plain conditional, no AnimatePresence, so clicks always fire */}
      {messages.length === 0 && !loading && !error && (
        <div className="flex-shrink-0 p-4 border-b border-gray-100 bg-gradient-to-b from-white to-gray-50/40">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Ask me about</p>
          <div className="grid grid-cols-3 gap-2">
            {QUICK_ACTIONS.map(qa => (
              <button
                key={qa.label}
                type="button"
                onClick={() => send(qa.message)}
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-white hover:bg-green-50 border border-gray-100 hover:border-green-200 transition-all text-center group shadow-sm active:scale-95"
              >
                <qa.icon size={17} className="text-gray-400 group-hover:text-[#1A5F3D] transition-colors" />
                <span className="text-xs text-gray-600 group-hover:text-[#1A5F3D] font-medium leading-tight">
                  {qa.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 bg-gray-50/30">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#1A5F3D] to-[#3FAF7D] flex items-center justify-center flex-shrink-0 mt-1 mr-2 shadow-sm">
                <Sparkles size={12} className="text-white" />
              </div>
            )}
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-sm ${
              msg.role === "user"
                ? "bg-gradient-to-br from-[#1A5F3D] to-[#2D8A5F] text-white rounded-br-sm"
                : "bg-white text-gray-900 rounded-bl-sm border border-gray-100"
            }`}>
              <MsgContent text={msg.content} isUser={msg.role === "user"} msgId={msg.id} />
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#1A5F3D] to-[#3FAF7D] flex items-center justify-center mr-2 mt-1 flex-shrink-0 shadow-sm">
              <Sparkles size={12} className="text-white" />
            </div>
            <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm border border-gray-100 shadow-sm">
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.18}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Topic shift chips */}
      {messages.length > 0 && (
        <div className="flex-shrink-0 px-3 py-2 border-t border-gray-100 bg-white overflow-x-auto">
          <div className="flex gap-2">
            {QUICK_ACTIONS.slice(0, 7).map(qa => (
              <button key={qa.label} type="button" onClick={() => send(qa.message)}
                disabled={loading}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-green-50 hover:text-[#1A5F3D] text-gray-600 text-xs font-medium transition-colors disabled:opacity-40 active:scale-95">
                <qa.icon size={12} />
                {qa.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex-shrink-0 p-3 border-t border-gray-100 bg-white">
        <div className="flex gap-2 items-center">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
            placeholder="Ask about your finances…"
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#1A5F3D] focus:ring-2 focus:ring-green-100 outline-none text-sm bg-gray-50 disabled:opacity-60 transition-colors"
          />
          <button type="button" onClick={() => send(input)}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1A5F3D] to-[#2D8A5F] text-white flex items-center justify-center disabled:opacity-40 hover:shadow-md transition-all flex-shrink-0 active:scale-95">
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1.5 text-center">AI financial advisor · Indian context</p>
      </div>
    </div>
  );

  if (inline) {
    return <div className="w-full rounded-2xl overflow-hidden shadow-md border border-gray-200">{panel}</div>;
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div key="chat-panel"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.18 }}>
            {panel}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button onClick={() => { setOpen(o => !o); setError(null); }}
        whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[#1A5F3D] to-[#2D8A5F] text-white shadow-xl flex items-center justify-center"
        aria-label="Open AI assistant">
        {open ? <ChevronDown size={24} /> : <Sparkles size={22} />}
      </motion.button>

      {open && expanded && (
        <div onClick={() => setExpanded(false)}
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" />
      )}
    </>
  );
}