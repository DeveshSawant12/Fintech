import { useState, useEffect, useRef, createContext, useContext } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Send, X, MessageSquare,
  Activity, Target, Umbrella, TrendingUp, CreditCard, Calculator,
  Zap, PiggyBank, ChevronDown, Trash2, Plus, AlertCircle,
  Moon, Sun, Settings, User, ChevronRight, Check,
  Volume2, VolumeX, Globe, Sliders, LogOut, Menu,
} from "lucide-react";
import { aiAPI, type AIMessage, type AIConversation } from "../services/aiService";

// ── Brand mark ──────────────────────────────────────────────────────────────
// Rupee glyph + three ascending dots (growth). Renders crisp from 12px
// (inline avatars) up to 24px (welcome screen) — pure stroke/fill, no
// detail that disappears at small sizes.
function Logo({ size = 16, strokeColor = "#FFFFFF" }: { size?: number; strokeColor?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <g stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 5 H15" />
        <path d="M7 9 H15" />
        <path d="M7 5 C7 9, 12 9, 12 9" />
        <path d="M8.5 9 L15.5 18" />
      </g>
      <circle cx="14.5" cy="15.5" r="1" fill={strokeColor} opacity="0.55" />
      <circle cx="16.8" cy="12.8" r="1" fill={strokeColor} opacity="0.78" />
      <circle cx="19" cy="10" r="1" fill={strokeColor} />
    </svg>
  );
}

// Local extension — adds an optional `failed` flag for messages whose send
// request errored, without needing to modify the shared AIMessage type.
type ChatMessage = AIMessage & { failed?: boolean };

// ── Theme system ──────────────────────────────────────────────────────────────
type Theme = "light" | "dark";

interface ThemeTokens {
  bg: string;
  bgPanel: string;
  bgSidebar: string;
  bgInput: string;
  bgHover: string;
  bgUserMsg: string;
  bgAssistantMsg: string;
  border: string;
  borderSubtle: string;
  text: string;
  textMuted: string;
  textFaint: string;
  textUser: string;
  brand: string;
  brandLight: string;
  gold: string;
  scrollTrack: string;
}

const THEMES: Record<Theme, ThemeTokens> = {
  light: {
    bg:              "#FAFAF8",
    bgPanel:         "#FFFFFF",
    bgSidebar:       "#F3F1EB",
    bgInput:         "#F3F1EB",
    bgHover:         "rgba(26,95,61,0.06)",
    bgUserMsg:       "#F3F1EB",
    bgAssistantMsg:  "transparent",
    border:          "#E7E3D8",
    borderSubtle:    "#EDEBE4",
    text:            "#1C2521",
    textMuted:       "#5C5648",
    textFaint:       "#9A9484",
    textUser:        "#1C2521",
    brand:           "#1A5F3D",
    brandLight:      "#2D8A5F",
    gold:            "#C9A227",
    scrollTrack:     "rgba(0,0,0,0.04)",
  },
  dark: {
    bg:              "#141614",
    bgPanel:         "#1C1F1C",
    bgSidebar:       "#111311",
    bgInput:         "#252825",
    bgHover:         "rgba(45,138,95,0.10)",
    bgUserMsg:       "#252825",
    bgAssistantMsg:  "transparent",
    border:          "#2E332E",
    borderSubtle:    "#252825",
    text:            "#E8EAE4",
    textMuted:       "#8A9186",
    textFaint:       "#5A6057",
    textUser:        "#E8EAE4",
    brand:           "#3FAF7D",
    brandLight:      "#5CC49A",
    gold:            "#D4AC3A",
    scrollTrack:     "rgba(255,255,255,0.04)",
  },
};

const ThemeCtx = createContext<{ theme: Theme; t: ThemeTokens; toggle: () => void }>({
  theme: "light", t: THEMES.light, toggle: () => {},
});
const useTh = () => useContext(ThemeCtx);

// ── Config types ──────────────────────────────────────────────────────────────
interface AIConfig {
  language: "en" | "hi" | "mr";
  responseLength: "concise" | "balanced" | "detailed";
  soundEnabled: boolean;
  fontSize: "sm" | "md" | "lg";
  autoScroll: boolean;
}

const DEFAULT_CONFIG: AIConfig = {
  language: "en",
  responseLength: "balanced",
  soundEnabled: false,
  fontSize: "md",
  autoScroll: true,
};

// ── Quick actions ─────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { icon: Activity,   label: "Health Score",  message: "What is my financial health score?" },
  { icon: PiggyBank,  label: "Budget",        message: "Analyse my monthly budget" },
  { icon: Target,     label: "Goals",         message: "Am I on track for my financial goals?" },
  { icon: Umbrella,   label: "Retirement",    message: "Will I have enough for retirement?" },
  { icon: TrendingUp, label: "Investments",   message: "How is my investment portfolio doing?" },
  { icon: CreditCard, label: "Loans & EMIs",  message: "Summarise my loans and EMIs" },
  { icon: Calculator, label: "Tax Planning",  message: "Show my tax planning summary" },
  { icon: Zap,        label: "What-If",       message: "Run a what-if scenario for my finances" },
  { icon: TrendingUp, label: "Wealth Forecast", message: "What will my wealth be in 10 years?" },
];

// ── Markdown renderer ─────────────────────────────────────────────────────────
function md(raw: string, t: ThemeTokens): string {
  let s = raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  s = s.replace(/```[\w]*\n?([\s\S]*?)```/g,
    `<pre style="background:${t.bgInput};border:1px solid ${t.border};color:${t.text}" class="rounded-lg p-3 text-xs font-mono overflow-x-auto my-2 whitespace-pre-wrap">$1</pre>`);
  s = s.replace(/`([^`]+)`/g,
    `<code style="background:${t.bgInput};color:${t.text}" class="px-1.5 py-0.5 rounded text-xs font-mono">$1</code>`);
  s = s.replace(/^## (.+)$/gm,
    `<p style="color:${t.text}" class="text-[15px] font-semibold mt-3 mb-1 tracking-tight">$1</p>`);
  s = s.replace(/^### (.+)$/gm,
    `<p style="color:${t.textMuted}" class="text-[13px] font-semibold mt-2 mb-0.5 uppercase tracking-widest">$1</p>`);
  s = s.replace(/\*\*(.+?)\*\*/g, `<strong style="color:${t.text}" class="font-semibold">$1</strong>`);
  s = s.replace(/\*(.+?)\*/g, `<em class="italic">$1</em>`);
  s = s.replace(/(\|.+\|\r?\n)+/g, (block) => {
    const lines = block.trim().split(/\r?\n/).filter(l => !/^\|[-| :]+\|$/.test(l));
    if (!lines.length) return block;
    const row = (line: string, tag: string, hStyle: string, dStyle: string) =>
      `<tr>${line.split("|").slice(1, -1).map((c, i) =>
        `<${tag} style="${tag === "th" ? hStyle : dStyle}">${c.trim()}</${tag}>`).join("")}</tr>`;
    const [hdr, ...rows] = lines;
    return `<div style="border:1px solid ${t.border}" class="overflow-x-auto my-2.5 rounded-xl shadow-sm">
      <table class="w-full" style="background:${t.bgPanel}">
        <thead style="background:${t.bgInput}">${row(hdr, "th", `color:${t.textFaint};padding:8px 12px;text-align:left;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em`, "")}</thead>
        <tbody>${rows.map(r => row(r, "td", "", `color:${t.text};padding:8px 12px;font-size:13.5px;border-top:1px solid ${t.border}`)).join("")}</tbody>
      </table></div>`;
  });
  s = s.replace(/^[•\-\*] (.+)$/gm,
    `<li style="color:${t.textMuted}" class="ml-5 list-disc text-[13.5px] my-0.5">$1</li>`);
  s = s.replace(/^\d+\. (.+)$/gm,
    `<li style="color:${t.textMuted}" class="ml-5 list-decimal text-[13.5px] my-0.5">$1</li>`);
  s = s.replace(/(<li[^>]*>[\s\S]*?<\/li>\n?)+/g, m => `<ul class="my-1.5">${m}</ul>`);
  s = s.replace(/\n/g, "<br/>");
  s = s.replace(/(<br\/>)+(<\/?(?:p|ul|ol|li|div|pre|table))/g, "$2");
  s = s.replace(/(<\/(?:p|ul|ol|li|div|pre|table)>)(<br\/>)+/g, "$1");
  return s;
}

// ── Animated message IDs (never re-animate) ───────────────────────────────────
const animatedIds = new Set<string>();

// ── Typewriter + caret ────────────────────────────────────────────────────────
function MsgContent({ text, isUser, msgId, fontSize, onStream }: {
  text: string; isUser: boolean; msgId: string; fontSize: "sm" | "md" | "lg";
  onStream?: () => void;
}) {
  const { t } = useTh();
  const already = animatedIds.has(msgId);
  const [display, setDisplay] = useState(isUser || already ? text : "");
  const [streaming, setStreaming] = useState(!isUser && !already);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indexRef = useRef(0);

  const sizeClass = fontSize === "sm" ? "text-[13px]" : fontSize === "lg" ? "text-[16px]" : "text-[14.5px]";

  useEffect(() => {
    if (isUser || animatedIds.has(msgId)) { setDisplay(text); setStreaming(false); return; }
    animatedIds.add(msgId);
    indexRef.current = 0;
    setStreaming(true);
    const chunks = text.match(/\S+\s*|\s+/g) || [text];
    const step = () => {
      indexRef.current += 1;
      setDisplay(chunks.slice(0, indexRef.current).join(""));
      // BUG FIX (auto-scroll): the typewriter grows the message's height on
      // every chunk, long after the parent's [messages] effect already fired
      // once. Without re-triggering scroll here, the bottom of a streaming
      // reply runs past the visible area and auto-scroll silently stalls.
      onStream?.();
      if (indexRef.current < chunks.length) {
        timerRef.current = setTimeout(step, chunks.length > 150 ? 6 : 14);
      } else setStreaming(false);
    };
    step();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, msgId, isUser]);

  if (isUser) return (
    <p className={`${sizeClass} leading-relaxed`} style={{ color: t.textUser }}>{text}</p>
  );

  return (
    <div className={`${sizeClass} leading-[1.65] sf-serif`} style={{ color: t.text }}>
      <span dangerouslySetInnerHTML={{ __html: md(display, t) }} />
      {streaming && (
        <span className="inline-block w-[2px] h-[15px] ml-0.5 align-middle rounded-sm"
          style={{ backgroundColor: t.brand, animation: "sfCaret 0.85s ease-in-out infinite" }} />
      )}
    </div>
  );
}

// ── Thinking indicator ────────────────────────────────────────────────────────
const THINKING_PHRASES = [
  "Analysing your data…",
  "Reading your numbers…",
  "Connecting the dots…",
  "Thinking it through…",
  "Working out the details…",
  "Crunching the figures…",
];

function ThinkingIndicator() {
  const { t } = useTh();
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % THINKING_PHRASES.length), 1800);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex items-center gap-3 py-0.5">
      <div className="relative w-4 h-4 flex-shrink-0">
        <span className="absolute inset-0 rounded-full" style={{ border: `1.5px solid ${t.border}` }} />
        <span className="absolute inset-0 rounded-full"
          style={{ border: "1.5px solid transparent", borderTopColor: t.brand, animation: "sfSpin 0.85s linear infinite" }} />
      </div>
      <AnimatePresence mode="wait">
        <motion.span key={idx}
          initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.22 }}
          className="text-[13px] italic" style={{ color: t.textFaint }}>
          {THINKING_PHRASES[idx]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

// ── Sidebar panel ─────────────────────────────────────────────────────────────
type SidePanel = "history" | "settings" | "account" | null;

function Sidebar({ panel, setPanel, convs, activeId, loadConv, delConv, newChat, config, setConfig, userEmail }: {
  panel: SidePanel; setPanel: (p: SidePanel) => void;
  convs: AIConversation[]; activeId: string | null;
  loadConv: (id: string) => void; delConv: (id: string, e: React.MouseEvent) => void;
  newChat: () => void; config: AIConfig; setConfig: (c: AIConfig) => void;
  userEmail?: string;
}) {
  const { t, theme, toggle } = useTh();

  const navItems = [
    { id: "history" as SidePanel, icon: MessageSquare, label: "Chats" },
    { id: "settings" as SidePanel, icon: Settings, label: "Settings" },
    { id: "account" as SidePanel, icon: User, label: "Account" },
  ];

  return (
    <div className="flex h-full" style={{ borderRight: `1px solid ${t.border}` }}>
      {/* Icon rail */}
      <div className="w-14 flex flex-col items-center py-3 gap-1 flex-shrink-0"
        style={{ backgroundColor: t.bgSidebar, borderRight: `1px solid ${t.border}` }}>
        <button onClick={newChat}
          className="w-9 h-9 rounded-xl flex items-center justify-center mb-2 transition-all active:scale-95"
          style={{ background: `linear-gradient(135deg, ${t.brand}, ${t.brandLight})` }}
          title="New chat">
          <Plus size={16} className="text-white" />
        </button>
        {navItems.map(item => (
          <button key={item.id}
            onClick={() => setPanel(panel === item.id ? null : item.id)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{
              backgroundColor: panel === item.id ? t.bgHover : "transparent",
              color: panel === item.id ? t.brand : t.textFaint,
            }}
            title={item.label}>
            <item.icon size={16} />
          </button>
        ))}
        <div className="flex-1" />
        <button onClick={toggle}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
          style={{ color: t.textFaint }}
          title="Toggle theme">
          {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
        </button>
      </div>

      {/* Expanded panel */}
      <AnimatePresence>
        {panel && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 220, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden flex-shrink-0 flex flex-col"
            style={{ backgroundColor: t.bgSidebar }}>

            <div className="flex-1 overflow-y-auto min-w-[220px]">

              {/* History */}
              {panel === "history" && (
                <div className="p-3">
                  <p className="text-[10.5px] font-semibold uppercase tracking-widest mb-3 px-1"
                    style={{ color: t.textFaint }}>Conversations</p>
                  {convs.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare size={24} className="mx-auto mb-2 opacity-30" style={{ color: t.textFaint }} />
                      <p className="text-[12px]" style={{ color: t.textFaint }}>No conversations yet</p>
                    </div>
                  ) : convs.map(c => (
                    <div key={c.id} onClick={() => loadConv(c.id)}
                      className="flex items-start gap-2 px-2 py-2 rounded-lg cursor-pointer group mb-0.5 transition-colors"
                      style={{ backgroundColor: activeId === c.id ? t.bgHover : "transparent" }}>
                      <MessageSquare size={12} className="flex-shrink-0 mt-0.5" style={{ color: t.textFaint }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12.5px] truncate" style={{ color: t.text }}>{c.title}</p>
                        <p className="text-[10.5px]" style={{ color: t.textFaint }}>
                          {new Date(c.lastMessageAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                      <button onClick={e => delConv(c.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded transition-all"
                        style={{ color: t.textFaint }}>
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Settings */}
              {panel === "settings" && (
                <div className="p-3">
                  <p className="text-[10.5px] font-semibold uppercase tracking-widest mb-3 px-1"
                    style={{ color: t.textFaint }}>Preferences</p>

                  {/* Theme */}
                  <SettingRow label="Theme" icon={theme === "light" ? Sun : Moon} t={t}>
                    <ThemeToggle theme={theme} toggle={toggle} t={t} />
                  </SettingRow>

                  {/* Response length */}
                  <SettingRow label="Response length" icon={Sliders} t={t}>
                    <SelectSetting
                      value={config.responseLength}
                      options={[
                        { value: "concise", label: "Concise" },
                        { value: "balanced", label: "Balanced" },
                        { value: "detailed", label: "Detailed" },
                      ]}
                      onChange={v => setConfig({ ...config, responseLength: v as any })}
                      t={t}
                    />
                  </SettingRow>

                  {/* Font size */}
                  <SettingRow label="Font size" icon={Sliders} t={t}>
                    <SelectSetting
                      value={config.fontSize}
                      options={[
                        { value: "sm", label: "Small" },
                        { value: "md", label: "Medium" },
                        { value: "lg", label: "Large" },
                      ]}
                      onChange={v => setConfig({ ...config, fontSize: v as any })}
                      t={t}
                    />
                  </SettingRow>

                  {/* Language */}
                  <SettingRow label="Language" icon={Globe} t={t}>
                    <SelectSetting
                      value={config.language}
                      options={[
                        { value: "en", label: "English" },
                        { value: "hi", label: "हिन्दी" },
                        { value: "mr", label: "मराठी" },
                      ]}
                      onChange={v => setConfig({ ...config, language: v as any })}
                      t={t}
                    />
                  </SettingRow>

                  {/* Sound */}
                  <SettingRow label="Sound effects" icon={config.soundEnabled ? Volume2 : VolumeX} t={t}>
                    <Toggle
                      value={config.soundEnabled}
                      onChange={v => setConfig({ ...config, soundEnabled: v })}
                      t={t}
                    />
                  </SettingRow>

                  {/* Auto-scroll */}
                  <SettingRow label="Auto-scroll" icon={ChevronDown} t={t}>
                    <Toggle
                      value={config.autoScroll}
                      onChange={v => setConfig({ ...config, autoScroll: v })}
                      t={t}
                    />
                  </SettingRow>

                  <div className="mt-4 pt-3" style={{ borderTop: `1px solid ${t.border}` }}>
                    <button
                      onClick={() => setConfig(DEFAULT_CONFIG)}
                      className="w-full text-[12px] py-1.5 rounded-lg transition-colors"
                      style={{ color: t.textMuted, backgroundColor: t.bgInput }}>
                      Reset to defaults
                    </button>
                  </div>
                </div>
              )}

              {/* Account */}
              {panel === "account" && (
                <div className="p-3">
                  <p className="text-[10.5px] font-semibold uppercase tracking-widest mb-3 px-1"
                    style={{ color: t.textFaint }}>Account</p>
                  <div className="p-3 rounded-xl mb-3" style={{ backgroundColor: t.bgInput, border: `1px solid ${t.border}` }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
                      style={{ background: `linear-gradient(135deg, ${t.brand}, ${t.brandLight})` }}>
                      <User size={18} className="text-white" />
                    </div>
                    <p className="text-[13px] font-semibold" style={{ color: t.text }}>Gaurav Kumbhare</p>
                    <p className="text-[11.5px] mt-0.5" style={{ color: t.textFaint }}>{userEmail || "gaurav@smartfinance.app"}</p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.brand }} />
                      <span className="text-[11px]" style={{ color: t.brand }}>Pro plan</span>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    {[
                      { label: "Financial Profile", icon: User },
                      { label: "Billing & Plan", icon: CreditCard },
                      { label: "Notifications", icon: Activity },
                    ].map(item => (
                      <button key={item.label}
                        className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left transition-colors"
                        style={{ color: t.textMuted }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = t.bgHover}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                        <item.icon size={13} />
                        <span className="text-[12.5px] flex-1">{item.label}</span>
                        <ChevronRight size={12} style={{ color: t.textFaint }} />
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 pt-3" style={{ borderTop: `1px solid ${t.border}` }}>
                    <button className="w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-colors text-red-500"
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.08)"}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                      <LogOut size={13} />
                      <span className="text-[12.5px]">Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Setting sub-components ────────────────────────────────────────────────────
function SettingRow({ label, icon: Icon, t, children }: {
  label: string; icon: any; t: ThemeTokens; children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 px-1" style={{ borderBottom: `1px solid ${t.borderSubtle}` }}>
      <div className="flex items-center gap-2">
        <Icon size={13} style={{ color: t.textFaint }} />
        <span className="text-[12.5px]" style={{ color: t.textMuted }}>{label}</span>
      </div>
      {children}
    </div>
  );
}

function SelectSetting({ value, options, onChange, t }: {
  value: string; options: { value: string; label: string }[];
  onChange: (v: string) => void; t: ThemeTokens;
}) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="text-[11.5px] px-2 py-1 rounded-lg border outline-none cursor-pointer"
      style={{ backgroundColor: t.bgInput, color: t.text, borderColor: t.border }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function Toggle({ value, onChange, t }: { value: boolean; onChange: (v: boolean) => void; t: ThemeTokens }) {
  return (
    <button onClick={() => onChange(!value)}
      className="w-8 h-4 rounded-full flex items-center transition-all relative"
      style={{ backgroundColor: value ? t.brand : t.border }}>
      <span className="absolute w-3 h-3 rounded-full bg-white shadow-sm transition-all"
        style={{ left: value ? "calc(100% - 14px)" : "2px" }} />
    </button>
  );
}

function ThemeToggle({ theme, toggle, t }: { theme: Theme; toggle: () => void; t: ThemeTokens }) {
  return (
    <button onClick={toggle}
      className="flex items-center gap-1 px-2 py-1 rounded-lg border text-[11.5px] transition-colors"
      style={{ backgroundColor: t.bgInput, borderColor: t.border, color: t.text }}>
      {theme === "light" ? <Sun size={11} /> : <Moon size={11} />}
      {theme === "light" ? "Light" : "Dark"}
    </button>
  );
}

// ── Welcome screen ────────────────────────────────────────────────────────────
function WelcomeScreen({ send, t, fontSize }: {
  send: (msg: string) => void; t: ThemeTokens; fontSize: "sm" | "md" | "lg";
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
          style={{ background: `linear-gradient(135deg, ${t.brand}, ${t.brandLight})` }}>
          <Logo size={24} />
        </div>
        <h2 className="text-[20px] font-semibold text-center mb-1 tracking-tight" style={{ color: t.text }}>
          SmartFinance AI
        </h2>
        <p className="text-[13.5px] text-center mb-8" style={{ color: t.textMuted }}>
          Your personal Indian wealth advisor
        </p>
        <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto">
          {QUICK_ACTIONS.map(qa => (
            <button key={qa.label} type="button" onClick={() => send(qa.message)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-center active:scale-95 group"
              style={{ backgroundColor: t.bgPanel, borderColor: t.border }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = t.brand;
                e.currentTarget.style.backgroundColor = t.bgHover;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = t.border;
                e.currentTarget.style.backgroundColor = t.bgPanel;
              }}>
              <qa.icon size={16} style={{ color: t.textFaint }} />
              <span className="text-[11px] font-medium leading-tight" style={{ color: t.textMuted }}>
                {qa.label}
              </span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
interface Props { inline?: boolean }

function AIAssistantInner({ inline = false }: Props) {
  const { t } = useTh();

  const [open, setOpen]         = useState(inline);
  const [convs, setConvs]       = useState<AIConversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [sidePanel, setSidePanel] = useState<SidePanel>(null);
  const [config, setConfig]     = useState<AIConfig>(DEFAULT_CONFIG);

  const endRef     = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLTextAreaElement>(null);
  const activeIdRef = useRef<string | null>(null);
  const loadingRef  = useRef(false);
  const autoScrollRef = useRef(true);
  const userScrolledUpRef = useRef(false);
  activeIdRef.current = activeId;
  loadingRef.current  = loading;
  autoScrollRef.current = config.autoScroll;

  // Stable scroll fn — called once per new message AND on every streamed
  // chunk (via MsgContent's onStream), so the view tracks growing content
  // instead of snapping once and falling behind.
  // Skips if the user has manually scrolled up to re-read earlier text —
  // otherwise a streaming reply yanks them back down on every word.
  function scrollToBottom(smooth = true) {
    if (!autoScrollRef.current) return;
    if (userScrolledUpRef.current) return;
    endRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  }

  // Track whether the user is near the bottom of the scroll container.
  // A new user-sent message always resets this (they expect to see their
  // own message + the reply), but during streaming we respect their scroll.
  function handleScroll() {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    userScrolledUpRef.current = distanceFromBottom > 120;
  }

  useEffect(() => {
    if (open) { fetchConvs(); setTimeout(() => inputRef.current?.focus(), 150); }
  }, [open]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Auto-resize textarea
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [input]);

  async function fetchConvs() {
    try {
      const res = await aiAPI.listConversations();
      setConvs(res.data.conversations || []);
    } catch {}
  }

  async function loadConv(id: string) {
    setActiveId(id);
    setSidePanel(null);
    setError(null);
    try {
      const res = await aiAPI.getConversation(id);
      setMessages(res.data.messages || []);
    } catch (e: any) {
      setError(e.message || "Could not load conversation");
    }
  }

  async function send(text: string, retryId?: string) {
    const msg = text.trim();
    if (!msg || loadingRef.current) return;
    setError(null);
    setLoading(true);
    setSidePanel(null);
    userScrolledUpRef.current = false; // sending a message always snaps back to bottom

    // If this is a retry of a failed message, remove the old failed bubble
    // first so we don't end up with two copies of the same message.
    if (retryId) setMessages(prev => prev.filter(m => m.id !== retryId));

    const tempId = `tmp-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: tempId, role: "user" as const, content: msg,
      createdAt: new Date().toISOString(),
    }]);
    // Clear the composer only after the message is committed to the thread —
    // if the request fails below we restore it instead of losing the draft.
    setInput("");

    try {
      const res = await aiAPI.chat(msg, activeIdRef.current || undefined);
      const { conversationId, messageId, content } = res.data;
      if (!activeIdRef.current) { setActiveId(conversationId); fetchConvs(); }
      setMessages(prev => [
        ...prev.filter(m => m.id !== tempId),
        { id: `u-${messageId}`, role: "user" as const,     content: msg, createdAt: new Date().toISOString() },
        { id: messageId,        role: "assistant" as const, content,      createdAt: new Date().toISOString() },
      ]);
    } catch (e: any) {
      // BUG FIX: previously this deleted the user's just-sent message AND the
      // input was already cleared, so a failed send (bad network, server
      // hiccup) silently erased what the user typed with no way to retry.
      // Now: keep the message visible, mark it failed, restore the draft so
      // they can edit/resend without retyping from scratch.
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, failed: true } : m));
      setInput(msg);
      setError(
        e.code === "PROFILE_INCOMPLETE" || e.status === 403
          ? "Complete your financial profile in Settings to use the AI advisor."
          : e.status === 401 ? "Please sign in to continue."
          : e.status === 0  ? "Can't reach the server — check your connection."
          : e.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }

  function newChat() {
    setActiveId(null);
    setMessages([]);
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
    } catch (err: any) { setError(err.message); }
  }

  const panelCls = inline
    ? "w-full flex flex-col overflow-hidden rounded-2xl"
    : "fixed inset-0 z-50 flex flex-col overflow-hidden"; // always full-screen, ChatGPT-style

  const panel = (
    <div className={panelCls}
      style={{
        backgroundColor: t.bg,
        border: inline ? `1px solid ${t.border}` : "none",
        minHeight: inline ? 560 : undefined,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}>

      {/* Fonts + keyframes.
          Inter = UI sans (headers, labels, buttons) — closest free match to
          Claude's Styrene. Source Serif 4 = assistant message body text —
          closest free match to Claude's Tiempos. Scoped to .sf-serif so the
          rest of the UI (buttons, labels, sidebar) stays on the sans. */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,500&display=swap');
        @keyframes sfCaret { 0%,49%{opacity:1} 50%,100%{opacity:0} }
        @keyframes sfSpin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .sf-serif { font-family: 'Source Serif 4', Georgia, serif; }
      `}</style>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <Sidebar
          panel={sidePanel} setPanel={setSidePanel}
          convs={convs} activeId={activeId}
          loadConv={loadConv} delConv={delConv} newChat={newChat}
          config={config} setConfig={setConfig}
        />

        {/* Main chat area */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
            style={{ borderBottom: `1px solid ${t.border}`, backgroundColor: t.bgPanel }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${t.brand}, ${t.brandLight})` }}>
              <Logo size={13} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13.5px] font-semibold tracking-tight" style={{ color: t.text }}>
                {messages.length > 0 && convs.find(c => c.id === activeId)?.title || "SmartFinance AI"}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {!inline && (
                <button onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg transition-colors" style={{ color: t.textFaint }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = t.bgHover}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex-shrink-0 mx-4 mt-3 p-3 rounded-xl flex items-start gap-2"
              style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="flex-1 text-[12.5px] text-red-600 leading-relaxed">{error}</p>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                <X size={13} />
              </button>
            </div>
          )}

          {/* Messages or welcome */}
          {messages.length === 0 && !loading ? (
            <WelcomeScreen send={send} t={t} fontSize={config.fontSize} />
          ) : (
            <div ref={scrollContainerRef} onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-6 py-5 space-y-6 min-h-0" style={{ backgroundColor: t.bg }}>
              {messages.map((msg, i) => (
                <motion.div key={msg.id}
                  initial={i >= messages.length - 2 ? { opacity: 0, y: 8 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}>

                  {msg.role === "user" ? (
                    /* User message — right-aligned, subtle tinted background, no bubble shape */
                    <div className="flex justify-end">
                      <div className="max-w-[75%]">
                        <p className="text-[10.5px] text-right mb-1 uppercase tracking-widest" style={{ color: t.textFaint }}>You</p>
                        <div className="px-4 py-3 rounded-xl" style={{
                          backgroundColor: t.bgUserMsg,
                          border: msg.failed ? "1px solid rgba(239,68,68,0.4)" : undefined,
                        }}>
                          <MsgContent text={msg.content} isUser msgId={msg.id} fontSize={config.fontSize} />
                        </div>
                        {msg.failed && (
                          <div className="flex items-center justify-end gap-2 mt-1">
                            <span className="text-[11px] text-red-500">Failed to send</span>
                            <button type="button" onClick={() => send(msg.content, msg.id)}
                              className="text-[11px] font-medium underline" style={{ color: t.brand }}>
                              Retry
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Assistant message — full width, no bubble, just text with avatar */
                    <div className="flex gap-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm"
                        style={{ background: `linear-gradient(135deg, ${t.brand}, ${t.brandLight})` }}>
                        <Logo size={12} />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="text-[10.5px] mb-1 uppercase tracking-widest" style={{ color: t.textFaint }}>SmartFinance AI</p>
                        <MsgContent text={msg.content} isUser={false} msgId={msg.id} fontSize={config.fontSize}
                          onStream={() => scrollToBottom(false)} />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}

              {loading && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                  className="flex gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm"
                    style={{ background: `linear-gradient(135deg, ${t.brand}, ${t.brandLight})` }}>
                    <Logo size={12} />
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p className="text-[10.5px] mb-1 uppercase tracking-widest" style={{ color: t.textFaint }}>SmartFinance AI</p>
                    <ThinkingIndicator />
                  </div>
                </motion.div>
              )}
              <div ref={endRef} />
            </div>
          )}

          {/* Topic chips when mid-conversation */}
          {messages.length > 0 && !loading && (
            <div className="flex-shrink-0 px-4 py-2 overflow-x-auto flex gap-2"
              style={{ borderTop: `1px solid ${t.borderSubtle}`, backgroundColor: t.bgPanel }}>
              {QUICK_ACTIONS.slice(0, 6).map(qa => (
                <button key={qa.label} type="button" onClick={() => send(qa.message)} disabled={loading}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11.5px] font-medium border transition-all disabled:opacity-40"
                  style={{ color: t.textMuted, borderColor: t.border, backgroundColor: t.bgInput }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = t.brand; e.currentTarget.style.color = t.brand; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.textMuted; }}>
                  <qa.icon size={11} />
                  {qa.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex-shrink-0 px-4 py-3" style={{ borderTop: `1px solid ${t.border}`, backgroundColor: t.bgPanel }}>
            <div className="flex gap-3 items-end">
              <div className="flex-1 rounded-xl border transition-all overflow-hidden"
                style={{ backgroundColor: t.bgInput, borderColor: t.border }}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
                  }}
                  placeholder="Ask about your finances… (Shift+Enter for new line)"
                  disabled={loading}
                  rows={1}
                  className="w-full px-4 py-3 text-[13.5px] outline-none resize-none bg-transparent disabled:opacity-60 leading-relaxed"
                  style={{ color: t.text, maxHeight: "120px" }}
                  onFocus={e => {
                    const parent = e.currentTarget.parentElement!;
                    parent.style.borderColor = t.brand;
                    parent.style.boxShadow = `0 0 0 3px ${t.brand}18`;
                  }}
                  onBlur={e => {
                    const parent = e.currentTarget.parentElement!;
                    parent.style.borderColor = t.border;
                    parent.style.boxShadow = "none";
                  }}
                />
              </div>
              <button type="button" onClick={() => send(input)}
                disabled={!input.trim() || loading}
                className="w-10 h-10 rounded-xl text-white flex items-center justify-center disabled:opacity-30 transition-all active:scale-95 flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${t.brand}, ${t.brandLight})` }}>
                {loading
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" style={{ animation: "sfSpin 0.85s linear infinite" }} />
                  : <Send size={14} />
                }
              </button>
            </div>
            <p className="text-[10.5px] text-center mt-2 uppercase tracking-wide" style={{ color: t.textFaint }}>
              AI Financial Advisor · Indian Context · Not Financial Advice
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (inline) return panel;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div key="sf-panel"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}>
            {panel}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB hidden while the full-screen panel is open — no reason to show
          an "open chat" bubble floating on top of the chat that's already open. */}
      {!open && (
        <motion.button onClick={() => { setOpen(true); setError(null); }}
          whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full text-white shadow-xl flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${t.brand}, ${t.brandLight})` }}
          aria-label="Open AI assistant">
          <Logo size={22} />
        </motion.button>
      )}
    </>
  );
}

// ── Wrap with theme provider ──────────────────────────────────────────────────
export function AIAssistant({ inline = false }: Props) {
  const [theme, setTheme] = useState<Theme>(() => {
    try { return (localStorage.getItem("sf-theme") as Theme) || "light"; } catch { return "light"; }
  });

  const toggle = () => setTheme(prev => {
    const next = prev === "light" ? "dark" : "light";
    try { localStorage.setItem("sf-theme", next); } catch {}
    return next;
  });

  return (
    <ThemeCtx.Provider value={{ theme, t: THEMES[theme], toggle }}>
      <AIAssistantInner inline={inline} />
    </ThemeCtx.Provider>
  );
}